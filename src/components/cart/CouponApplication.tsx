import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, X, Check, AlertCircle } from 'lucide-react';
import { useCouponStore } from '../../store/couponStore';
import { useCartStore } from '../../store/cartStore';
import Button from '../ui/Button';
import Input from '../ui/Input';
import type { DeliverySettings } from '../../types/deliverySettings';

interface CouponApplicationProps {
  deliverySettings?: DeliverySettings | null;
}

const CouponApplication: React.FC<CouponApplicationProps> = ({ deliverySettings }) => {
  const [couponCode, setCouponCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    appliedCoupon,
    validateCoupon,
    applyCoupon,
    removeCoupon,
  } = useCouponStore();

  const { getCartSummary } = useCartStore();
  const cartTotal = getCartSummary().total;
  
  // Get the cart summary WITHOUT applied coupon to get the original subtotal
  const cartSummary = getCartSummary(deliverySettings, null);
  const safeTotalPrice = cartSummary.subtotal || 0;

  // Check if applied coupon is still valid
  const isCouponValid = appliedCoupon ? safeTotalPrice >= appliedCoupon.coupon.minimumPurchaseAmount : true;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('=== COUPON DEBUG ===');
      console.log('Coupon code:', couponCode.trim());
      console.log('Safe total price (subtotal):', safeTotalPrice);
      console.log('Cart summary:', cartSummary);
      
      const result = await validateCoupon(couponCode.trim(), safeTotalPrice);
      
      console.log('Validation result:', result);
      
      if (result.isValid && result.coupon && result.discountAmount !== undefined) {
        // Create applied coupon with just the coupon data
        // Discount will be calculated dynamically in cart store
        const appliedCoupon = {
          coupon: result.coupon
        };
        
        console.log('Applied coupon (discount will be calculated dynamically):', appliedCoupon);
        console.log('=== END DEBUG ===');
        
        applyCoupon(result.coupon, cartTotal);
        setSuccess(`Coupon "${result.coupon.code}" applied successfully!`);
        setCouponCode('');
      } else {
        setError(result.error || 'Invalid coupon code');
      }
    } catch (error) {
      setError('Error applying coupon. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setSuccess('');
    setError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApplyCoupon();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Coupon Input Section */}
      {!appliedCoupon && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Tag className="w-4 h-4 text-gray-600" />
            <h3 className="text-sm font-medium text-gray-900">Apply Coupon</h3>
          </div>
          
          <div className="flex space-x-2">
            <Input
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value.toUpperCase());
                setError('');
                setSuccess('');
              }}
              onKeyPress={handleKeyPress}
              placeholder="Enter coupon code"
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={handleApplyCoupon}
              disabled={isLoading || !couponCode.trim()}
              size="sm"
              className="px-4"
            >
              {isLoading ? 'Applying...' : 'Apply'}
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 mt-2 text-red-600 text-sm"
            >
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 mt-2 text-green-600 text-sm"
            >
              <Check className="w-4 h-4" />
              <span>{success}</span>
            </motion.div>
          )}
        </div>
      )}

      {/* Applied Coupon Display */}
      {appliedCoupon && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-lg p-4 ${
            isCouponValid 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isCouponValid 
                  ? 'bg-green-100' 
                  : 'bg-red-100'
              }`}>
                {isCouponValid ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
              </div>
              <div>
                <h4 className={`text-sm font-medium ${
                  isCouponValid ? 'text-green-900' : 'text-red-900'
                }`}>
                  {appliedCoupon.coupon.name}
                </h4>
                <p className={`text-xs font-mono ${
                  isCouponValid ? 'text-green-700' : 'text-red-700'
                }`}>
                  {appliedCoupon.coupon.code}
                </p>
                <p className={`text-xs ${
                  isCouponValid ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isCouponValid ? (
                    appliedCoupon.coupon.discountType === 'flat' 
                      ? `₹${appliedCoupon.coupon.discountValue} off`
                      : `${appliedCoupon.coupon.discountValue}% off`
                  ) : (
                    `Minimum ₹${appliedCoupon.coupon.minimumPurchaseAmount} required`
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className={`p-1 transition-colors ${
                isCouponValid 
                  ? 'text-green-600 hover:text-green-800' 
                  : 'text-red-600 hover:text-red-800'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

    </motion.div>
  );
};

export default CouponApplication;
