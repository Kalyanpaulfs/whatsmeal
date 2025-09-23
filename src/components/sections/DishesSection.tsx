import React, { useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, Filter, Grid, List, Star, TrendingUp } from 'lucide-react';
import DishCard from '../menu/DishCard';
import { useFirebaseMenu } from '../../hooks/useFirebaseMenu';
import type { MenuCategory } from '../../types/menu';

interface DishesSectionProps {
  categories: MenuCategory[];
  selectedCategory: string | null;
  onClearFilters: () => void;
}

const DishesSection: React.FC<DishesSectionProps> = ({
  categories,
  selectedCategory,
  onClearFilters,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'rating' | 'popular'>('default');
  
  // Get Firebase menu data
  const { sections, dishes, isLoading } = useFirebaseMenu();

  // Get filtered dishes based on selected category
  const allDishes = useMemo(() => {
    let dishesToShow = dishes;
    
    // If a category is selected, filter dishes by that section
    if (selectedCategory) {
      dishesToShow = dishes.filter(dish => dish.sectionId === selectedCategory);
    }
    
    const allDishesData = dishesToShow.map(dish => {
      const section = sections.find(s => s.id === dish.sectionId);
      return {
        ...dish,
        categoryName: section?.name || 'Unknown',
        categoryIcon: '📋' // Default icon for all categories
      };
    });

    // Sort dishes based on selected criteria
    switch (sortBy) {
      case 'price-low':
        return allDishesData.sort((a, b) => a.price - b.price);
      case 'price-high':
        return allDishesData.sort((a, b) => b.price - a.price);
      case 'rating':
        return allDishesData.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'popular':
        return allDishesData.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
      default:
        return allDishesData;
    }
  }, [dishes, sections, selectedCategory, sortBy]);

  // Calculate statistics
  const totalDishes = allDishes.length;
  const averageRating = totalDishes > 0 ? allDishes.reduce((sum, dish) => sum + (dish.rating || 0), 0) / totalDishes : 0;
  const priceRange = totalDishes > 0 ? {
    min: Math.min(...allDishes.map(dish => dish.price)),
    max: Math.max(...allDishes.map(dish => dish.price))
  } : { min: 0, max: 0 };

  // Show loading state
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-16 text-center"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading menu...</p>
      </motion.div>
    );
  }

  // If no dishes, show empty state
  if (allDishes.length === 0) {
    return (
      <motion.div
        className="text-center py-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-24 h-24 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Utensils className="w-12 h-12 text-secondary-400" />
        </div>
        <h3 className="text-2xl font-bold text-secondary-900 mb-4">
          {sections.length === 0 ? 'No menu sections found' : 'No dishes found'}
        </h3>
        <p className="text-secondary-600 mb-8 max-w-md mx-auto">
          {sections.length === 0 
            ? "The menu is empty. Please add sections and dishes through the Admin Panel."
            : selectedCategory 
              ? `No dishes available in ${categories.find(cat => cat.id === selectedCategory)?.name} category.`
              : "No dishes match your current selection."
          }
        </p>
        {sections.length === 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              To get started, go to Admin Panel → Menu Management → Add Section
            </p>
            <a
              href="/admin"
              className="inline-block px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition-colors duration-200"
            >
              Go to Admin Panel
            </a>
          </div>
        ) : (
          <button
            onClick={onClearFilters}
            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition-colors duration-200"
          >
            Clear Filters
          </button>
        )}
      </motion.div>
    );
  }


  return (
    <motion.section
      className="py-16 bg-gradient-to-b from-secondary-50 to-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Enhanced Section Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4 font-display">
            Our Delicious Dishes
          </h2>
          <p className="text-lg text-secondary-600 max-w-2xl mx-auto mb-6">
            {selectedCategory 
              ? `Explore our ${categories.find(cat => cat.id === selectedCategory)?.name} collection`
              : "Discover our complete menu with dishes from all categories"
            }
          </p>
          {selectedCategory && categories.find(cat => cat.id === selectedCategory)?.description && (
            <p className="text-sm text-secondary-500 max-w-xl mx-auto mb-6 italic">
              {categories.find(cat => cat.id === selectedCategory)?.description}
            </p>
          )}

          {/* Enhanced Statistics */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8">
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-purple-200">
              <Utensils className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">
                {totalDishes} Dishes
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-orange-200">
              <Star className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">
                {averageRating.toFixed(1)}★ Avg
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-green-200">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">
                ₹{priceRange.min} - ₹{priceRange.max}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Controls */}
        <motion.div
          className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-white/60 backdrop-blur-lg rounded-2xl p-4 border border-white/50 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Sort Options */}
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="default">Default</option>
              <option value="price-low">Price (Low to High)</option>
              <option value="price-high">Price (High to Low)</option>
              <option value="rating">Rating (High to Low)</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">View:</span>
            <div className="flex bg-white border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Dishes Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
              : "space-y-4"
            }
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {allDishes.map((dish, index) => {
              const key = `dish-${dish.id || `unknown-${index}`}-${dish.sectionId || `section-${index}`}-${index}`;
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.05 * index,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                  className={viewMode === 'list' ? 'flex' : ''}
                >
                  <DishCard dish={dish} />
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

      </div>
    </motion.section>
  );
};

export default memo(DishesSection);
