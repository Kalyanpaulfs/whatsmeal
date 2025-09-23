import { useState, useCallback } from 'react';
import type { Location } from '../types/common';
import { getCurrentLocation, getLocationFromCoordinates, isWithinDeliveryRadius, formatLocationError, calculateDistance } from '../utils/locationUtils';
import { useDeliverySettingsStore } from '../store/deliverySettingsStore';

interface UseLocationReturn {
  location: Location | null;
  isLoading: boolean;
  error: string | null;
  isWithinRadius: boolean;
  distance: number | null;
  getLocation: () => Promise<void>;
  clearLocation: () => void;
  checkDeliveryAvailability: (userLocation: Location) => boolean;
}

export const useLocation = (): UseLocationReturn => {
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWithinRadius, setIsWithinRadius] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  
  const { activeSettings } = useDeliverySettingsStore();

  const getLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const position = await getCurrentLocation();
      const locationData = await getLocationFromCoordinates(
        position.latitude,
        position.longitude
      );
      
      setLocation(locationData);
      
      // Check if within delivery radius using dynamic settings
      if (activeSettings) {
        const withinRadius = isWithinDeliveryRadius(
          locationData,
          activeSettings.restaurantLocation,
          activeSettings.deliveryRadius
        );
        
        setIsWithinRadius(withinRadius);
        
        // Calculate distance using proper Haversine formula
        const dist = calculateDistance(
          locationData.latitude,
          locationData.longitude,
          activeSettings.restaurantLocation.latitude,
          activeSettings.restaurantLocation.longitude
        );
        
        setDistance(dist);
      } else {
        // Fallback to default behavior if no active settings
        setIsWithinRadius(false);
        setDistance(null);
      }
    } catch (err: any) {
      const errorMessage = formatLocationError(err);
      setError(errorMessage);
      console.error('Location error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeSettings]);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
    setIsWithinRadius(false);
    setDistance(null);
  }, []);

  const checkDeliveryAvailability = useCallback((userLocation: Location): boolean => {
    if (!activeSettings) {
      return false;
    }
    
    return isWithinDeliveryRadius(
      userLocation,
      activeSettings.restaurantLocation,
      activeSettings.deliveryRadius
    );
  }, [activeSettings]);

  return {
    location,
    isLoading,
    error,
    isWithinRadius,
    distance,
    getLocation,
    clearLocation,
    checkDeliveryAvailability,
  };
};
