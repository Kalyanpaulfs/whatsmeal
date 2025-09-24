import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { 
  Customer, 
  CustomerFilters, 
  CustomerAnalytics, 
  CustomerUpdateData,
  CustomerInsights
} from '../types/customer';
import type { Order } from '../types/order';

const CUSTOMERS_COLLECTION = 'customers';
const ORDERS_COLLECTION = 'orders';

export class CustomerService {
  // Create or update customer from order data (only for delivered orders)
  static async syncCustomerFromOrder(order: Order): Promise<void> {
    try {
      // Only sync customers from delivered orders
      if (order.status !== 'delivered') {
        console.log('CustomerService: Skipping customer sync - order is not delivered:', order.id, 'Status:', order.status);
        return;
      }
      
      const customerData = {
        name: order.customerInfo.name,
        phoneNumber: order.customerInfo.phoneNumber,
        address: order.customerInfo.address || '',
        totalOrders: 1,
        totalSpent: order.total,
        isVIP: order.isVip || false,
        isBlocked: order.isBlocked || false,
        createdAt: order.createdAt,
        lastOrderAt: order.createdAt,
        updatedAt: new Date().toISOString(),
        // Note: Don't include 'id' field - Firebase will auto-generate the document ID
      };

      // Check if customer already exists
      const existingCustomer = await this.getCustomerByPhone(order.customerInfo.phoneNumber);
      
      if (existingCustomer && existingCustomer.id && existingCustomer.id.trim() !== '') {
        // Update existing customer
        await this.updateCustomerFromOrder(existingCustomer.id, order);
      } else {
        // Create new customer - validate data first
        if (customerData.phoneNumber && customerData.phoneNumber.trim() !== '' && customerData.name && customerData.name.trim() !== '') {
          await addDoc(collection(db, CUSTOMERS_COLLECTION), customerData);
        } else {
          console.warn(`CustomerService: Skipping customer creation due to invalid data - phone: "${customerData.phoneNumber}", name: "${customerData.name}"`);
        }
      }
    } catch (error) {
      console.error('CustomerService: Error syncing customer from order:', error);
      throw error;
    }
  }

  // Update existing customer with new order data (only for delivered orders)
  static async updateCustomerFromOrder(customerId: string, order: Order): Promise<void> {
    try {
      // Only update customers from delivered orders
      if (order.status !== 'delivered') {
        console.log('CustomerService: Skipping customer update - order is not delivered:', order.id, 'Status:', order.status);
        return;
      }
      
      // Validate customerId before creating document reference
      if (!customerId || customerId.trim() === '') {
        console.error('CustomerService: Invalid customerId provided:', customerId);
        throw new Error('Invalid customer ID');
      }
      
      // Additional validation to ensure customerId is not just whitespace or special characters
      if (customerId.length < 1 || !/^[a-zA-Z0-9_-]+$/.test(customerId)) {
        console.error('CustomerService: Customer ID contains invalid characters:', customerId);
        throw new Error('Customer ID contains invalid characters');
      }
      
      const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
      const customerDoc = await getDoc(customerRef);
      
      if (customerDoc.exists()) {
        const customerData = customerDoc.data() as Customer;
        const now = new Date().toISOString();
        
        const updateData = {
          totalOrders: customerData.totalOrders + 1,
          totalSpent: customerData.totalSpent + order.total,
          lastOrderAt: order.createdAt,
          updatedAt: now,
          // Update VIP/Blocked status if order has different values
          isVIP: order.isVip || customerData.isVIP,
          isBlocked: order.isBlocked || customerData.isBlocked,
          // Update address if provided and different
          address: order.customerInfo.address || customerData.address,
        };

        await updateDoc(customerRef, updateData);
      } else {
        console.warn('CustomerService: Customer document not found for ID:', customerId);
      }
    } catch (error) {
      console.error('CustomerService: Error updating customer from order:', error);
      throw error;
    }
  }

