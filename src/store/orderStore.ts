import { create } from 'zustand';
import { OrderService } from '../services/orderService';
import { 
  saveOrderToLocalStorage, 
  getOrdersFromLocalStorage, 
  updateOrderInLocalStorage,
  removeOrderFromLocalStorage 
} from '../utils/orderUtils';
import { syncCustomerFromOrder } from '../utils/customerSyncUtils';
import type { 
  Order, 
  OrderFilters, 
  OrderStatusUpdate, 
  OrderAnalytics
} from '../types/order';

interface OrderState {
  // State
  orders: Order[];
  customerOrders: Order[]; // From localStorage
  currentOrder: Order | null;
  analytics: OrderAnalytics | null;
  isLoading: boolean;
  error: string | null;
  unsubscribe: (() => void) | null;
  analyticsUnsubscribe: (() => void) | null;
  lastFetchTime: number | null;
  lastFilters: OrderFilters | null;

  // Actions
  fetchOrders: (filters?: OrderFilters) => Promise<void>;
  fetchOrder: (orderId: string) => Promise<Order | null>;
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateOrderStatus: (orderId: string, statusUpdate: OrderStatusUpdate) => Promise<void>;
  updateOrder: (orderId: string, updateData: Partial<Order>) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  searchOrders: (searchTerm: string) => Promise<Order[]>;
  fetchAnalytics: () => Promise<void>;
  
  // Customer orders (localStorage)
  loadCustomerOrders: () => void;
  syncOrderWithLocalStorage: (order: Order) => void;
  updateCustomerOrder: (orderId: string, updates: Partial<Order>) => void;
  removeCustomerOrder: (orderId: string) => void;
  
  // Real-time subscriptions
  subscribeToOrders: (filters?: OrderFilters) => void;
  subscribeToAnalytics: () => void;
  unsubscribeFromOrders: () => void;
  
  // Utility actions
  clearError: () => void;
  setCurrentOrder: (order: Order | null) => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  // Initial state
  orders: [],
  customerOrders: [],
  currentOrder: null,
  analytics: null,
  isLoading: false,
  error: null,
  unsubscribe: null,
  analyticsUnsubscribe: null,
  lastFetchTime: null,
  lastFilters: null,

  // Fetch all orders with filters
  fetchOrders: async (filters) => {
    const { lastFetchTime, lastFilters } = get();
    const now = Date.now();
    
    // Check if we have recent data (within 5 seconds) and same filters
    if (lastFetchTime && (now - lastFetchTime) < 5000 && 
        JSON.stringify(lastFilters) === JSON.stringify(filters)) {
      console.log('OrderStore: Using cached data, skipping fetch');
      return;
    }
    
    set({ isLoading: true, error: null });
    try {
      const orders = await OrderService.getOrders(filters);
      set({ 
        orders, 
        isLoading: false, 
        lastFetchTime: now,
        lastFilters: filters 
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch orders',
        isLoading: false 
      });
    }
  },

