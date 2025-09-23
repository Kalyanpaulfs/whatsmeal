import type { Order, OrderItem, WhatsAppOrderData } from '../types/order';

/**
 * Generate a human-readable order code
 * Format: FD-YYYYMMDD-XXXX (where XXXX is a 4-digit number)
 */
export const generateOrderCode = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomNum = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
  
  return `FD-${year}${month}${day}-${randomNum}`;
};

/**
 * Generate WhatsApp deep link with order details
 */
export const generateWhatsAppOrderLink = (orderData: WhatsAppOrderData, restaurantPhone: string = '+917277263880'): string => {
  const {
    orderCode,
    customerName,
    phoneNumber,
    orderType,
    items,
    subtotal,
    deliveryFee,
    discount,
    total,
    address,
    tablePreference,
    pickupTime,
    notes
  } = orderData;

  // Format items for WhatsApp message
  const itemsText = items.map(item => 
    `• ${item.name} x${item.quantity} = ₹${item.total}`
  ).join('\n');

  // Build the message
  let message = `🍽️ *New Order - ${orderCode}*\n\n`;
  message += `👤 *Customer:* ${customerName}\n`;
  message += `📞 *Phone:* ${phoneNumber}\n`;
  message += `📋 *Order Type:* ${orderType.toUpperCase()}\n\n`;
  
  if (address) {
    message += `📍 *Address:* ${address}\n`;
  }
  if (tablePreference) {
    message += `🪑 *Table:* ${tablePreference}\n`;
  }
  if (pickupTime) {
    message += `⏰ *Pickup Time:* ${pickupTime}\n`;
  }
  
  message += `\n📦 *Order Items:*\n${itemsText}\n\n`;
  message += `💰 *Order Summary:*\n`;
  message += `Subtotal: ₹${subtotal}\n`;
  if (deliveryFee > 0) {
    message += `Delivery Fee: ₹${deliveryFee}\n`;
  }
  if (discount > 0) {
    message += `Discount: -₹${discount}\n`;
  }
  message += `*Total: ₹${total}*\n\n`;
  
  if (notes) {
    message += `📝 *Notes:* ${notes}\n\n`;
  }

  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${restaurantPhone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
};

/**
 * Format order items for display
 */
export const formatOrderItems = (items: OrderItem[]): string => {
  return items.map(item => 
    `${item.dishName} x${item.quantity} = ₹${item.total}`
  ).join(', ');
};

/**
 * Calculate order total from items
 */
export const calculateOrderTotal = (
  items: OrderItem[],
  deliveryFee: number = 0,
  discount: number = 0
): number => {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  return subtotal + deliveryFee - discount;
};

/**
 * Format order status for display
 */
export const formatOrderStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending_whatsapp': 'Awaiting WhatsApp Confirmation',
    'pending': 'Pending Confirmation',
    'confirmation': 'Confirmation',
    'preparing': 'Preparing',
    'out-for-delivery': 'Out for Delivery',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled'
  };
  return statusMap[status] || status;
};

/**
 * Get status color for UI
 */
export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'pending_whatsapp': 'text-orange-600 bg-orange-100',
    'pending': 'text-yellow-600 bg-yellow-100',
    'confirmation': 'text-blue-600 bg-blue-100',
    'preparing': 'text-blue-600 bg-blue-100',
    'out-for-delivery': 'text-purple-600 bg-purple-100',
    'delivered': 'text-green-600 bg-green-100',
    'cancelled': 'text-red-600 bg-red-100'
  };
  return colorMap[status] || 'text-gray-600 bg-gray-100';
};

/**
 * Format date for display
 */
export const formatOrderDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Get time elapsed since order creation
 */
export const getTimeElapsed = (dateString: string): string => {
  const now = new Date();
  const orderDate = new Date(dateString);
  const diffMs = now.getTime() - orderDate.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMins > 0) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

/**
 * Validate order data before creation
 */
export const validateOrderData = (orderData: Partial<Order>): string[] => {
  const errors: string[] = [];

  if (!orderData.customerInfo?.name?.trim()) {
    errors.push('Customer name is required');
  }

  if (!orderData.customerInfo?.phoneNumber?.trim()) {
    errors.push('Phone number is required');
  } else if (!/^[0-9+\-\s()]{10,}$/.test(orderData.customerInfo.phoneNumber)) {
    errors.push('Invalid phone number format');
  }

  if (orderData.orderType === 'delivery' && !orderData.customerInfo?.address?.trim()) {
    errors.push('Delivery address is required for delivery orders');
  }

  if (!orderData.items || orderData.items.length === 0) {
    errors.push('Order must contain at least one item');
  }

  if (orderData.items && orderData.items.some(item => item.quantity <= 0)) {
    errors.push('All items must have a quantity greater than 0');
  }

  if (orderData.total && orderData.total <= 0) {
    errors.push('Order total must be greater than 0');
  }

  return errors;
};

/**
 * Save order to localStorage for customer history
 */
export const saveOrderToLocalStorage = (order: Order): void => {
  try {
    const existingOrders = getOrdersFromLocalStorage();
    // Remove any existing order with the same ID to prevent duplicates
    const filteredOrders = existingOrders.filter(existingOrder => existingOrder.id !== order.id);
    const updatedOrders = [order, ...filteredOrders].slice(0, 50); // Keep last 50 orders
    localStorage.setItem('customerOrders', JSON.stringify(updatedOrders));
  } catch (error) {
    console.error('Error saving order to localStorage:', error);
  }
};

/**
 * Get orders from localStorage
 */
export const getOrdersFromLocalStorage = (): Order[] => {
  try {
    const orders = localStorage.getItem('customerOrders');
    const parsedOrders = orders ? JSON.parse(orders) : [];
    
    // Remove duplicates based on order ID
    const uniqueOrders = parsedOrders.filter((order: Order, index: number, self: Order[]) => 
      index === self.findIndex(o => o.id === order.id)
    );
    
    // If duplicates were found, update localStorage
    if (uniqueOrders.length !== parsedOrders.length) {
      localStorage.setItem('customerOrders', JSON.stringify(uniqueOrders));
    }
    
    return uniqueOrders;
  } catch (error) {
    console.error('Error getting orders from localStorage:', error);
    return [];
  }
};

/**
 * Update order in localStorage
 */
export const updateOrderInLocalStorage = (orderId: string, updates: Partial<Order>): void => {
  try {
    const orders = getOrdersFromLocalStorage();
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, ...updates } : order
    );
    localStorage.setItem('customerOrders', JSON.stringify(updatedOrders));
  } catch (error) {
    console.error('Error updating order in localStorage:', error);
  }
};

/**
 * Remove order from localStorage
 */
export const removeOrderFromLocalStorage = (orderId: string): void => {
  try {
    const orders = getOrdersFromLocalStorage();
    const filteredOrders = orders.filter(order => order.id !== orderId);
    localStorage.setItem('customerOrders', JSON.stringify(filteredOrders));
  } catch (error) {
    console.error('Error removing order from localStorage:', error);
  }
};
