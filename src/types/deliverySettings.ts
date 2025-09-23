export interface DeliverySettings {
  id: string;
  deliveryRadius: number; // in kilometers
  restaurantLocation: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  deliveryFee: number;
  freeDeliveryThreshold: number;
  minimumOrderAmount: number;
  estimatedDeliveryTime: number; // in minutes
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeliverySettingsFormData {
  deliveryRadius: number;
  restaurantLocation: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  deliveryFee: number;
  freeDeliveryThreshold: number;
  minimumOrderAmount: number;
  estimatedDeliveryTime: number;
  isActive: boolean;
}

export interface LocationValidationResult {
  isValid: boolean;
  error?: string;
  distance?: number;
}
