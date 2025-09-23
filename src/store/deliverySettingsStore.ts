import { create } from 'zustand';
import { DeliverySettingsService } from '../services/deliverySettingsService';
import type { DeliverySettings, DeliverySettingsFormData, LocationValidationResult } from '../types/deliverySettings';

interface DeliverySettingsStore {
  // State
  settings: DeliverySettings[];
  activeSettings: DeliverySettings | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchSettings: () => Promise<void>;
  fetchActiveSettings: () => Promise<void>;
  addSettings: (settingsData: DeliverySettingsFormData) => Promise<void>;
  updateSettings: (id: string, settingsData: Partial<DeliverySettingsFormData>) => Promise<void>;
  deleteSettings: (id: string) => Promise<void>;
  toggleSettingsStatus: (id: string, isActive: boolean) => Promise<void>;
  validateLocation: (
    userLatitude: number,
    userLongitude: number,
    restaurantLatitude: number,
    restaurantLongitude: number,
    deliveryRadius: number
  ) => LocationValidationResult;
  clearError: () => void;
}

export const useDeliverySettingsStore = create<DeliverySettingsStore>((set, get) => ({
  // Initial state
  settings: [],
  activeSettings: null,
  isLoading: false,
  error: null,

  // Fetch all delivery settings
  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const settings = await DeliverySettingsService.getDeliverySettings();
      set({ settings, isLoading: false });
    } catch (error) {
      console.error('Error fetching delivery settings:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch delivery settings',
        isLoading: false 
      });
    }
  },

  // Fetch active delivery settings
  fetchActiveSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const activeSettings = await DeliverySettingsService.getActiveDeliverySettings();
      set({ activeSettings, isLoading: false });
    } catch (error) {
      console.error('Error fetching active delivery settings:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch active delivery settings',
        isLoading: false 
      });
    }
  },

  // Add new delivery settings
  addSettings: async (settingsData: DeliverySettingsFormData) => {
    set({ isLoading: true, error: null });
    try {
      await DeliverySettingsService.addDeliverySettings(settingsData);
      // Refresh the settings list
      await get().fetchSettings();
      set({ isLoading: false });
    } catch (error) {
      console.error('Error adding delivery settings:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add delivery settings',
        isLoading: false 
      });
    }
  },

  // Update delivery settings
  updateSettings: async (id: string, settingsData: Partial<DeliverySettingsFormData>) => {
    set({ isLoading: true, error: null });
    try {
      await DeliverySettingsService.updateDeliverySettings(id, settingsData);
      // Refresh the settings list
      await get().fetchSettings();
      // Refresh active settings if this was the active one
      const { activeSettings } = get();
      if (activeSettings?.id === id) {
        await get().fetchActiveSettings();
      }
      set({ isLoading: false });
    } catch (error) {
      console.error('Error updating delivery settings:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update delivery settings',
        isLoading: false 
      });
    }
  },

  // Delete delivery settings
  deleteSettings: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await DeliverySettingsService.deleteDeliverySettings(id);
      // Refresh the settings list
      await get().fetchSettings();
      // Clear active settings if this was the active one
      const { activeSettings } = get();
      if (activeSettings?.id === id) {
        set({ activeSettings: null });
      }
      set({ isLoading: false });
    } catch (error) {
      console.error('Error deleting delivery settings:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete delivery settings',
        isLoading: false 
      });
    }
  },

  // Toggle delivery settings status
  toggleSettingsStatus: async (id: string, isActive: boolean) => {
    set({ isLoading: true, error: null });
    try {
      await DeliverySettingsService.toggleDeliverySettingsStatus(id, isActive);
      // Refresh the settings list
      await get().fetchSettings();
      // Refresh active settings
      await get().fetchActiveSettings();
      set({ isLoading: false });
    } catch (error) {
      console.error('Error toggling delivery settings status:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to toggle delivery settings status',
        isLoading: false 
      });
    }
  },

  // Validate location against delivery radius
  validateLocation: (
    userLatitude: number,
    userLongitude: number,
    restaurantLatitude: number,
    restaurantLongitude: number,
    deliveryRadius: number
  ) => {
    return DeliverySettingsService.validateLocation(
      userLatitude,
      userLongitude,
      restaurantLatitude,
      restaurantLongitude,
      deliveryRadius
    );
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