  // Fetch single order
  fetchOrder: async (orderId) => {
    set({ isLoading: true, error: null });
    try {
      const order = await OrderService.getOrder(orderId);
      if (order) {
        set({ currentOrder: order, isLoading: false });
        // Sync with localStorage if it's a customer order
        get().syncOrderWithLocalStorage(order);
      }
      return order;
    } catch (error) {
      console.error('Error fetching order:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch order',
        isLoading: false 
      });
      return null;
    }
  },

  // Create new order
  createOrder: async (orderData) => {
    set({ isLoading: true, error: null });
    try {
      const orderId = await OrderService.createOrder(orderData);
      
      // Fetch the created order to get full data
      const createdOrder = await OrderService.getOrder(orderId);
      if (createdOrder) {
        // Add to orders list
        set(state => ({ 
          orders: [createdOrder, ...state.orders],
          isLoading: false 
        }));
        
        // Save to localStorage for customer
        saveOrderToLocalStorage(createdOrder);
        
        // Update customer orders in store
        get().loadCustomerOrders();
        
        // Note: Customer sync will happen when order is marked as delivered
        // This ensures only completed orders count towards customer stats and revenue
      }
      
      return orderId;
    } catch (error) {
      console.error('Error creating order:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create order',
        isLoading: false 
      });
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, statusUpdate) => {
    set({ isLoading: true, error: null });
    try {
      await OrderService.updateOrderStatus(orderId, statusUpdate);
      
      // Update in local state
      set(state => ({
        orders: state.orders.map(order => 
          order.id === orderId 
            ? { ...order, status: statusUpdate.status, updatedAt: new Date().toISOString() }
            : order
        ),
        isLoading: false
      }));
      
      // Update in localStorage
      updateOrderInLocalStorage(orderId, { 
        status: statusUpdate.status, 
        updatedAt: new Date().toISOString() 
      });
      
      // Update customer orders in store
      get().loadCustomerOrders();
      
      // If order is delivered, sync customer data
      if (statusUpdate.status === 'delivered') {
        try {
            const updatedOrder = get().orders.find((order: Order) => order.id === orderId);
          if (updatedOrder) {
            console.log('OrderStore: Order delivered, syncing customer data for order:', updatedOrder.id);
            await syncCustomerFromOrder(updatedOrder);
            console.log('OrderStore: Customer synced successfully after delivery');
          }
        } catch (syncError) {
          console.error('OrderStore: Error syncing customer after delivery (non-blocking):', syncError);
          // Don't throw error for customer sync failure - order status update should still succeed
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update order status',
        isLoading: false 
      });
    }
  },

  // Update order
  updateOrder: async (orderId, updateData) => {
    set({ isLoading: true, error: null });
    try {
      await OrderService.updateOrder(orderId, updateData);
      
      // Update in local state
      set(state => ({
        orders: state.orders.map(order => 
          order.id === orderId 
            ? { ...order, ...updateData, updatedAt: new Date().toISOString() }
            : order
        ),
        isLoading: false
      }));
      
      // Update in localStorage
      updateOrderInLocalStorage(orderId, { 
        ...updateData, 
        updatedAt: new Date().toISOString() 
      });
      
      // Update customer orders in store
      get().loadCustomerOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update order',
        isLoading: false 
      });
    }
  },

  // Delete order
  deleteOrder: async (orderId) => {
    set({ isLoading: true, error: null });
    try {
      await OrderService.deleteOrder(orderId);
      
      // Remove from local state
      set(state => ({
        orders: state.orders.filter(order => order.id !== orderId),
        isLoading: false
      }));
      
      // Remove from localStorage
      removeOrderFromLocalStorage(orderId);
      
      // Update customer orders in store
      get().loadCustomerOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete order',
        isLoading: false 
      });
    }
  },

  // Search orders
  searchOrders: async (searchTerm) => {
    set({ isLoading: true, error: null });
    try {
      const orders = await OrderService.searchOrders(searchTerm);
      set({ orders, isLoading: false });
      return orders;
    } catch (error) {
      console.error('Error searching orders:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to search orders',
        isLoading: false 
      });
      return [];
    }
  },

  // Fetch analytics
  fetchAnalytics: async () => {
    set({ isLoading: true, error: null });
    try {
      const analytics = await OrderService.getOrderAnalytics();
      set({ analytics, isLoading: false });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch analytics',
        isLoading: false 
      });
    }
  },

  // Load customer orders from localStorage
  loadCustomerOrders: () => {
    try {
      const customerOrders = getOrdersFromLocalStorage()
        .sort((a, b) => {
          // Sort by creation date, most recent first
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA; // Descending order (newest first)
        });
      set({ customerOrders });
    } catch (error) {
      console.error('Error loading customer orders:', error);
    }
  },

  // Sync order with localStorage
  syncOrderWithLocalStorage: (order) => {
    try {
      saveOrderToLocalStorage(order);
      get().loadCustomerOrders();
    } catch (error) {
      console.error('Error syncing order with localStorage:', error);
    }
  },

  // Update customer order in localStorage
  updateCustomerOrder: (orderId, updates) => {
    try {
      updateOrderInLocalStorage(orderId, updates);
      get().loadCustomerOrders();
    } catch (error) {
      console.error('Error updating customer order:', error);
    }
  },

  // Remove customer order from localStorage
  removeCustomerOrder: (orderId) => {
    try {
      removeOrderFromLocalStorage(orderId);
      get().loadCustomerOrders();
    } catch (error) {
      console.error('Error removing customer order:', error);
    }
  },

  // Real-time subscriptions
  subscribeToOrders: (filters) => {
    const { unsubscribe } = get();
    
    // Clean up existing subscription
    if (unsubscribe) {
      unsubscribe();
    }
    
    set({ isLoading: true, error: null });
    
    const newUnsubscribe = OrderService.subscribeToOrders((orders) => {
      console.log('OrderStore: Real-time order update received:', orders.length, 'orders');
      set({ orders, isLoading: false, error: null });
    }, filters);
    
    set({ unsubscribe: newUnsubscribe });
  },

  subscribeToAnalytics: () => {
    const { analyticsUnsubscribe } = get();
    
    // Clean up existing analytics subscription
    if (analyticsUnsubscribe) {
      analyticsUnsubscribe();
    }
    
    const newAnalyticsUnsubscribe = OrderService.subscribeToOrderAnalytics((analytics) => {
      console.log('OrderStore: Real-time analytics update received');
      set({ analytics });
    });
    
    set({ analyticsUnsubscribe: newAnalyticsUnsubscribe });
  },

  unsubscribeFromOrders: () => {
    const { unsubscribe, analyticsUnsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null });
    }
    if (analyticsUnsubscribe) {
      analyticsUnsubscribe();
      set({ analyticsUnsubscribe: null });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Set current order
  setCurrentOrder: (order) => set({ currentOrder: order }),
}));