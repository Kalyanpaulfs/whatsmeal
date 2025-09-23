export interface OrderValidationResult {
  canOrder: boolean;
  reason?: string;
}

export const validateOrder = (
  orderType: string,
  restaurantStatus: string,
  deliveryAvailable: boolean
): OrderValidationResult => {
  // Check if restaurant is closed
  if (restaurantStatus === 'closed') {
    return {
      canOrder: false,
      reason: 'Restaurant is currently closed. We are not accepting any orders at this time.'
    };
  }
  
  // Check if delivery is requested but not available
  if (orderType === 'delivery' && !deliveryAvailable) {
    return {
      canOrder: false,
      reason: 'Delivery service is currently unavailable. Please choose dine-in or pickup instead.'
    };
  }
  
  // Check if delivery is requested but restaurant is delivery-only and dine-in/pickup is selected
  if (restaurantStatus === 'delivery-only' && (orderType === 'dine-in' || orderType === 'pickup')) {
    return {
      canOrder: false,
      reason: 'We are only accepting delivery orders at this time. Please select delivery option.'
    };
  }
  
  return { canOrder: true };
};
