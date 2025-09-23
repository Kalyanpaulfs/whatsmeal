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
    }
  }, [appliedCoupon, getCartSummary, activeSettings, removeCoupon]);
};
