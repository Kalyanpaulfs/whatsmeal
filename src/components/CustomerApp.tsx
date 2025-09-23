import React, { useCallback } from 'react';
import Header from './layout/Header';
import Footer from './layout/Footer';
import HeroSection from './sections/HeroSection';
import MenuDiscovery from './sections/MenuDiscovery';
import DishesSection from './sections/DishesSection';
import LoadingScreen from './common/LoadingScreen';
import CartDrawer from './cart/CartDrawer';
import RestaurantStatusBanner from './common/RestaurantStatusBanner';
import OfferBanner from './common/OfferBanner';
import { useMenu } from '../hooks/useMenu';
import { useFirebaseMenu } from '../hooks/useFirebaseMenu';
import { useFirebaseRestaurant } from '../hooks/useFirebaseRestaurant';

const CustomerApp: React.FC = () => {
  const {
    categories,
    selectedCategory,
    isLoading,
    handleCategorySelect,
    handleClearFilters,
  } = useMenu();

  // Initialize Firebase services
  useFirebaseRestaurant();
  useFirebaseMenu();

  // Memoize callback functions to prevent unnecessary re-renders
  const handleExploreMenu = useCallback(() => {
    // Clear category filter to show all dishes
    handleCategorySelect(null);
    
    // Scroll to dishes section after a short delay
    setTimeout(() => {
      const dishesSection = document.querySelector('main');
      if (dishesSection) {
        dishesSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  }, [handleCategorySelect]);

  const handleViewSpecials = useCallback(() => {
    // Route to Chef's Special category
    handleCategorySelect('chefs-special');
    
    // Scroll to dishes section after a short delay
    setTimeout(() => {
      const dishesSection = document.querySelector('main');
      if (dishesSection) {
        dishesSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  }, [handleCategorySelect]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Restaurant Status Banner */}
      <RestaurantStatusBanner />
      
      {/* Header */}
      <Header
        onCategoryClick={handleCategorySelect}
        selectedCategory={selectedCategory}
        categories={categories}
      />

      {/* Hero Section */}
      <HeroSection 
        onExploreMenu={handleExploreMenu}
        onViewSpecials={handleViewSpecials}
      />

      {/* Offer Banner - Positioned above menu discovery */}
      <OfferBanner />

      {/* Menu Discovery Section */}
      <MenuDiscovery
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
      />

          {/* Dishes Section */}
          <main>
            <DishesSection
              categories={categories}
              selectedCategory={selectedCategory}
              onClearFilters={handleClearFilters}
            />
          </main>

      {/* Footer */}
      <Footer />

      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  );
};

export default CustomerApp;
