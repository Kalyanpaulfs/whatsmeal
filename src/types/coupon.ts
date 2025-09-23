// Coupon Interface
export interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  discountType: 'flat' | 'percentage';
  discountValue: number; // Flat amount or percentage
  minimumPurchaseAmount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageLimit?: number; // Optional: max number of uses
  usedCount: number; // Track how many times it's been used
  createdAt: string;
  updatedAt: string;
}

// Form Data Interface for Coupon Creation/Editing
export interface CouponFormData {
  code: string;
  name: string;
  description: string;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  minimumPurchaseAmount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageLimit?: number;
}

// Applied Coupon Interface (for cart)
export interface AppliedCoupon {
  coupon: Coupon;
  appliedAt: string;
  discountAmount: number;
  finalAmount: number;
}

// Coupon Validation Result
export interface CouponValidationResult {
  isValid: boolean;
  error?: string;
  coupon?: Coupon;
  discountAmount?: number;
}

// Coupon Store State Interface
export interface CouponState {
  coupons: Coupon[];
  appliedCoupon: AppliedCoupon | null;
  isLoading: boolean;
  error: string | null;
  unsubscribe: (() => void) | null;
  
  // Actions
  fetchCoupons: () => Promise<void>;
  addCoupon: (couponData: CouponFormData) => Promise<void>;
  updateCoupon: (couponId: string, couponData: Partial<CouponFormData>) => Promise<void>;
  deleteCoupon: (couponId: string) => Promise<void>;
  toggleCouponStatus: (couponId: string) => Promise<void>;
  
  // Coupon Application
  validateCoupon: (code: string, cartTotal: number) => Promise<CouponValidationResult>;
  applyCoupon: (coupon: Coupon, cartTotal: number) => void;
  removeCoupon: () => void;
  
  // Getters
  getActiveCoupons: () => Coupon[];
  getCouponById: (couponId: string) => Coupon | undefined;
  getCouponByCode: (code: string) => Coupon | undefined;
  
  // Real-time subscriptions
  subscribeToCoupons: () => (() => void);
  unsubscribeFromCoupons: () => void;
}
