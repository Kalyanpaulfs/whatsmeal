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
  deleteAllCustomers: () => Promise<void>;
  
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
      console.log('CustomerStore: Fetching customers with filters:', filters);
      const customers = await CustomerService.getCustomers(filters);
      console.log(`CustomerStore: Received ${customers.length} customers from service`);
      
      // Debug: Check for duplicate phone numbers
      const phoneNumbers = customers.map(c => c.phoneNumber).filter(p => p);
      const uniquePhones = new Set(phoneNumbers);
      if (phoneNumbers.length !== uniquePhones.size) {
        console.warn(`CustomerStore: Found ${phoneNumbers.length - uniquePhones.size} duplicate phone numbers in customers array`);
        const duplicates = phoneNumbers.filter((phone, index) => phoneNumbers.indexOf(phone) !== index);
        console.warn('CustomerStore: Duplicate phone numbers:', duplicates);
      }
      
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
    const state = get();
    if (state.isLoading) {
      console.warn('Customer sync already in progress, skipping...');
      return;
    }
    
    set({ isLoading: true, error: null });
    try {
      console.log('CustomerStore: Starting sync all customers from orders...');
      await CustomerService.syncAllCustomersFromOrders();
      
      // Refresh customers list and analytics
      console.log('CustomerStore: Refreshing customer data after sync...');
      await Promise.all([
        get().fetchCustomers(),
        get().fetchAnalytics(),
        get().fetchInsights(),
        get().fetchStats()
      ]);
      
      console.log('CustomerStore: Customer sync completed successfully');
      set({ isLoading: false });
    } catch (error) {
      console.error('CustomerStore: Error syncing all customers from orders:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to sync customers from orders',
        isLoading: false 
      });
      throw error; // Re-throw so the component can handle it
    }
  },



  // Delete all customers (for fresh start)
  deleteAllCustomers: async () => {
    set({ isLoading: true, error: null });
    try {
      console.log('CustomerStore: Starting deletion of all customers...');
      await CustomerService.deleteAllCustomers();
      
      // Clear local state
      set({ 
        customers: [], 
        analytics: null, 
        insights: null, 
        stats: null,
        isLoading: false 
      });
      
      console.log('CustomerStore: All customers deleted successfully');
    } catch (error) {
      console.error('CustomerStore: Error deleting all customers:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete all customers',
        isLoading: false 
      });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Set current customer
  setCurrentCustomer: (customer) => set({ currentCustomer: customer }),
}));
