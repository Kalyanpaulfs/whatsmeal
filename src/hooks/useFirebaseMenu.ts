import { useEffect } from 'react';
import { useMenuStore } from '../store/menuStore';
import { MenuService } from '../services/menuService';

export const useFirebaseMenu = () => {
  const {
    sections,
    dishes,
    isLoading,
    error,
    fetchSections,
    fetchDishes,
    getDishesBySection,
    getSectionById,
    getDishById,
  } = useMenuStore();

  useEffect(() => {
    let isMounted = true;

    // Initialize menu data
    const initializeMenu = async () => {
      try {
        await Promise.all([fetchSections(), fetchDishes()]);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to initialize menu:', error);
        }
      }
    };

    initializeMenu();

    // Set up real-time listeners
    const unsubscribeSections = MenuService.subscribeToSections((sections) => {
      if (isMounted) {
        // Update sections in store
        useMenuStore.setState({ sections });
      }
    });

    const unsubscribeDishes = MenuService.subscribeToDishes((dishes) => {
      if (isMounted) {
        // Update dishes in store
        useMenuStore.setState({ dishes });
      }
    });

    // Cleanup listeners on unmount
    return () => {
      isMounted = false;
      unsubscribeSections();
      unsubscribeDishes();
    };
  }, [fetchSections, fetchDishes]);

  return {
    sections,
    dishes,
    isLoading,
    error,
    getDishesBySection,
    getSectionById,
    getDishById,
  };
};
