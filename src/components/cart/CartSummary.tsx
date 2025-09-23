import React from 'react';
import { motion } from 'framer-motion';
import type { CartSummary as CartSummaryType } from '../../types/cart';
import { formatPrice } from '../../utils/formatters';

interface CartSummaryProps {
  summary: CartSummaryType;
  showItemCount?: boolean;
  className?: string;
}

const CartSummary: React.FC<CartSummaryProps> = ({
  summary,
  showItemCount = true,
  className = '',
}) => {
  const {
    subtotal,
    tax,
    deliveryFee,
    discount,
    total,
    itemCount,
  } = summary;

  return (
    <motion.div
      className={`bg-secondary-50 rounded-lg p-4 space-y-3 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="font-semibold text-secondary-900 mb-3">
        Order Summary
        {showItemCount && (
          <span className="text-sm font-normal text-secondary-600 ml-2">
            ({itemCount} item{itemCount !== 1 ? 's' : ''})
          </span>
        )}
      </h3>

      <div className="space-y-2">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-secondary-600">Subtotal</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>

        {/* Tax */}
        <div className="flex justify-between text-sm">
          <span className="text-secondary-600">Tax (18% GST)</span>
          <span className="font-medium">{formatPrice(tax)}</span>
        </div>

        {/* Delivery Fee */}
        <div className="flex justify-between text-sm">
          <span className="text-secondary-600">Delivery Fee</span>
          <span className="font-medium">
            {deliveryFee > 0 ? formatPrice(deliveryFee) : 'Free'}
          </span>
        </div>

        {/* Discount */}
        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount</span>
            <span className="font-medium">-{formatPrice(discount)}</span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-secondary-200 pt-2">
          <div className="flex justify-between text-base font-semibold">
            <span className="text-secondary-900">Total</span>
            <span className="price-text text-lg">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Delivery Info */}
      {deliveryFee === 0 && (
        <motion.div
          className="bg-success-50 border border-success-200 rounded-lg p-3 mt-3"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success-500 rounded-full"></div>
            <span className="text-sm text-success-700 font-medium">
              Free delivery on orders above ₹499
            </span>
          </div>
        </motion.div>
      )}

      {/* Minimum Order Warning */}
      {subtotal < 299 && (
        <motion.div
          className="bg-warning-50 border border-warning-200 rounded-lg p-3 mt-3"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
            <span className="text-sm text-warning-700">
              Add ₹{299 - subtotal} more for minimum order
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CartSummary;
