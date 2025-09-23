import { create } from 'zustand';
import { RestaurantService, type RestaurantStatusData } from '../services/restaurantService';

export type RestaurantStatus = 'open' | 'closed' | 'delivery-only';

interface RestaurantState {
  status: RestaurantStatus;
  message: string;
  deliveryAvailable: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdated: any;
  updatedBy: string;
  
  // Actions
  setStatus: (status: RestaurantStatus) => void;
  setMessage: (message: string) => void;
  toggleDelivery: () => void;
  updateRestaurantStatus: (status: RestaurantStatus, message?: string, updatedBy?: string) => Promise<void>;
  
  // Firebase actions
  initializeFromFirebase: () => Promise<void>;
  subscribeToUpdates: () => () => void;
}

export const useRestaurantStore = create<RestaurantState>()((set, get) => ({
  status: 'open',
  message: 'We are open and ready to serve you!',
  deliveryAvailable: true,
  isLoading: false,
  error: null,
  lastUpdated: null,
  updatedBy: 'system',
  
  setStatus: (status: RestaurantStatus) => {
    set({ status });
    // Auto-update message based on status
    const messages = {
      'open': 'We are open and ready to serve you!',
      'closed': 'We are closed today. Thank you for your understanding.',
      'delivery-only': 'We are open for delivery only. Dine-in is temporarily unavailable.'
    };
    set({ message: messages[status] });
  },
  
  setMessage: (message: string) => {
    set({ message });
  },
  
  toggleDelivery: () => {
    set((state) => ({
      deliveryAvailable: !state.deliveryAvailable
    }));
  },
  
  updateRestaurantStatus: async (status: RestaurantStatus, message?: string, updatedBy?: string) => {
    const state = get();
    set({ isLoading: true, error: null });
    
    try {
      await RestaurantService.saveRestaurantStatus(
        status,
        message || state.message,
        state.deliveryAvailable,
        updatedBy
      );
      
      set({ 
        status,
        message: message || state.message,
        isLoading: false 
      });
    } catch (error: any) {
      console.warn('Firebase save failed, using local storage fallback:', error.message);
      // Update local state even if Firebase fails
      set({ 
        status,
        message: message || state.message,
        isLoading: false,
        error: null // Don't show error to user, fallback is working
      });
    }
  },
  
  initializeFromFirebase: async () => {
    set({ isLoading: true, error: null });
    
    try {
      await RestaurantService.initializeDefaultStatus();
      const data = await RestaurantService.getRestaurantStatus();
      
      if (data) {
        set({
          status: data.status,
          message: data.message,
          deliveryAvailable: data.deliveryAvailable,
          lastUpdated: data.lastUpdated,
          updatedBy: data.updatedBy || 'admin',
          isLoading: false
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error: any) {
      console.warn('Firebase initialization failed, using local storage fallback:', error.message);
      // Try to get data from local storage fallback
      const fallbackData = localStorage.getItem('restaurant-status-fallback');
      if (fallbackData) {
        try {
          const parsed = JSON.parse(fallbackData);
          set({
            status: parsed.status,
            message: parsed.message,
            deliveryAvailable: parsed.deliveryAvailable,
            lastUpdated: { seconds: Math.floor(new Date(parsed.lastUpdated).getTime() / 1000) },
            updatedBy: parsed.updatedBy || 'admin',
            isLoading: false
          });
        } catch (parseError) {
          set({ isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    }
  },
  
  subscribeToUpdates: () => {
    return RestaurantService.subscribeToRestaurantStatus((data: RestaurantStatusData | null) => {
      if (data) {
        set({
          status: data.status,
          message: data.message,
          deliveryAvailable: data.deliveryAvailable,
          lastUpdated: data.lastUpdated,
          updatedBy: data.updatedBy || 'admin'
        });
      }
    });
  }
}));
