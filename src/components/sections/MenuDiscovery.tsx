import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

// Category Filter Component
const CategoryFilter: React.FC<{
  categories: any[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
}> = ({ categories, selectedCategory, onCategorySelect }) => {
  const handleCategoryClick = (categoryId: string | null) => {
    onCategorySelect(categoryId);
    
    // Scroll to dishes section after a short delay to allow state update
    setTimeout(() => {
      const dishesSection = document.querySelector('main');
      if (dishesSection) {
        dishesSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
      <button
        onClick={() => handleCategoryClick(null)}
        className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-all duration-300 ${
          !selectedCategory
            ? 'bg-purple-600 text-white shadow-lg hover:shadow-xl scale-105'
            : 'bg-white/80 text-gray-700 hover:bg-purple-50 hover:text-purple-600'
        }`}
      >
        All Items
      </button>
      {categories.map((category) => {
        // Handle both string icons and icon components
        const isStringIcon = typeof category.icon === 'string';
        
        return (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            title={category.description || category.name} // Show description on hover
            className={`flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-all duration-300 ${
              selectedCategory === category.id
                ? 'bg-purple-600 text-white shadow-lg hover:shadow-xl scale-105'
                : 'bg-white/80 text-gray-700 hover:bg-purple-50 hover:text-purple-600'
            }`}
          >
            {isStringIcon ? (
              <span className="text-lg">{category.icon}</span>
            ) : (
              <span className="text-lg">📋</span>
            )}
            <span>{category.name}</span>
          </button>
        );
      })}
    </div>
  );
};

interface MenuDiscoveryProps {
  categories?: any[];
  selectedCategory?: string | null;
  onCategorySelect?: (categoryId: string | null) => void;
}

const MenuDiscovery: React.FC<MenuDiscoveryProps> = ({
  categories = [],
  selectedCategory = null,
  onCategorySelect = () => {},
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 via-purple-50/50 to-pink-50/30 overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-pink-600/5 to-orange-600/5"></div>
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(147, 51, 234, 0.1) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        ></div>
        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-400/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-pink-400/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Enhanced Section Header */}
        <div className={`text-center mb-8 sm:mb-12 lg:mb-16 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {/* Premium Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-md rounded-full text-purple-600 text-sm font-medium mb-4 border border-purple-200/50">
            <Sparkles className="w-4 h-4 mr-2" />
            Premium Menu Collection
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent mb-4 sm:mb-6">
            Discover Our Menu
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
            Explore our carefully curated selection of premium dishes crafted with the finest ingredients
          </p>
          <div className="mt-4">
            <p className="text-sm text-gray-500 italic">
              Click any category below to view delicious dishes
            </p>
          </div>
        </div>

         {/* Category Filter */}
         <div className={`transition-all duration-700 delay-200 ${
           isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
         }`}>
           <CategoryFilter
             categories={categories}
             selectedCategory={selectedCategory}
             onCategorySelect={onCategorySelect}
           />
         </div>
      </div>
    </section>
  );
};

export default MenuDiscovery;