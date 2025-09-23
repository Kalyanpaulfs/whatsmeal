import { CustomerService } from '../services/customerService';
import { OrderService } from '../services/orderService';
import type { Order } from '../types/order';

/**
 * Utility functions for syncing customer data from orders
 */

/**
 * Sync all customers from existing orders
 * This function should be called when setting up customer management for the first time
 */
export const syncAllCustomersFromOrders = async (): Promise<void> => {
  try {
    console.log('CustomerSyncUtils: Starting sync of all customers from orders...');
    await CustomerService.syncAllCustomersFromOrders();
    console.log('CustomerSyncUtils: Customer sync completed successfully');
  } catch (error) {
    console.error('CustomerSyncUtils: Error syncing customers from orders:', error);
    throw error;
  }
};

/**
 * Sync a single customer from an order
 * This is called automatically when creating new orders
 */
export const syncCustomerFromOrder = async (order: Order): Promise<void> => {
  try {
    console.log('CustomerSyncUtils: Syncing customer from order:', order.id);
    await CustomerService.syncCustomerFromOrder(order);
    console.log('CustomerSyncUtils: Customer synced successfully');
  } catch (error) {
    console.error('CustomerSyncUtils: Error syncing customer from order:', error);
    throw error;
  }
};

/**
 * Get sync status - check if customers need to be synced
 */
export const getCustomerSyncStatus = async (): Promise<{
  needsSync: boolean;
  totalOrders: number;
  totalCustomers: number;
  lastOrderDate?: string;
  lastCustomerDate?: string;
}> => {
  try {
    // Get all orders
    const orders = await OrderService.getOrders({}, 1000);
    const totalOrders = orders.length;
    
    // Get all customers
    const customers = await CustomerService.getCustomers();
    const totalCustomers = customers.length;
    
    // Check if we need to sync
    const needsSync = totalOrders > 0 && totalCustomers === 0;
    
    // Get last order date
    const lastOrderDate = orders.length > 0 
      ? orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt
      : undefined;
    
    // Get last customer date
    const lastCustomerDate = customers.length > 0
      ? customers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt
      : undefined;
    
    return {
      needsSync,
      totalOrders,
      totalCustomers,
      lastOrderDate,
      lastCustomerDate
    };
  } catch (error) {
    console.error('CustomerSyncUtils: Error getting sync status:', error);
    return {
      needsSync: false,
      totalOrders: 0,
      totalCustomers: 0
    };
  }
};

/**
 * Initialize customer management
 * This should be called when the admin panel loads
 */
export const initializeCustomerManagement = async (): Promise<void> => {
  try {
    console.log('CustomerSyncUtils: Initializing customer management...');
    
    // Check sync status
    const syncStatus = await getCustomerSyncStatus();
    
    if (syncStatus.needsSync) {
      console.log('CustomerSyncUtils: Customers need to be synced from orders');
      await syncAllCustomersFromOrders();
    } else {
      console.log('CustomerSyncUtils: Customer management is up to date');
    }
  } catch (error) {
    console.error('CustomerSyncUtils: Error initializing customer management:', error);
    throw error;
  }
};