  // Get customer by phone number
  static async getCustomerByPhone(phoneNumber: string): Promise<Customer | null> {
    try {
      if (!phoneNumber || phoneNumber.trim() === '') {
        console.error('CustomerService: Invalid phone number provided:', phoneNumber);
        return null;
      }
      
      const q = query(
        collection(db, CUSTOMERS_COLLECTION),
        where('phoneNumber', '==', phoneNumber.trim()),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        
        // Validate that we have a valid document ID
        if (!doc.id || doc.id.trim() === '') {
          console.error('CustomerService: Invalid document ID found for customer:', phoneNumber);
          return null;
        }
        
        const customer = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          lastOrderAt: data.lastOrderAt?.toDate?.()?.toISOString() || data.lastOrderAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        } as Customer;
        
        console.log('CustomerService: Found customer with ID:', customer.id);
        return customer;
      }
      
      return null;
    } catch (error) {
      console.error('CustomerService: Error getting customer by phone:', error);
      throw error;
    }
  }

  // Get all customers with filters
  static async getCustomers(filters?: CustomerFilters): Promise<Customer[]> {
    try {
      let customers: Customer[] = [];

      // If no filters or only search/date filters, get all customers
      if (!filters || (filters.isVIP === undefined && filters.isBlocked === undefined)) {
        const q = query(collection(db, CUSTOMERS_COLLECTION));
        const querySnapshot = await getDocs(q);
        
        const customerMap = new Map<string, Customer>();
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const customer = {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
            lastOrderAt: data.lastOrderAt?.toDate?.()?.toISOString() || data.lastOrderAt,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          } as Customer;
          
          // Deduplicate by phone number - keep the most recent one
          const phoneNumber = customer.phoneNumber;
          if (phoneNumber && phoneNumber.trim() !== '') {
            const existingCustomer = customerMap.get(phoneNumber);
            if (!existingCustomer || new Date(customer.updatedAt || customer.createdAt) > new Date(existingCustomer.updatedAt || existingCustomer.createdAt)) {
              customerMap.set(phoneNumber, customer);
            }
          } else {
            // If no phone number, use document ID as key
            customerMap.set(customer.id || `no-phone-${doc.id}`, customer);
          }
        });
        
        customers = Array.from(customerMap.values());
      } else {
        // If we have VIP or Blocked filters, use separate queries
        const queries: Promise<any>[] = [];
        
        if (filters.isVIP !== undefined) {
          const vipQuery = query(collection(db, CUSTOMERS_COLLECTION), where('isVIP', '==', filters.isVIP));
          queries.push(getDocs(vipQuery));
        }
        
        if (filters.isBlocked !== undefined) {
          const blockedQuery = query(collection(db, CUSTOMERS_COLLECTION), where('isBlocked', '==', filters.isBlocked));
          queries.push(getDocs(blockedQuery));
        }
        
        // Execute queries in parallel
        const querySnapshots = await Promise.all(queries);
        
        // Combine results and remove duplicates
        const customerMap = new Map<string, Customer>();
        
        querySnapshots.forEach(querySnapshot => {
          querySnapshot.forEach((doc: any) => {
            const data = doc.data();
            const customer = {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
              lastOrderAt: data.lastOrderAt?.toDate?.()?.toISOString() || data.lastOrderAt,
              updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
            } as Customer;
            
            // Deduplicate by phone number - keep the most recent one
            const phoneNumber = customer.phoneNumber;
            if (phoneNumber && phoneNumber.trim() !== '') {
              const existingCustomer = customerMap.get(phoneNumber);
              if (!existingCustomer || new Date(customer.updatedAt || customer.createdAt) > new Date(existingCustomer.updatedAt || existingCustomer.createdAt)) {
                customerMap.set(phoneNumber, customer);
              }
            } else {
              // If no phone number, use document ID as key
              customerMap.set(customer.id || `no-phone-${doc.id}`, customer);
            }
          });
        });
        
        customers = Array.from(customerMap.values());
      }

      // Debug logging
      console.log(`CustomerService: Fetched ${customers.length} unique customers`);
      const phoneNumbers = customers.map(c => c.phoneNumber).filter(p => p);
      const duplicatePhones = phoneNumbers.filter((phone, index) => phoneNumbers.indexOf(phone) !== index);
      if (duplicatePhones.length > 0) {
        console.warn('CustomerService: Found duplicate phone numbers after deduplication:', duplicatePhones);
      }

      // Apply client-side filters
      if (filters?.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        customers = customers.filter(customer => 
          customer.name.toLowerCase().includes(searchTerm) ||
          customer.phoneNumber.includes(searchTerm)
        );
      }

      if (filters?.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        customers = customers.filter(customer => 
          new Date(customer.createdAt) >= fromDate
        );
      }

      if (filters?.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        customers = customers.filter(customer => 
          new Date(customer.createdAt) <= toDate
        );
      }

      // Apply additional client-side filters for multiple conditions
      if (filters) {
        if (filters.isVIP !== undefined && filters.isBlocked !== undefined) {
          customers = customers.filter(customer => 
            customer.isVIP === filters.isVIP && customer.isBlocked === filters.isBlocked
          );
        }
      }

      // Sort by lastOrderAt in descending order (most recent first)
      customers.sort((a, b) => {
        const dateA = new Date(a.lastOrderAt).getTime();
        const dateB = new Date(b.lastOrderAt).getTime();
        return dateB - dateA;
      });

      return customers;
    } catch (error) {
      console.error('CustomerService: Error getting customers:', error);
      throw error;
    }
  }

  // Get single customer
  static async getCustomer(customerId: string): Promise<Customer | null> {
    try {
      const docRef = doc(db, CUSTOMERS_COLLECTION, customerId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          lastOrderAt: data.lastOrderAt?.toDate?.()?.toISOString() || data.lastOrderAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        } as Customer;
      }
      
      return null;
    } catch (error) {
      console.error('CustomerService: Error getting customer:', error);
      throw error;
    }
  }

  // Update customer
  static async updateCustomer(customerId: string, updateData: CustomerUpdateData): Promise<void> {
    try {
      const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
      const cleanUpdateData = {
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(customerRef, cleanUpdateData);
    } catch (error) {
      console.error('CustomerService: Error updating customer:', error);
      throw error;
    }
  }

  // Delete customer
  static async deleteCustomer(customerId: string): Promise<void> {
    try {
      const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
      await deleteDoc(customerRef);
    } catch (error) {
      console.error('CustomerService: Error deleting customer:', error);
      throw error;
    }
  }

  // Get customer analytics
  static async getCustomerAnalytics(): Promise<CustomerAnalytics> {
    try {
      const customers = await this.getCustomers();
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const totalCustomers = customers.length;
      const vipCustomers = customers.filter(c => c.isVIP).length;
      const blockedCustomers = customers.filter(c => c.isBlocked).length;
      
      const newCustomersThisWeek = customers.filter(c => 
        new Date(c.createdAt) >= oneWeekAgo
      ).length;
      
      const newCustomersThisMonth = customers.filter(c => 
        new Date(c.createdAt) >= oneMonthAgo
      ).length;

      const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
      const averageOrderValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

      // Top customers by total spent
      const topCustomersBySpent = [...customers]
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10);

      // Top customers by total orders
      const topCustomersByOrders = [...customers]
        .sort((a, b) => b.totalOrders - a.totalOrders)
        .slice(0, 10);

      return {
        totalCustomers,
        vipCustomers,
        blockedCustomers,
        newCustomersThisWeek,
        newCustomersThisMonth,
        topCustomersBySpent,
        topCustomersByOrders,
        averageOrderValue,
        totalRevenue,
      };
    } catch (error) {
      console.error('CustomerService: Error getting customer analytics:', error);
      throw error;
    }
  }

  // Get customer insights for dashboard
  static async getCustomerInsights(): Promise<CustomerInsights> {
    try {
      const customers = await this.getCustomers();
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const topCustomersBySpent = [...customers]
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5);

      const topCustomersByOrders = [...customers]
        .sort((a, b) => b.totalOrders - a.totalOrders)
        .slice(0, 5);

      const newCustomersThisWeek = customers.filter(c => 
        new Date(c.createdAt) >= oneWeekAgo
      ).slice(0, 5);

      const newCustomersThisMonth = customers.filter(c => 
        new Date(c.createdAt) >= oneMonthAgo
      ).slice(0, 5);

      return {
        topCustomersBySpent,
        topCustomersByOrders,
        newCustomersThisWeek,
        newCustomersThisMonth,
      };
    } catch (error) {
      console.error('CustomerService: Error getting customer insights:', error);
      throw error;
    }
  }

  // Sync all customers from existing orders
  static async syncAllCustomersFromOrders(): Promise<void> {
    try {
      console.log('CustomerService: Starting customer sync from orders...');
      
      // IMPORTANT: Delete ALL existing customers first to start fresh
      // This ensures we only have customers from delivered orders
      console.log('CustomerService: Deleting all existing customers to start fresh...');
      await this.deleteAllCustomers();
      
      // Get all orders first, then filter for delivered ones
      // This avoids the composite index requirement temporarily
      const ordersQuery = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'asc'));
      const ordersSnapshot = await getDocs(ordersQuery);
      
      const customersMap = new Map<string, { customer: Omit<Customer, 'id'>; orders: Order[] }>();
      let deliveredOrdersCount = 0;
      
      // Group orders by phone number (only delivered orders)
      ordersSnapshot.forEach((doc) => {
        const orderData = doc.data() as Order;
        
        // Only process delivered orders
        if (orderData.status !== 'delivered') {
          return;
        }
        
        deliveredOrdersCount++;
        const phoneNumber = orderData.customerInfo.phoneNumber;
        
        if (!phoneNumber || phoneNumber.trim() === '') {
          console.warn('CustomerService: Skipping order with invalid phone number:', orderData.orderCode);
          return;
        }
        
        if (!customersMap.has(phoneNumber)) {
          // Create new customer from scratch (no existing data)
          customersMap.set(phoneNumber, {
            customer: {
              name: orderData.customerInfo.name,
              phoneNumber: orderData.customerInfo.phoneNumber,
              address: orderData.customerInfo.address || '',
              totalOrders: 0,
              totalSpent: 0,
              isVIP: orderData.isVip || false,
              isBlocked: orderData.isBlocked || false,
              createdAt: orderData.createdAt,
              lastOrderAt: orderData.createdAt,
              updatedAt: new Date().toISOString(),
            },
            orders: []
          });
        }
        
        const customerData = customersMap.get(phoneNumber)!;
        customerData.orders.push(orderData);
        
        // Update customer data from scratch
        customerData.customer.totalOrders = customerData.orders.length;
        customerData.customer.totalSpent = customerData.orders.reduce((sum, order) => sum + order.total, 0);
        customerData.customer.lastOrderAt = orderData.createdAt;
        customerData.customer.isVIP = customerData.customer.isVIP || orderData.isVip;
        customerData.customer.isBlocked = customerData.customer.isBlocked || orderData.isBlocked;
        if (orderData.customerInfo.address) {
          customerData.customer.address = orderData.customerInfo.address;
        }
      });
      
      // Create all customers in Firestore (since we deleted all existing ones)
      let newCustomersCount = 0;
      for (const [phoneNumber, { customer }] of customersMap) {
        // Create new customer - validate data first
        if (customer.phoneNumber && customer.phoneNumber.trim() !== '' && customer.name && customer.name.trim() !== '') {
          try {
            await addDoc(collection(db, CUSTOMERS_COLLECTION), customer);
            newCustomersCount++;
            console.log(`CustomerService: Created customer ${phoneNumber} with ${customer.totalOrders} orders, ${customer.totalSpent} spent`);
          } catch (createError) {
            console.error(`CustomerService: Failed to create customer ${phoneNumber}:`, createError);
            // Continue with other customers even if one fails
          }
        } else {
          console.warn(`CustomerService: Skipping customer creation due to invalid data - phone: "${customer.phoneNumber}", name: "${customer.name}"`);
        }
      }
      
      console.log(`CustomerService: Sync completed - ${newCustomersCount} customers created from ${deliveredOrdersCount} delivered orders`);
    } catch (error) {
      console.error('CustomerService: Error syncing all customers from orders:', error);
      throw error;
    }
  }

  // Search customers
  static async searchCustomers(searchTerm: string): Promise<Customer[]> {
    try {
      const customers = await this.getCustomers();
      const searchLower = searchTerm.toLowerCase();
      
      return customers.filter(customer => 
        customer.name.toLowerCase().includes(searchLower) ||
        customer.phoneNumber.includes(searchTerm)
      );
    } catch (error) {
      console.error('CustomerService: Error searching customers:', error);
      throw error;
    }
  }


  // Delete ALL customers from the database (for fresh start)
  static async deleteAllCustomers(): Promise<void> {
    try {
      console.log('CustomerService: Starting deletion of ALL customers...');
      
      // Get all customers
      const q = query(collection(db, CUSTOMERS_COLLECTION));
      const querySnapshot = await getDocs(q);
      
      const customersToDelete: string[] = [];
      
      // Collect all customer document IDs
      querySnapshot.forEach((doc) => {
        customersToDelete.push(doc.id);
      });
      
      console.log(`CustomerService: Found ${customersToDelete.length} customers to delete`);
      
      // Delete all customers
      for (const customerId of customersToDelete) {
        try {
          await deleteDoc(doc(db, CUSTOMERS_COLLECTION, customerId));
          console.log(`CustomerService: Deleted customer ${customerId}`);
        } catch (deleteError) {
          console.error(`CustomerService: Failed to delete customer ${customerId}:`, deleteError);
          // Continue with other deletions even if one fails
        }
      }
      
      console.log(`CustomerService: All customers deletion completed. Deleted ${customersToDelete.length} customers.`);
    } catch (error) {
      console.error('CustomerService: Error deleting all customers:', error);
      throw error;
    }
  }

  // Clean up duplicate customers in the database
  static async cleanupDuplicateCustomers(): Promise<void> {
    try {
      console.log('CustomerService: Starting cleanup of duplicate customers...');
      
      // Get all customers
      const q = query(collection(db, CUSTOMERS_COLLECTION));
      const querySnapshot = await getDocs(q);
      
      const phoneToCustomersMap = new Map<string, Customer[]>();
      const customersToDelete: string[] = [];
      
      // Group customers by phone number
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const customer = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          lastOrderAt: data.lastOrderAt?.toDate?.()?.toISOString() || data.lastOrderAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        } as Customer;
        
        const phoneNumber = customer.phoneNumber;
        if (phoneNumber && phoneNumber.trim() !== '') {
          if (!phoneToCustomersMap.has(phoneNumber)) {
            phoneToCustomersMap.set(phoneNumber, []);
          }
          phoneToCustomersMap.get(phoneNumber)!.push(customer);
        } else {
          // Handle customers without valid phone numbers - mark for deletion if they have invalid IDs
          if (!customer.id || customer.id.trim() === '') {
            console.warn(`CustomerService: Found customer with invalid ID and no phone number - marking for deletion: "${customer.name}"`);
            customersToDelete.push(doc.id); // Use the document ID from Firestore
          }
        }
      });
      
      // Find duplicates and mark older ones for deletion
      for (const [phoneNumber, customers] of phoneToCustomersMap) {
        if (customers.length > 1) {
          console.log(`CustomerService: Found ${customers.length} customers with phone ${phoneNumber}`);
          
          // Sort by updatedAt (most recent first)
          customers.sort((a, b) => {
            const dateA = new Date(a.updatedAt || a.createdAt);
            const dateB = new Date(b.updatedAt || b.createdAt);
            return dateB.getTime() - dateA.getTime();
          });
          
          // Keep the most recent one, mark others for deletion
          const [keepCustomer, ...deleteCustomers] = customers;
          console.log(`CustomerService: Keeping customer ${keepCustomer.id}, deleting ${deleteCustomers.length} duplicates`);
          
          deleteCustomers.forEach(customer => {
            customersToDelete.push(customer.id);
          });
        }
      }
      
      // Delete duplicate customers
      for (const customerId of customersToDelete) {
        // Validate customer ID before creating document reference
        if (!customerId || customerId.trim() === '') {
          console.warn(`CustomerService: Skipping deletion of customer with invalid ID: "${customerId}"`);
          continue;
        }
        
        try {
          await deleteDoc(doc(db, CUSTOMERS_COLLECTION, customerId));
          console.log(`CustomerService: Deleted duplicate/invalid customer ${customerId}`);
        } catch (deleteError) {
          console.error(`CustomerService: Failed to delete customer ${customerId}:`, deleteError);
          // Continue with other deletions even if one fails
        }
      }
      
      console.log(`CustomerService: Cleanup completed. Deleted ${customersToDelete.length} duplicate/invalid customers.`);
      if (customersToDelete.length === 0) {
        console.log('CustomerService: No duplicate customers found - database is clean.');
      }
    } catch (error) {
      console.error('CustomerService: Error cleaning up duplicate customers:', error);
      throw error;
    }
  }
}
