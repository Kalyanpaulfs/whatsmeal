import React from 'react';
import { ShoppingCart, Menu, X, Clock, Star, Zap, Package, Search } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useRestaurantStore } from '../../store/restaurantStore';
import Badge from '../ui/Badge';
import LogoImage from '../../assets/logo.png';

interface NavbarProps {
  isScrolled: boolean;
  isMobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
  onCategoryClick: (categoryId: string) => void;
  categories: Array<{
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }>;
}

const Navbar: React.FC<NavbarProps> = ({
  isScrolled = false,
  isMobileMenuOpen = false,
  onMobileMenuToggle = () => {},
  onCategoryClick = () => {},
  categories = [
    { id: 'appetizers', name: 'Appetizers', icon: Star },
    { id: 'mains', name: 'Main Courses', icon: Zap },
    { id: 'desserts', name: 'Desserts', icon: Star, badge: 'New' },
    { id: 'beverages', name: 'Beverages', icon: Zap }
  ]
}) => {
  const { totalItems, openCart } = useCart();
  const { status, deliveryAvailable } = useRestaurantStore();
  
  // Calculate top position based on status banner visibility
  const hasStatusBanner = status !== 'open' || !deliveryAvailable;
  const topPosition = hasStatusBanner ? 'top-14 sm:top-16 md:top-18' : 'top-0';

  return (
    <header 
      className={`fixed ${topPosition} left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-xl border-b border-gray-200/50' 
          : 'bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 backdrop-blur-md border-b border-purple-700/50'
      }`}
      style={!hasStatusBanner ? { paddingTop: 'env(safe-area-inset-top)' } : {}}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
          
          {/* Logo Section */}
          <div className="flex items-center space-x-3 min-w-0 flex-shrink-0">
            <div className="relative group">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden">
                <img 
                  src={LogoImage} 
                  alt="Bella Vista Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="min-w-0">
              <h1 className={`text-xl font-bold drop-shadow-lg ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}>
                Bella Vista
              </h1>
              <div className="hidden lg:flex items-center space-x-1">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                <span className={`text-xs font-medium ${
                  isScrolled ? 'text-gray-600' : 'text-gray-200'
                }`}>Premium Dining</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation - Show only Chef's Special */}
          <nav className="hidden lg:flex items-center space-x-1">
            {categories
              .filter(category => category.id === 'chefs-special')
              .map((category, index) => (
                <button
                  key={category.id || `navbar-category-${index}`}
                  onClick={() => onCategoryClick(category.id)}
                  className="group relative flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl transition-all duration-300 hover:from-purple-700 hover:to-pink-700 hover:shadow-lg hover:scale-105"
                >
                  <category.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-semibold">{category.name}</span>
                  {category.badge && (
                    <Badge variant="warning" size="sm" className="text-xs ml-1 bg-yellow-400 text-yellow-900">
                      {category.badge}
                    </Badge>
                  )}
                </button>
              ))}
          </nav>

          {/* Action Section */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Operating Hours - Only show on very large screens */}
            <div className="hidden 2xl:flex items-center space-x-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm">
              <Clock className="w-4 h-4" />
              <span className="font-medium">Open: 9AM - 11PM</span>
            </div>

            {/* My Orders Button - Desktop */}
            <button
              onClick={() => window.location.href = '/my-orders'}
              className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              <Package className="w-4 h-4" />
              <span className="text-sm font-medium">My Orders</span>
            </button>

            {/* Track Order Button - Desktop */}
            <button
              onClick={() => window.location.href = '/track-order'}
              className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              <Search className="w-4 h-4" />
              <span className="text-sm font-medium">Track Order</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2 text-purple-600 hover:text-white hover:bg-purple-600 rounded-lg transition-all duration-300 border border-purple-200 hover:border-purple-600"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <Badge
                  variant="error"
                  size="sm"
                  className="absolute -top-1 -right-1 min-w-[18px] h-5 flex items-center justify-center text-xs font-bold"
                >
                  {totalItems > 99 ? '99+' : totalItems}
                </Badge>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={onMobileMenuToggle}
              className={`lg:hidden p-2 text-purple-600 hover:text-white hover:bg-purple-600 rounded-lg transition-all duration-300 border border-purple-200 hover:border-purple-600 ${
                isMobileMenuOpen ? 'bg-purple-600 text-white border-purple-600' : ''
              }`}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

    </header>
  );
};

export default Navbar;