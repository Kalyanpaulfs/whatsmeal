import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, AlertTriangle, X, CheckCircle, RefreshCw } from 'lucide-react';

interface LocationWarningProps {
  isVisible: boolean;
  type: 'success' | 'error' | 'warning';
  title: string;
  message: string;
  distance?: number;
  maxRadius?: number;
  onClose?: () => void;
  onRetry?: () => void;
  onContinue?: () => void;
}

const LocationWarning: React.FC<LocationWarningProps> = ({
  isVisible,
  type,
  title,
  message,
  distance,
  maxRadius,
  onClose,
  onRetry,
  onContinue
}) => {
  const getIconAndColors = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          titleColor: 'text-green-800',
          messageColor: 'text-green-700',
          buttonColor: 'bg-green-600 hover:bg-green-700'
        };
      case 'error':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700',
          buttonColor: 'bg-red-600 hover:bg-red-700'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
        };
      default:
        return {
          icon: AlertTriangle,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600',
          titleColor: 'text-gray-800',
          messageColor: 'text-gray-700',
          buttonColor: 'bg-gray-600 hover:bg-gray-700'
        };
    }
  };

  const config = getIconAndColors();
  const IconComponent = config.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-4"
        >
          {/* Backdrop - Only on desktop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm sm:block hidden"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Desktop backdrop clicked');
              if (onClose) onClose();
            }}
          />
          
          {/* Mobile backdrop - lighter overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 sm:hidden"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Mobile backdrop clicked');
              if (onClose) onClose();
            }}
          />
          
          {/* Warning Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-full max-w-sm sm:max-w-md ${config.bgColor} ${config.borderColor} border rounded-2xl shadow-2xl`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 pb-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${config.iconColor} bg-white/80`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className={`font-semibold text-lg ${config.titleColor}`}>
                  {title}
                </h3>
              </div>
              {onClose && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Close button clicked');
                    onClose();
                  }}
                  className={`p-2 rounded-full hover:bg-black/10 transition-colors ${config.iconColor}`}
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Distance Info (if provided) */}
            {distance !== undefined && maxRadius !== undefined && (
              <div className="px-4 pb-3">
                <div className="bg-white/60 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className={`w-4 h-4 ${config.iconColor}`} />
                      <span className="text-sm font-medium text-gray-700">Your Distance</span>
                    </div>
                    <span className={`text-xl font-bold ${config.iconColor}`}>
                      {distance.toFixed(1)} km
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Delivery Radius</span>
                    <span className="font-medium">{maxRadius} km</span>
                  </div>
                </div>
              </div>
            )}

            {/* Message */}
            <div className="px-4 pb-4">
              <div className={`rounded-xl p-3 bg-white/60 border ${config.borderColor}/50`}>
                <p className={`text-sm leading-relaxed ${config.messageColor}`}>
                  {message}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-4 pb-4">
              <div className="flex flex-col sm:flex-row gap-2">
                {onRetry && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Retry button clicked');
                      onRetry();
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Try Again</span>
                  </button>
                )}
                {onContinue && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Continue button clicked');
                      onContinue();
                    }}
                    className={`flex-1 font-medium py-2.5 px-4 rounded-xl transition-colors duration-200 text-sm text-white ${config.buttonColor}`}
                  >
                    Continue
                  </button>
                )}
                {onClose && !onRetry && !onContinue && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Got It button clicked');
                      onClose();
                    }}
                    className={`flex-1 font-medium py-2.5 px-4 rounded-xl transition-colors duration-200 text-sm text-white ${config.buttonColor}`}
                  >
                    Got It
                  </button>
                )}
              </div>
            </div>

            {/* Additional Info for Error Cases */}
            {type === 'error' && (
              <div className="px-4 pb-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                  <p className="text-xs text-yellow-800 leading-relaxed">
                    💡 <strong>Tip:</strong> You can still place an order for pickup! 
                    Just change the order type to "Pickup" in your cart.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LocationWarning;
