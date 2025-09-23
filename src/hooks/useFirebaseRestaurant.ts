import { useEffect } from 'react';
import { useRestaurantStore } from '../store/restaurantStore';

export const useFirebaseRestaurant = () => {
  const { initializeFromFirebase, subscribeToUpdates } = useRestaurantStore();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeFirebase = async () => {
      try {
        // Only clear console in development
        if (process.env.NODE_ENV === 'development') {
          console.clear();
          console.log('🍽️ Bella Vista Restaurant Management System');
          console.log('🚀 Initializing restaurant status service...');
        }
        
        // Initialize restaurant status from Firebase
        await initializeFromFirebase();
        
        // Subscribe to real-time updates
        unsubscribe = subscribeToUpdates();
        
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Restaurant status service initialized successfully');
          console.log('💡 Tip: Deploy Firestore rules for real-time updates across all devices');
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Using local storage fallback for restaurant status');
        }
      }
    };

    initializeFirebase();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [initializeFromFirebase, subscribeToUpdates]);

  return useRestaurantStore();
};
