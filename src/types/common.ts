export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface RestaurantInfo {
  name: string;
  description: string;
  phone: string;
  whatsappNumber: string;
  address: string;
  location: Location;
  deliveryRadius: number; // in kilometers
  operatingHours: {
    [key: string]: {
      open: string;
      close: string;
      isClosed: boolean;
    };
  };
  deliveryFee: number;
  minimumOrderAmount: number;
  estimatedDeliveryTime: number; // in minutes
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}
