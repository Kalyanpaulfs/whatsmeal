export type OrderStatus = 'pending_whatsapp' | 'pending' | 'confirmation' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled';

export interface OrderItem {
  dishId: string;
  dishName: string;
  price: number;
  quantity: number;
  total: number;
  specialInstructions?: string;
}

export interface CustomerInfo {
  name: string;
  phoneNumber: string;
  address?: string;
  tablePreference?: string;
  pickupTime?: string;
}

export interface Order {
  id: string; // Firebase auto-generated ID
  orderCode: string; // Human-readable code like FD-20241201-1234
  customerInfo: CustomerInfo;
  items: OrderItem[];
  orderType: 'delivery' | 'pickup' | 'dine-in';
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  appliedCoupon?: {
    code: string;
    name: string;
    discountType: 'flat' | 'percentage';
    discountValue: number;
  };
  deliverySettings?: {
    restaurantLocation: {
      latitude: number;
      longitude: number;
      address: string;
    };
    deliveryRadius: number;
  };
  customerLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  estimatedDeliveryTime?: number; // in minutes
  actualDeliveryTime?: number; // in minutes
  notes?: string;
  isVip: boolean;
  isBlocked: boolean;
  whatsappMessageId?: string; // For tracking WhatsApp confirmation
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string; // When customer confirmed via WhatsApp
  preparedAt?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancelledReason?: string;
}

export interface OrderFormData {
  customerInfo: CustomerInfo;
  orderType: 'delivery' | 'pickup' | 'dine-in';
  notes?: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  orderType?: 'delivery' | 'pickup' | 'dine-in';
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string; // Order ID, phone number, or customer name
  isVip?: boolean;
  isBlocked?: boolean;
}

export interface OrderAnalytics {
  totalOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  outForDeliveryOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  topDishes: Array<{
    dishName: string;
    quantity: number;
    revenue: number;
  }>;
  ordersByType: {
    delivery: number;
    pickup: number;
    'dine-in': number;
  };
  recentOrders: Order[];
}

export interface OrderStatusUpdate {
  status: OrderStatus;
  notes?: string;
  cancelledReason?: string;
}

export interface WhatsAppOrderData {
  orderCode: string;
  customerName: string;
  phoneNumber: string;
  orderType: string;
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