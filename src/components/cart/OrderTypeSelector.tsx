import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Utensils, Clock, Truck, MapPin, User, Phone } from 'lucide-react';
// OrderType is defined inline as 'delivery' | 'pickup' | 'dine-in'
import Input from '../ui/Input';

interface OrderTypeSelectorProps {
  selectedType?: 'delivery' | 'pickup' | 'dine-in';
  onTypeChange?: (type: 'delivery' | 'pickup' | 'dine-in') => void;
  className?: string;
}

const OrderTypeSelector: React.FC<OrderTypeSelectorProps> = ({
  selectedType = 'dine-in',
  onTypeChange,
  className = '',
}) => {
  const [orderDetails, setOrderDetails] = useState({
    customerName: '',
    phoneNumber: '',
    tablePreference: '',
    pickupTime: '',
    deliveryAddress: '',
  });

  const orderTypes = [
    {
      id: 'dine-in' as const,
      name: 'Dine-In',
      icon: <Utensils className="w-5 h-5" />,
      description: 'Enjoy your meal at our restaurant',
      color: 'bg-blue-500',
      fields: ['customerName', 'phoneNumber', 'tablePreference'],
    },
    {
      id: 'pickup' as const,
      name: 'Pickup',
      icon: <Clock className="w-5 h-5" />,
      description: 'Order now, pick up later',
      color: 'bg-green-500',
      fields: ['customerName', 'phoneNumber', 'pickupTime'],
    },
    {
      id: 'delivery' as const,
      name: 'Delivery',
      icon: <Truck className="w-5 h-5" />,
      description: 'We deliver to your doorstep',
      color: 'bg-orange-500',
      fields: ['customerName', 'phoneNumber', 'deliveryAddress'],
    },
  ];

  const handleTypeSelect = (type: 'delivery' | 'pickup' | 'dine-in') => {
    onTypeChange?.(type);
  };

  const handleInputChange = (field: string, value: string) => {
    setOrderDetails(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const selectedOrderType = orderTypes.find(type => type.id === selectedType);

  return (
    <motion.div
      className={`space-y-4 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-lg font-semibold text-secondary-900">
        Order Type
      </h3>

      {/* Order Type Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {orderTypes.map((type, index) => (
          <motion.button
            key={type.id || `order-type-${index}`}
            onClick={() => handleTypeSelect(type.id)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              selectedType === type.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-secondary-200 hover:border-secondary-300'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex flex-col items-center space-y-2">
              <div className={`w-10 h-10 rounded-full ${type.color} flex items-center justify-center text-white`}>
                {type.icon}
              </div>
              <div className="text-center">
                <h4 className="font-medium text-secondary-900">{type.name}</h4>
                <p className="text-xs text-secondary-600">{type.description}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Order Details Form */}
      {selectedOrderType && (
        <motion.div
          className="bg-secondary-50 rounded-lg p-4 space-y-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <h4 className="font-medium text-secondary-900">
            {selectedOrderType.name} Details
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Name */}
            <Input
              label="Full Name"
              value={orderDetails.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              placeholder="Enter your full name"
              required
            />

            {/* Phone Number */}
            <Input
              label="Phone Number"
              value={orderDetails.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
              placeholder="Enter your phone number"
              type="tel"
              required
            />

            {/* Table Preference (Dine-in) */}
            {selectedType === 'dine-in' && (
              <div className="sm:col-span-2">
                <Input
                  label="Table Preference (Optional)"
                  value={orderDetails.tablePreference}
                  onChange={(e) => handleInputChange('tablePreference', e.target.value)}
                  leftIcon={<Utensils className="w-4 h-4" />}
                  placeholder="e.g., Window table, Quiet corner"
                />
              </div>
            )}

            {/* Pickup Time (Pickup) */}
            {selectedType === 'pickup' && (
              <div className="sm:col-span-2">
                <Input
                  label="Preferred Pickup Time"
                  value={orderDetails.pickupTime}
                  onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                  leftIcon={<Clock className="w-4 h-4" />}
                  placeholder="e.g., 7:00 PM"
                />
              </div>
            )}

            {/* Delivery Address (Delivery) */}
            {selectedType === 'delivery' && (
              <div className="sm:col-span-2">
                <Input
                  label="Delivery Address"
                  value={orderDetails.deliveryAddress}
                  onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                  leftIcon={<MapPin className="w-4 h-4" />}
                  placeholder="Enter your complete address"
                  required
                />
                <p className="text-xs text-secondary-500 mt-1">
                  We deliver within a 3km radius
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default OrderTypeSelector;
