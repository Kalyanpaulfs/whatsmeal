import { create } from 'zustand';
import { CouponService } from '../services/couponService';
import type { Coupon, CouponFormData, CouponState, CouponValidationResult, AppliedCoupon } from '../types/coupon';

// Helper function to calculate discount
const calculateDiscount = (coupon: Coupon, cartTotal: number): number => {
  if (coupon.discountType === 'percentage') {
    return (cartTotal * coupon.discountValue) / 100;
  } else {
    return Math.min(coupon.discountValue, cartTotal);
  }
};

export const useCouponStore = create<CouponState>()((set, get) => ({
  coupons: [],
  appliedCoupon: null,
  isLoading: false,
  error: null,
  unsubscribe: null,

  // Fetch coupons
  fetchCoupons: async () => {
    set({ isLoading: true, error: null });
    try {
      const coupons = await CouponService.getCoupons();
      set({ coupons, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch coupons',
        isLoading: false 
      });
    }
  },

  // Add coupon
  addCoupon: async (couponData: CouponFormData) => {
    console.log('Store: Adding coupon with data:', couponData);
    set({ isLoading: true, error: null });
    try {
      const couponId = await CouponService.addCoupon(couponData);
      console.log('Store: Coupon added with ID:', couponId);
      // Refresh coupons
      await get().fetchCoupons();
      console.log('Store: Coupons refreshed');
    } catch (error: any) {
      console.error('Store: Error adding coupon:', error);
      set({ 
        error: error.message || 'Failed to add coupon',
        isLoading: false 
      });
      throw error;
    }
  },

  // Update coupon
  updateCoupon: async (couponId: string, couponData: Partial<CouponFormData>) => {
    set({ isLoading: true, error: null });
    try {
      await CouponService.updateCoupon(couponId, couponData);
      // Refresh coupons
      await get().fetchCoupons();
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to update coupon',
        isLoading: false 
      });
      throw error;
    }
  },

  // Delete coupon
  deleteCoupon: async (couponId: string) => {
    set({ isLoading: true, error: null });
    try {
      await CouponService.deleteCoupon(couponId);
      // Refresh coupons
      await get().fetchCoupons();
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to delete coupon',
        isLoading: false 
      });
      throw error;
    }
  },

  // Toggle coupon status
  toggleCouponStatus: async (couponId: string) => {
    set({ isLoading: true, error: null });
    try {
      await CouponService.toggleCouponStatus(couponId);
      // Refresh coupons
      await get().fetchCoupons();
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to toggle coupon status',
        isLoading: false 
      });
      throw error;
    }
  },

  // Validate coupon
  validateCoupon: async (code: string, cartTotal: number): Promise<CouponValidationResult> => {
    try {
      return await CouponService.validateCoupon(code, cartTotal);
    } catch (error: any) {
      console.error('Store: Error validating coupon:', error);
      return {
        isValid: false,
        error: error.message || 'Error validating coupon'
      };
    }
  },

  // Apply coupon
  applyCoupon: (coupon: Coupon, cartTotal: number) => {
    const appliedCoupon: AppliedCoupon = {
      coupon,
      appliedAt: new Date().toISOString(),
      discountAmount: calculateDiscount(coupon, cartTotal),
      finalAmount: cartTotal - calculateDiscount(coupon, cartTotal)
    };
    set({ appliedCoupon });
  },

  // Remove coupon
  removeCoupon: () => {
    set({ appliedCoupon: null });
  },

  // Get active coupons
  getActiveCoupons: () => {
    const { coupons } = get();
    const now = new Date();
    
    return coupons.filter(coupon => {
      if (!coupon.isActive) return false;
      
      // Fix timezone issues by creating dates at start/end of day in local timezone
      const startDate = new Date(coupon.startDate + 'T00:00:00');
      const endDate = new Date(coupon.endDate + 'T23:59:59');
      
      return startDate <= now && endDate >= now;
    });
  },

  // Get coupon by ID
  getCouponById: (couponId: string) => {
    const { coupons } = get();
    return coupons.find(coupon => coupon.id === couponId);
  },

  // Get coupon by code
  getCouponByCode: (code: string) => {
    const { coupons } = get();
    return coupons.find(coupon => coupon.code.toUpperCase() === code.toUpperCase());
  },

  // Subscribe to real-time coupon updates
  subscribeToCoupons: () => {
    const { unsubscribe } = get();
    
    // Clean up existing subscription
    if (unsubscribe) {
      unsubscribe();
    }
    
    set({ isLoading: true, error: null });
    
    const newUnsubscribe = CouponService.subscribeToCoupons((coupons) => {
      console.log('Real-time coupon update received:', coupons.length, 'coupons');
      set({ coupons, isLoading: false, error: null });
    });
    
    set({ unsubscribe: newUnsubscribe });
    return newUnsubscribe;
  },

  // Unsubscribe from real-time updates
  unsubscribeFromCoupons: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null });
    }
  },
}));
