import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Truck, XCircle, AlertCircle } from 'lucide-react';
import { useRestaurantStore } from '../../store/restaurantStore';

const RestaurantStatusBanner: React.FC = () => {
  const { status, message, deliveryAvailable } = useRestaurantStore();

  const getStatusConfig = () => {
    switch (status) {
      case 'open':
        return {
          icon: Clock,
          bgColor: 'bg-green-500',
          textColor: 'text-white',
          iconColor: 'text-white',
          borderColor: 'border-green-400',
          pulseColor: 'bg-green-400'
        };
      case 'closed':
        return {
          icon: XCircle,
          bgColor: 'bg-red-500',
          textColor: 'text-white',
          iconColor: 'text-white',
          borderColor: 'border-red-400',
          pulseColor: 'bg-red-400'
        };
      case 'delivery-only':
        return {
          icon: Truck,
          bgColor: 'bg-orange-500',
          textColor: 'text-white',
          iconColor: 'text-white',
          borderColor: 'border-orange-400',
          pulseColor: 'bg-orange-400'
        };
      default:
        return {
          icon: AlertCircle,
          bgColor: 'bg-gray-500',
          textColor: 'text-white',
          iconColor: 'text-white',
          borderColor: 'border-gray-400',
          pulseColor: 'bg-gray-400'
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  // Don't show banner if restaurant is open and delivery is available (normal state)
  if (status === 'open' && deliveryAvailable) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        key="restaurant-status-banner"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
        className={`fixed top-0 left-0 right-0 z-50 ${config.bgColor} ${config.borderColor} border-b-2 shadow-lg`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              {/* Status Icon with Pulse Animation */}
              <div className="relative flex-shrink-0">
                <div className={`absolute inset-0 ${config.pulseColor} rounded-full animate-ping opacity-75`}></div>
                <div className={`relative ${config.iconColor} p-1.5 sm:p-2 rounded-full ${config.bgColor}`}>
                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              
              {/* Status Message */}
              <div className="min-w-0 flex-1">
                <h3 className={`font-semibold ${config.textColor} text-xs sm:text-sm md:text-base truncate`}>
                  {status === 'open' ? 'Restaurant Status' : 
                   status === 'closed' ? 'Currently Closed' : 
                   'Delivery Only'}
                </h3>
                <p className={`${config.textColor} text-xs sm:text-sm opacity-90 line-clamp-2`}>
                  {message}
                </p>
              </div>
            </div>

            {/* Delivery Status Indicator */}
            {status === 'delivery-only' && (
              <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 ml-2">
                <Truck className={`w-3 h-3 sm:w-4 sm:h-4 ${config.iconColor}`} />
                <span className={`${config.textColor} text-xs font-medium hidden sm:inline`}>
                  Delivery Available
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default memo(RestaurantStatusBanner);
