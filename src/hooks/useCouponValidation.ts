import { useEffect } from 'react';
import { useCouponStore } from '../store/couponStore';
import { useCartStore } from '../store/cartStore';
import { useDeliverySettingsStore } from '../store/deliverySettingsStore';

export const useCouponValidation = () => {
  const { appliedCoupon, removeCoupon } = useCouponStore();
  const { getCartSummary } = useCartStore();
  const { activeSettings } = useDeliverySettingsStore();

  useEffect(() => {
    if (!appliedCoupon) return;

    // Get current cart summary
    const cartSummary = getCartSummary(activeSettings, appliedCoupon);
    const currentSubtotal = cartSummary.subtotal;

    // Check if cart still meets minimum purchase requirement
    if (currentSubtotal < appliedCoupon.coupon.minimumPurchaseAmount) {
      console.log('=== COUPON AUTO-REMOVAL ===');
      console.log('Current subtotal:', currentSubtotal);
      console.log('Required minimum:', appliedCoupon.coupon.minimumPurchaseAmount);
      console.log('Removing coupon automatically');
      console.log('=== END AUTO-REMOVAL ===');
      
      // Remove the coupon as it no longer meets requirements
      removeCoupon();
      return;
    }

    // Check if coupon has reached its usage limit
    if (appliedCoupon.coupon.usageLimit && appliedCoupon.coupon.usedCount >= appliedCoupon.coupon.usageLimit) {
      console.log('=== COUPON USAGE LIMIT REACHED ===');
      console.log('Coupon:', appliedCoupon.coupon.code);
      console.log('Used count:', appliedCoupon.coupon.usedCount);
      console.log('Usage limit:', appliedCoupon.coupon.usageLimit);
      console.log('Removing coupon automatically');
      console.log('=== END USAGE LIMIT CHECK ===');
      
      // Remove the coupon as it has reached its usage limit
      removeCoupon();
      return;
    }

    // Check if coupon is still valid (dates, active status)
    const now = new Date();
    const startDate = new Date(appliedCoupon.coupon.startDate + 'T00:00:00');
    const endDate = new Date(appliedCoupon.coupon.endDate + 'T23:59:59');
    
    if (!appliedCoupon.coupon.isActive || now < startDate || now > endDate) {
      console.log('=== COUPON EXPIRED/INACTIVE ===');
      console.log('Coupon:', appliedCoupon.coupon.code);
      console.log('Is active:', appliedCoupon.coupon.isActive);
      console.log('Start date:', startDate);
      console.log('End date:', endDate);
      console.log('Current time:', now);
      console.log('Removing coupon automatically');
      console.log('=== END EXPIRY CHECK ===');
      
      // Remove the coupon as it's expired or inactive
      removeCoupon();
      return;
    }
  }, [appliedCoupon, getCartSummary, activeSettings, removeCoupon]);
};
