/**
 * Utility functions for WhatsApp integration
 */

export interface WhatsAppOrderData {
  orderCode: string;
  customerName: string;
  phoneNumber: string;
  orderType: 'delivery' | 'pickup' | 'dine-in';
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  address?: string;
  tablePreference?: string;
  pickupTime?: string;
  notes?: string;
}

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
 * Try to open WhatsApp with multiple fallback methods
 */
export const openWhatsApp = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    let opened = false;
    
    // Method 1: Try window.open with _blank
    try {
      const whatsappWindow = window.open(url, '_blank', 'noopener,noreferrer');
      if (whatsappWindow && !whatsappWindow.closed) {
        opened = true;
        resolve(true);
        return;
      }
    } catch (error) {
      console.log('Method 1 failed:', error);
    }
    
    // Method 2: If pop-up blocked, try direct navigation
    if (!opened) {
      try {
        // Create a temporary link and click it
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        opened = true;
        resolve(true);
        return;
      } catch (error) {
        console.log('Method 2 failed:', error);
      }
    }
    
    // Method 3: Try using location.href as last resort
    if (!opened) {
      try {
        window.location.href = url;
        opened = true;
        resolve(true);
        return;
      } catch (error) {
        console.log('Method 3 failed:', error);
      }
    }
    
    // If all methods failed
    resolve(false);
  });
};

/**
 * Copy WhatsApp URL to clipboard
 */
export const copyWhatsAppUrl = async (url: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Generate order message for sharing
 */
export const generateOrderMessage = (
  items: any[],
  orderDetails: any,
  restaurantName: string,
  total: number
): string => {
  const itemsText = items.map(item => 
    `• ${item.dish.name} x${item.quantity} = ₹${item.dish.price * item.quantity}`
  ).join('\n');

  let message = `🍽️ *Order from ${restaurantName}*\n\n`;
  message += `👤 *Customer:* ${orderDetails.customerInfo.name}\n`;
  message += `📞 *Phone:* ${orderDetails.customerInfo.phoneNumber}\n`;
  message += `📋 *Order Type:* ${orderDetails.orderType.toUpperCase()}\n\n`;
  
  if (orderDetails.customerInfo.address) {
    message += `📍 *Address:* ${orderDetails.customerInfo.address}\n`;
  }
  if (orderDetails.customerInfo.tablePreference) {
    message += `🪑 *Table:* ${orderDetails.customerInfo.tablePreference}\n`;
  }
  if (orderDetails.customerInfo.pickupTime) {
    message += `⏰ *Pickup Time:* ${orderDetails.customerInfo.pickupTime}\n`;
  }
  
  message += `\n📦 *Order Items:*\n${itemsText}\n\n`;
  message += `💰 *Total: ₹${total}*\n\n`;
  
  if (orderDetails.notes) {
    message += `📝 *Notes:* ${orderDetails.notes}\n\n`;
  }

  return message;
};

/**
 * Copy order message to clipboard
 */
export const copyOrderToClipboard = async (message: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(message);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = message;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Share order using Web Share API
 */
export const shareOrder = async (
  items: any[],
  orderDetails: any,
  restaurantName: string,
  total: number
): Promise<void> => {
  const message = generateOrderMessage(items, orderDetails, restaurantName, total);
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Order from ${restaurantName}`,
        text: message,
        url: window.location.href
      });
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to clipboard
      await copyOrderToClipboard(message);
    }
  } else {
    // Fallback to clipboard
    await copyOrderToClipboard(message);
  }
};