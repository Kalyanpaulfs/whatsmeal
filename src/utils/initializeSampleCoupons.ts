import { CouponService } from '../services/couponService';
import type { CouponFormData } from '../types/coupon';

export const initializeSampleCoupons = async (): Promise<boolean> => {
  try {
    console.log('Initializing sample coupons...');
    
    const sampleCoupons: CouponFormData[] = [
      {
        code: 'WELCOME10',
        name: 'Welcome Offer',
        description: 'Get 10% off on your first order',
        discountType: 'percentage',
        discountValue: 10,
        minimumPurchaseAmount: 200,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        isActive: true,
        usageLimit: 100,
      },
      {
        code: 'FLAT100',
        name: 'Flat Discount',
        description: 'Get ₹100 off on orders above ₹500',
        discountType: 'flat',
        discountValue: 100,
        minimumPurchaseAmount: 500,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days from now
        isActive: true,
        usageLimit: 50,
      },
      {
        code: 'DUBAI20',
        name: 'Dubai Special',
        description: 'Special offer for Dubai customers - 20% off',
        discountType: 'percentage',
        discountValue: 20,
        minimumPurchaseAmount: 300,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        isActive: true,
        usageLimit: 25,
      },
      {
        code: 'FREEDELIVERY',
        name: 'Free Delivery',
        description: 'Free delivery on orders above ₹200',
        discountType: 'flat',
        discountValue: 20, // Assuming delivery fee is ₹20
        minimumPurchaseAmount: 200,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days from now
        isActive: true,
        usageLimit: 200,
      },
      {
        code: 'UNLIMITED',
        name: 'Unlimited Use',
        description: 'No usage limit coupon for testing',
        discountType: 'percentage',
        discountValue: 5,
        minimumPurchaseAmount: 100,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        isActive: true,
        // No usageLimit field - this will be filtered out
      },
    ];

    let successCount = 0;
    for (const couponData of sampleCoupons) {
      try {
        await CouponService.addCoupon(couponData);
        console.log(`✓ Added coupon: ${couponData.code}`);
        successCount++;
      } catch (error) {
        console.log(`⚠ Coupon ${couponData.code} might already exist:`, error);
      }
    }

    console.log(`Sample coupons initialization complete. Added ${successCount}/${sampleCoupons.length} coupons.`);
    return true;
  } catch (error) {
    console.error('Error initializing sample coupons:', error);
    return false;
  }
};
