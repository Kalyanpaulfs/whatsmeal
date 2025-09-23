import { DeliverySettingsService } from '../services/deliverySettingsService';
import type { DeliverySettingsFormData } from '../types/deliverySettings';

export const initializeSampleDeliverySettings = async (): Promise<void> => {
  try {
    console.log('Initializing sample delivery settings...');

    // Check if delivery settings already exist
    const existingSettings = await DeliverySettingsService.getDeliverySettings();
    if (existingSettings.length > 0) {
      console.log('Delivery settings already exist. Skipping initialization.');
      return;
    }

    // Create sample delivery settings
    const sampleSettings: DeliverySettingsFormData = {
      deliveryRadius: 5, // 5km radius
      restaurantLocation: {
        latitude: 19.0760,
        longitude: 72.8777,
        address: '123 Food Street, Downtown, Mumbai 400001',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        postalCode: '400001',
      },
      deliveryFee: 49,
      freeDeliveryThreshold: 499,
      minimumOrderAmount: 299,
      estimatedDeliveryTime: 30,
      isActive: true,
    };

    await DeliverySettingsService.addDeliverySettings(sampleSettings);
    console.log('Sample delivery settings created successfully!');
  } catch (error) {
    console.error('Error initializing sample delivery settings:', error);
    throw error;
  }
};
