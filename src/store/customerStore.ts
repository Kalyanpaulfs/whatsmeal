import { create } from 'zustand';
import { CustomerService } from '../services/customerService';
import type { 
  Customer, 
  CustomerFilters, 
  CustomerAnalytics, 
  CustomerUpdateData,
  CustomerInsights,
  CustomerStats
} from '../types/customer';

interface CustomerState {
  // State
  customers: Customer[];
  currentCustomer: Customer | null;
  analytics: CustomerAnalytics | null;
  insights: CustomerInsights | null;
  stats: CustomerStats | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCustomers: (filters?: CustomerFilters) => Promise<void>;
  fetchCustomer: (customerId: string) => Promise<Customer | null>;
  updateCustomer: (customerId: string, updateData: CustomerUpdateData) => Promise<void>;
  deleteCustomer: (customerId: string) => Promise<void>;
  searchCustomers: (searchTerm: string) => Promise<Customer[]>;
  fetchAnalytics: () => Promise<void>;
  fetchInsights: () => Promise<void>;
  fetchStats: () => Promise<void>;
  
  // Sync functions
  syncCustomerFromOrder: (order: any) => Promise<void>;
  syncAllCustomersFromOrders: () => Promise<void>;
  
  // Utility actions
  clearError: () => void;
  setCurrentCustomer: (customer: Customer | null) => void;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  // Initial state
  customers: [],
  currentCustomer: null,
  analytics: null,
  insights: null,
  stats: null,
  isLoading: false,
  error: null,

  // Fetch all customers with filters
  fetchCustomers: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const customers = await CustomerService.getCustomers(filters);
      set({ customers, isLoading: false });
    } catch (error) {
      console.error('Error fetching customers:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch customers',
        isLoading: false 
      });
    }
  },

  // Fetch single customer
  fetchCustomer: async (customerId) => {
    set({ isLoading: true, error: null });
    try {
      const customer = await CustomerService.getCustomer(customerId);
      if (customer) {
        set({ currentCustomer: customer, isLoading: false });
      }
      return customer;
    } catch (error) {
      console.error('Error fetching customer:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch customer',
        isLoading: false 
      });
      return null;
    }
  },

  // Update customer
  updateCustomer: async (customerId, updateData) => {
    set({ isLoading: true, error: null });
    try {
      await CustomerService.updateCustomer(customerId, updateData);
      
      // Update in local state
      set(state => ({
        customers: state.customers.map(customer => 
          customer.id === customerId 
            ? { ...customer, ...updateData, updatedAt: new Date().toISOString() }
            : customer
        ),
        currentCustomer: state.currentCustomer?.id === customerId 
          ? { ...state.currentCustomer, ...updateData, updatedAt: new Date().toISOString() }
          : state.currentCustomer,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating customer:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update customer',
        isLoading: false 
      });
    }
  },

  // Delete customer
  deleteCustomer: async (customerId) => {
    set({ isLoading: true, error: null });
    try {
      await CustomerService.deleteCustomer(customerId);
      
      // Remove from local state
      set(state => ({
        customers: state.customers.filter(customer => customer.id !== customerId),
        currentCustomer: state.currentCustomer?.id === customerId ? null : state.currentCustomer,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting customer:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete customer',
        isLoading: false 
      });
    }
  },

  // Search customers
  searchCustomers: async (searchTerm) => {
    set({ isLoading: true, error: null });
    try {
      const customers = await CustomerService.searchCustomers(searchTerm);
      set({ customers, isLoading: false });
      return customers;
    } catch (error) {
      console.error('Error searching customers:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to search customers',
        isLoading: false 
      });
      return [];
    }
  },

  // Fetch analytics
  fetchAnalytics: async () => {
    set({ isLoading: true, error: null });
    try {
      const analytics = await CustomerService.getCustomerAnalytics();
      set({ analytics, isLoading: false });
    } catch (error) {
      console.error('Error fetching customer analytics:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch analytics',
        isLoading: false 
      });
    }
  },

  // Fetch insights
  fetchInsights: async () => {
    set({ isLoading: true, error: null });
    try {
      const insights = await CustomerService.getCustomerInsights();
      set({ insights, isLoading: false });
    } catch (error) {
      console.error('Error fetching customer insights:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch insights',
        isLoading: false 
      });
    }
  },

  // Fetch stats
  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const analytics = await CustomerService.getCustomerAnalytics();
      const stats: CustomerStats = {
        totalCustomers: analytics.totalCustomers,
        vipCustomers: analytics.vipCustomers,
        blockedCustomers: analytics.blockedCustomers,
        newCustomersThisWeek: analytics.newCustomersThisWeek,
        newCustomersThisMonth: analytics.newCustomersThisMonth,
        totalRevenue: analytics.totalRevenue,
        averageOrderValue: analytics.averageOrderValue,
      };
      set({ stats, isLoading: false });
    } catch (error) {
      console.error('Error fetching customer stats:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch stats',
        isLoading: false 
      });
    }
  },

  // Sync customer from order
  syncCustomerFromOrder: async (order) => {
    try {
      await CustomerService.syncCustomerFromOrder(order);
      // Refresh customers list
      get().fetchCustomers();
    } catch (error) {
      console.error('Error syncing customer from order:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to sync customer from order'
      });
    }
  },

  // Sync all customers from orders
  syncAllCustomersFromOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      await CustomerService.syncAllCustomersFromOrders();
      // Refresh customers list and analytics
      await Promise.all([
        get().fetchCustomers(),
        get().fetchAnalytics(),
        get().fetchInsights(),
        get().fetchStats()
      ]);
      set({ isLoading: false });
    } catch (error) {
      console.error('Error syncing all customers from orders:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to sync customers from orders',
        isLoading: false 
      });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Set current customer
  setCurrentCustomer: (customer) => set({ currentCustomer: customer }),
}));
