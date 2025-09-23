import type { Location } from '../types/common';

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: 'Geolocation is not supported by this browser',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        reject({
          code: error.code,
          message: error.message,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

export const isWithinDeliveryRadius = (
  userLocation: Location,
  restaurantLocation: Location,
  radiusKm: number
): boolean => {
  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    restaurantLocation.latitude,
    restaurantLocation.longitude
  );
  
  return distance <= radiusKm;
};

export const getLocationFromCoordinates = async (
  latitude: number,
  longitude: number
): Promise<Location> => {
  try {
    // Using a reverse geocoding service (you might want to use a real service like Google Maps API)
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }
    
    const data = await response.json();
    
    return {
      latitude,
      longitude,
      address: data.locality || 'Unknown Address',
      city: data.city || data.locality,
      state: data.principalSubdivision,
      country: data.countryName,
      postalCode: data.postcode,
    };
  } catch (error) {
    console.error('Error fetching location:', error);
    return {
      latitude,
      longitude,
      address: 'Location not available',
    };
  }
};

export const formatLocationError = (error: GeolocationError): string => {
  switch (error.code) {
    case 1:
      return 'Location access denied. Please enable location permissions.';
    case 2:
      return 'Location unavailable. Please check your internet connection.';
    case 3:
      return 'Location request timed out. Please try again.';
    default:
      return 'Unable to get your location. Please try again.';
  }
};
