import { useState, useEffect } from 'react';
import { useMenuStore } from '../store/menuStore';
import { useFirebaseMenu } from './useFirebaseMenu';

export const useMenu = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const {
    sections,
    dishes,
    isLoading: firebaseLoading,
    error,
    getDishesBySection,
  } = useFirebaseMenu();
  
  const {
    setSelectedCategory: setStoreSelectedCategory,
    setSearchQuery: setStoreSearchQuery,
  } = useMenuStore();

  // Show loading until Firebase data is loaded, but not indefinitely
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  useEffect(() => {
    // Set initial load complete after a reasonable time
    const timer = setTimeout(() => {
      setInitialLoadComplete(true);
    }, 2000); // 2 seconds timeout

    return () => clearTimeout(timer);
  }, []);

  // Don't show loading if we have data or if initial load is complete
  const isLoading = firebaseLoading && !initialLoadComplete && sections.length === 0;

  // Debug logging (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('useMenu - Firebase loading state:', firebaseLoading);
      console.log('useMenu - Sections count:', sections.length);
      console.log('useMenu - Dishes count:', dishes.length);
      console.log('useMenu - Error:', error);
      console.log('useMenu - Initial load complete:', initialLoadComplete);
    }
  }, [firebaseLoading, sections.length, dishes.length, error, initialLoadComplete]);

  // Initialize sample data if database is empty
  useEffect(() => {
    if (initialLoadComplete && sections.length === 0 && !firebaseLoading) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Database appears to be empty, you can add sections via Admin Panel');
      }
    }
  }, [initialLoadComplete, sections.length, firebaseLoading]);

  // Convert Firebase sections to categories format for backward compatibility
  // Only include active sections in frontend
  const categories = sections
    .filter(section => section.isActive) // Only show active sections
    .map(section => ({
      id: section.id,
      name: section.name,
      icon: '📋', // Default icon for all sections
      description: section.description,
      isActive: section.isActive,
    }));

  // Handle category selection
  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setStoreSelectedCategory(categoryId);
  };

  // Handle search
  const handleSearch = (query: string) => {
    setStoreSearchQuery(query);
  };

  // Handle search clear
  const handleSearchClear = () => {
    setStoreSearchQuery('');
  };

  // Handle clear all filters
  const handleClearFilters = () => {
    setSelectedCategory(null);
    setStoreSelectedCategory(null);
    setStoreSearchQuery('');
  };

  // Get filtered dishes based on selected category
  const getFilteredDishes = () => {
    // First filter dishes to only include those from active sections
    const activeSectionIds = sections.filter(s => s.isActive).map(s => s.id);
    const activeDishes = dishes.filter(dish => activeSectionIds.includes(dish.sectionId || ''));
    
    if (selectedCategory) {
      // If a category is selected, show only dishes from that section
      return getDishesBySection(selectedCategory);
    }
    
    // If no category selected, show all active dishes
    return activeDishes;
  };

  const filteredDishesList = getFilteredDishes();

  return {
    // State
    categories,
    filteredDishes: filteredDishesList,
    selectedCategory,
    isLoading,
    error,
    
    // Actions
    handleCategorySelect,
    handleSearch,
    handleSearchClear,
    handleClearFilters,
    
    // Computed values
    totalDishesLength: dishes.length,
  };
};
