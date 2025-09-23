import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Truck, XCircle } from 'lucide-react';
import { useRestaurantStore } from '../../store/restaurantStore';

interface OrderBlockedBannerProps {
  reason: string;
}

const OrderBlockedBanner: React.FC<OrderBlockedBannerProps> = ({ reason }) => {
  const { status } = useRestaurantStore();

  const getIconAndColor = () => {
    switch (status) {
      case 'closed':
        return {
          icon: XCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          textColor: 'text-red-800'
        };
      case 'delivery-only':
        return {
          icon: Truck,
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          iconColor: 'text-orange-600',
          textColor: 'text-orange-800'
        };
      default:
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          textColor: 'text-yellow-800'
        };
    }
  };

  const config = getIconAndColor();
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 mb-4`}
    >
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 ${config.iconColor}`}>
          <IconComponent className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold ${config.textColor} text-sm mb-1`}>
            Order Not Available
          </h3>
          <p className={`${config.textColor} text-sm`}>
            {reason}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderBlockedBanner;
