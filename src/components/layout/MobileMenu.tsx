import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Package, Search } from 'lucide-react';
import { useRestaurantStore } from '../../store/restaurantStore';
import Badge from '../ui/Badge';

interface MobileMenuProps {
  isOpen: boolean;
  onCategoryClick: (categoryId: string | null) => void;
  categories: Array<{
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }>;
  selectedCategory?: string | null;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onCategoryClick,
  categories,
  selectedCategory = null
}) => {
  const { status, deliveryAvailable } = useRestaurantStore();
  
  // Calculate top position based on status banner visibility
  const hasStatusBanner = status !== 'open' || !deliveryAvailable;
  const topPosition = hasStatusBanner ? 'top-28 sm:top-32 md:top-36' : 'top-16 sm:top-18 md:top-20';
  const maxHeight = hasStatusBanner ? 'max-h-[calc(100vh-7rem)]' : 'max-h-[calc(100vh-4rem)]';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="mobile-menu"
          className={`lg:hidden fixed ${topPosition} left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30 ${maxHeight} overflow-y-auto`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="px-4 py-4">
            {/* Scroll indicator */}
            <div className="text-center mb-4">
              <div className="w-8 h-1 bg-gray-300 rounded-full mx-auto"></div>
            </div>
            
            {/* All Items Button */}
            <div className="mb-4">
              <button
                onClick={() => onCategoryClick(null)}
                className={`w-full flex items-center space-x-3 p-3 text-left rounded-lg transition-all duration-200 border ${
                  !selectedCategory
                    ? 'text-white bg-purple-600 border-purple-600 shadow-lg'
                    : 'text-gray-700 hover:text-white hover:bg-purple-600 border-gray-100 hover:border-purple-200'
                }`}
              >
                <div className={`flex-shrink-0 p-1.5 rounded-md ${
                  !selectedCategory ? 'bg-purple-700' : 'bg-purple-50'
                }`}>
                  <span className={`text-lg ${
                    !selectedCategory ? 'text-white' : 'text-purple-600'
                  }`}>🍽️</span>
                </div>
                <div className="flex-1">
                  <span className={`font-medium text-sm ${
                    !selectedCategory ? 'text-white' : 'text-gray-900'
                  }`}>
                    All Items
                  </span>
                  <p className={`text-xs ${
                    !selectedCategory ? 'text-purple-100' : 'text-gray-500'
                  }`}>
                    View all available dishes
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <ChefHat className={`w-4 h-4 ${
                    !selectedCategory ? 'text-white' : 'text-gray-400'
                  }`} />
                </div>
              </button>
            </div>
            
            {/* Menu Categories */}
            <div className="space-y-2">
              {categories.map((category, index) => {
                const isSelected = selectedCategory === category.id;
                return (
                  <button
                    key={category.id || `category-${index}`}
                    onClick={() => onCategoryClick(category.id)}
                    className={`w-full flex items-center space-x-3 p-3 text-left rounded-lg transition-all duration-200 border ${
                      isSelected
                        ? 'text-white bg-purple-600 border-purple-600 shadow-lg'
                        : 'text-gray-700 hover:text-white hover:bg-purple-600 border-gray-100 hover:border-purple-200'
                    }`}
                  >
                    <div className={`flex-shrink-0 p-1.5 rounded-md ${
                      isSelected ? 'bg-purple-700' : 'bg-purple-50'
                    }`}>
                      <category.icon className={`w-4 h-4 ${
                        isSelected ? 'text-white' : 'text-purple-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <span className={`font-medium text-sm ${
                        isSelected ? 'text-white' : 'text-gray-900'
                      }`}>
                        {category.name}
                      </span>
                      {category.badge && (
                        <Badge 
                          variant="warning" 
                          size="sm" 
                          className={`ml-2 text-xs ${
                            isSelected ? 'bg-yellow-400 text-yellow-900' : ''
                          }`}
                        >
                          {category.badge}
                        </Badge>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <ChefHat className={`w-4 h-4 ${
                        isSelected ? 'text-white' : 'text-gray-400'
                      }`} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navigation Items */}
            <div className="pt-4 border-t border-gray-200">
              <div className="space-y-2">
                <button
                  onClick={() => window.location.href = '/my-orders'}
                  className="w-full flex items-center space-x-3 p-3 text-left rounded-lg transition-all duration-200 border text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-blue-200 hover:border-blue-300 hover:shadow-lg"
                >
                  <div className="flex-shrink-0 p-1.5 rounded-md bg-blue-700">
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-sm text-white">My Orders</span>
                    <p className="text-xs text-blue-100">View your past orders</p>
                  </div>
                </button>

                <button
                  onClick={() => window.location.href = '/track-order'}
                  className="w-full flex items-center space-x-3 p-3 text-left rounded-lg transition-all duration-200 border text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-green-200 hover:border-green-300 hover:shadow-lg"
                >
                  <div className="flex-shrink-0 p-1.5 rounded-md bg-green-700">
                    <Search className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-sm text-white">Track Order</span>
                    <p className="text-xs text-green-100">Track your order status</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
