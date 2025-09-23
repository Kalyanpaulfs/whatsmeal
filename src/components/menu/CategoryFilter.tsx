import React from 'react';
import { motion } from 'framer-motion';
import { Utensils, Sun, Moon, Coffee, ChefHat, Cake, Salad } from 'lucide-react';
import type { MenuCategory } from '../../types/menu';

interface CategoryFilterProps {
  categories: MenuCategory[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  className?: string;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  className = '',
}) => {
  const handleCategoryClick = (categoryId: string | null) => {
    onCategorySelect(categoryId);
  };

  const activeCategories = categories.filter(category => category.isActive);

  // Map category IDs to their corresponding icons
  const getCategoryIcon = (categoryId: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      'breakfast': Sun,
      'lunch': Utensils,
      'dinner': Moon,
      'starters': Salad,
      'main-course': ChefHat,
      'beverages': Coffee,
      'desserts': Cake,
      'chefs-special': ChefHat,
    };
    return iconMap[categoryId] || Utensils;
  };

  return (
    <motion.div
      className={`${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* All Categories Button */}
      <div className="flex justify-center mb-8">
        <motion.button
          onClick={() => handleCategoryClick(null)}
          className={`group relative px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 ${
            selectedCategory === null
              ? 'bg-gradient-to-r from-primary-500 to-warm-500 text-white shadow-2xl scale-105'
              : 'bg-white/90 backdrop-blur-sm text-secondary-700 hover:bg-white hover:shadow-xl border-2 border-secondary-200'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="flex items-center space-x-4">
            <Utensils className="w-7 h-7" />
            <span>All Categories</span>
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${
              selectedCategory === null
                ? 'bg-white/20 text-white'
                : 'bg-primary-100 text-primary-700'
            }`}>
              {activeCategories.length}
            </span>
          </div>
        </motion.button>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {activeCategories.map((category, index) => (
          <motion.button
            key={category.id || `category-${index}`}
            onClick={() => handleCategoryClick(category.id)}
            className={`group relative p-6 rounded-2xl transition-all duration-300 ${
              selectedCategory === category.id
                ? 'bg-gradient-to-br from-primary-500 to-warm-500 text-white shadow-2xl scale-105'
                : 'bg-white/90 backdrop-blur-sm text-secondary-700 hover:bg-white hover:shadow-xl border-2 border-secondary-200'
            }`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-white/20'
                  : 'bg-primary-50 group-hover:bg-primary-100'
              }`}>
                {React.createElement(getCategoryIcon(category.id), {
                  className: `w-10 h-10 ${
                    selectedCategory === category.id
                      ? 'text-white'
                      : 'text-primary-600'
                  }`
                })}
              </div>
              
              <div className="text-center">
                <div className="font-bold text-base mb-2">{category.name}</div>
                {category.availableHours && (
                  <div className={`text-xs px-3 py-1 rounded-full font-medium ${
                    selectedCategory === category.id
                      ? 'bg-white/20 text-white'
                      : 'bg-success-100 text-success-700'
                  }`}>
                    {category.availableHours.start}-{category.availableHours.end}
                  </div>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default CategoryFilter;
