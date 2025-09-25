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
  limit,
  onSnapshot,
  type Unsubscribe
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { 
  Order, 
  OrderFilters, 
  OrderStatusUpdate, 
  OrderAnalytics
} from '../types/order';
import { CustomerService } from './customerService';
import { CouponService } from './couponService';

const COLLECTION_NAME = 'orders';

export class OrderService {
  static async createOrder(
    orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      console.log('OrderService: Creating order with data:', orderData);
      const now = new Date().toISOString();
      const orderWithTimestamps = {
        ...orderData,
        createdAt: now,
        updatedAt: now,
      };

      console.log('OrderService: Order with timestamps:', orderWithTimestamps);
      const docRef = await addDoc(collection(db, COLLECTION_NAME), orderWithTimestamps);
      console.log('OrderService: Order created with ID:', docRef.id);
      
      // Increment coupon usage count if a coupon was applied
      if (orderData.appliedCoupon?.code) {
        try {
          await CouponService.incrementCouponUsage(orderData.appliedCoupon.code);
          console.log('OrderService: Coupon usage count incremented for:', orderData.appliedCoupon.code);
        } catch (error) {
          console.error('OrderService: Error incrementing coupon usage:', error);
          // Don't fail the order creation if coupon usage increment fails
        }
      }
      
      // Note: Customer sync will happen when order is marked as delivered
      // This ensures only completed orders count towards customer stats and revenue
      
      return docRef.id;
    } catch (error) {
      console.error('OrderService: Error creating order:', error);
      throw error;
    }
  }

  static async getOrder(orderId: string): Promise<Order | null> {
    try {
      console.log('OrderService: Fetching order with ID:', orderId);
      const docRef = doc(db, COLLECTION_NAME, orderId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const order = {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          confirmedAt: data.confirmedAt?.toDate?.()?.toISOString() || data.confirmedAt,
          preparedAt: data.preparedAt?.toDate?.()?.toISOString() || data.preparedAt,
          dispatchedAt: data.dispatchedAt?.toDate?.()?.toISOString() || data.dispatchedAt,
          deliveredAt: data.deliveredAt?.toDate?.()?.toISOString() || data.deliveredAt,
          cancelledAt: data.cancelledAt?.toDate?.()?.toISOString() || data.cancelledAt,
        } as Order;
        console.log('OrderService: Retrieved order:', order);
        return order;
      }
      console.log('OrderService: Order not found');
      return null;
    } catch (error) {
      console.error('OrderService: Error fetching order:', error);
      throw error;
    }
  }

  static async checkUserBlocked(phoneNumber: string): Promise<boolean> {
    try {
      console.log('Checking if user is blocked for phone:', phoneNumber);
      const q = query(
        collection(db, COLLECTION_NAME),
        where('customerInfo.phoneNumber', '==', phoneNumber),
        where('isBlocked', '==', true),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      const isBlocked = !querySnapshot.empty;
      console.log('User blocked status:', isBlocked);
      return isBlocked;
    } catch (error) {
      console.error('Error checking user blocked status:', error);
      return false; // If error, allow order (fail open)
    }
  }

  static async getOrders(filters?: OrderFilters, limitCount: number = 50): Promise<Order[]> {
    try {
      let q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'), limit(limitCount));

      if (filters) {
        if (filters.status) {
          q = query(q, where('status', '==', filters.status));
        }
        if (filters.orderType) {
          q = query(q, where('orderType', '==', filters.orderType));
        }
        if (filters.isVip !== undefined) {
          q = query(q, where('isVip', '==', filters.isVip));
        }
        if (filters.isBlocked !== undefined) {
          q = query(q, where('isBlocked', '==', filters.isBlocked));
        }
      }

      const querySnapshot = await getDocs(q);
      const orders: Order[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        orders.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          confirmedAt: data.confirmedAt?.toDate?.()?.toISOString() || data.confirmedAt,
          preparedAt: data.preparedAt?.toDate?.()?.toISOString() || data.preparedAt,
          dispatchedAt: data.dispatchedAt?.toDate?.()?.toISOString() || data.dispatchedAt,
          deliveredAt: data.deliveredAt?.toDate?.()?.toISOString() || data.deliveredAt,
          cancelledAt: data.cancelledAt?.toDate?.()?.toISOString() || data.cancelledAt,
        } as Order);
      });

      // Apply client-side filters for search and date range
      let filteredOrders = orders;

      if (filters?.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        filteredOrders = filteredOrders.filter(order => 
          order.orderCode.toLowerCase().includes(searchTerm) ||
          order.customerInfo.phoneNumber.includes(searchTerm) ||
          order.customerInfo.name.toLowerCase().includes(searchTerm)
        );
      }

      if (filters?.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        filteredOrders = filteredOrders.filter(order => 
          new Date(order.createdAt) >= fromDate
        );
      }

      if (filters?.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        filteredOrders = filteredOrders.filter(order => 
          new Date(order.createdAt) <= toDate
        );
      }

      return filteredOrders;
    } catch (error) {
      console.error('OrderService: Error fetching orders:', error);
      throw error;
    }
  }

  static async updateOrderStatus(
    orderId: string, 
    statusUpdate: OrderStatusUpdate
  ): Promise<void> {
    try {
      const orderRef = doc(db, COLLECTION_NAME, orderId);
      const now = new Date().toISOString();
      
      const updateData: any = {
        status: statusUpdate.status,
        updatedAt: now,
        notes: statusUpdate.notes || '',
      };

      // Set specific timestamp based on status
      switch (statusUpdate.status) {
        case 'preparing':
          updateData.preparedAt = now;
          break;
        case 'out-for-delivery':
          updateData.dispatchedAt = now;
          break;
        case 'delivered':
          updateData.deliveredAt = now;
          break;
        case 'cancelled':
          updateData.cancelledAt = now;
          updateData.cancelledReason = statusUpdate.cancelledReason || 'No reason provided';
          break;
      }

      await updateDoc(orderRef, updateData);
      
      // If order is marked as delivered, sync customer data
      if (statusUpdate.status === 'delivered') {
        try {
          // Get the updated order data
          const orderDoc = await getDoc(orderRef);
          if (orderDoc.exists()) {
            const orderData = { id: orderDoc.id, ...orderDoc.data() } as Order;
            console.log('OrderService: Order delivered, syncing customer data for order:', orderData.id);
            await CustomerService.syncCustomerFromOrder(orderData);
            console.log('OrderService: Customer synced successfully after delivery');
          }
        } catch (syncError) {
          console.error('OrderService: Error syncing customer after delivery (non-blocking):', syncError);
          // Don't throw error for customer sync failure - order status update should still succeed
        }
      }
    } catch (error) {
      console.error('OrderService: Error updating order status:', error);
      throw error;
    }
  }

  static async updateOrder(
    orderId: string, 
    updateData: Partial<Order>
  ): Promise<void> {
    try {
      const orderRef = doc(db, COLLECTION_NAME, orderId);
      const cleanUpdateData = {
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      // Remove undefined values
      const filteredData = Object.fromEntries(
        Object.entries(cleanUpdateData).filter(([_, value]) => value !== undefined)
      );

      await updateDoc(orderRef, filteredData);
    } catch (error) {
      console.error('OrderService: Error updating order:', error);
      throw error;
    }
  }

  static async deleteOrder(orderId: string): Promise<void> {
    try {
      const orderRef = doc(db, COLLECTION_NAME, orderId);
      await deleteDoc(orderRef);
    } catch (error) {
      console.error('OrderService: Error deleting order:', error);
      throw error;
    }
  }

  static async getOrderAnalytics(): Promise<OrderAnalytics> {
    try {
      const allOrders = await this.getOrders({}, 1000); // Get more orders for analytics
      
      const totalOrders = allOrders.length;
      const statusCounts = allOrders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const totalRevenue = allOrders
        .filter(order => order.status === 'delivered')
        .reduce((sum, order) => sum + order.total, 0);

      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Top dishes analysis
      const dishCounts: Record<string, { quantity: number; revenue: number }> = {};
      allOrders.forEach(order => {
        order.items.forEach(item => {
          if (!dishCounts[item.dishName]) {
            dishCounts[item.dishName] = { quantity: 0, revenue: 0 };
          }
          dishCounts[item.dishName].quantity += item.quantity;
          dishCounts[item.dishName].revenue += item.total;
        });
      });

      const topDishes = Object.entries(dishCounts)
        .map(([dishName, data]) => ({ dishName, ...data }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      // Orders by type
      const ordersByType = allOrders.reduce((acc, order) => {
        acc[order.orderType] = (acc[order.orderType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalOrders,
        pendingOrders: statusCounts.pending || 0,
        preparingOrders: statusCounts.preparing || 0,
        outForDeliveryOrders: statusCounts['out-for-delivery'] || 0,
        deliveredOrders: statusCounts.delivered || 0,
        cancelledOrders: statusCounts.cancelled || 0,
        totalRevenue,
        averageOrderValue,
        topDishes,
        ordersByType: {
          delivery: ordersByType.delivery || 0,
          pickup: ordersByType.pickup || 0,
          'dine-in': ordersByType['dine-in'] || 0,
        },
        recentOrders: allOrders.slice(0, 10),
      };
    } catch (error) {
      console.error('OrderService: Error getting order analytics:', error);
      throw error;
    }
  }

  static async searchOrders(searchTerm: string): Promise<Order[]> {
    try {
      // Search by order code, phone number, or customer name
      const orders = await this.getOrders();
      return orders.filter(order => 
        order.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerInfo.phoneNumber.includes(searchTerm) ||
        order.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('OrderService: Error searching orders:', error);
      throw error;
    }
  }

  // ===== REAL-TIME LISTENERS =====
  
  // Subscribe to real-time order updates
  static subscribeToOrders(
    callback: (orders: Order[]) => void,
    filters?: OrderFilters
  ): Unsubscribe {
    console.log('OrderService: Setting up real-time order subscription with filters:', filters);
    
    const ordersRef = collection(db, COLLECTION_NAME);
    const queryConstraints = [];
    
    // Apply filters if provided
    if (filters) {
      if (filters.status) {
        queryConstraints.push(where('status', '==', filters.status));
      }
      if (filters.orderType) {
        queryConstraints.push(where('orderType', '==', filters.orderType));
      }
      if (filters.isVip !== undefined) {
        queryConstraints.push(where('isVip', '==', filters.isVip));
      }
      if (filters.isBlocked !== undefined) {
        queryConstraints.push(where('isBlocked', '==', filters.isBlocked));
      }
    }
    
    // Add ordering and limit for better performance
    queryConstraints.push(orderBy('createdAt', 'desc'));
    queryConstraints.push(limit(50)); // Limit to 50 most recent orders for better performance
    
    const ordersQuery = query(ordersRef, ...queryConstraints);
    
    return onSnapshot(ordersQuery, (querySnapshot) => {
      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order));
      
      console.log('OrderService: Real-time order update received:', orders.length, 'orders');
      callback(orders);
    }, (error) => {
      console.error('OrderService: Real-time subscription error:', error);
    });
  }

  // Subscribe to real-time analytics updates
  static subscribeToOrderAnalytics(callback: (analytics: OrderAnalytics) => void): Unsubscribe {
    console.log('OrderService: Setting up real-time analytics subscription');
    
    const ordersQuery = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    
    return onSnapshot(ordersQuery, (querySnapshot) => {
      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order));
      
      // Calculate analytics from orders
      const analytics = OrderService.calculateAnalytics(orders);
      console.log('OrderService: Real-time analytics update received');
      callback(analytics);
    }, (error) => {
      console.error('OrderService: Real-time analytics subscription error:', error);
    });
  }

  // Helper method to calculate analytics from orders
  private static calculateAnalytics(orders: Order[]): OrderAnalytics {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'pending_whatsapp').length;
    const preparingOrders = orders.filter(o => o.status === 'preparing').length;
    const outForDeliveryOrders = orders.filter(o => o.status === 'out-for-delivery').length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
    
    const totalRevenue = orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, order) => sum + order.total, 0);
    
    const averageOrderValue = deliveredOrders > 0 ? totalRevenue / deliveredOrders : 0;
    
    // Calculate top dishes
    const dishCounts: { [key: string]: { dishName: string; quantity: number; revenue: number } } = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!dishCounts[item.dishId]) {
          dishCounts[item.dishId] = { dishName: item.dishName, quantity: 0, revenue: 0 };
        }
        dishCounts[item.dishId].quantity += item.quantity;
        dishCounts[item.dishId].revenue += item.total;
      });
    });
    
    const topDishes = Object.values(dishCounts)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    // Calculate orders by type
    const ordersByType = {
      delivery: orders.filter(o => o.orderType === 'delivery').length,
      pickup: orders.filter(o => o.orderType === 'pickup').length,
      'dine-in': orders.filter(o => o.orderType === 'dine-in').length
    };
    
    // Get recent orders (last 10)
    const recentOrders = orders.slice(0, 10);
    
    return {
      totalOrders,
      pendingOrders,
      preparingOrders,
      outForDeliveryOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      averageOrderValue,
      topDishes,
      ordersByType,
      recentOrders
    };
  }
}
