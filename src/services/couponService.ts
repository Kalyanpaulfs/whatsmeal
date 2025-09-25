import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Coupon, CouponFormData, CouponValidationResult } from '../types/coupon';

const COUPONS_COLLECTION = 'coupons';

export class CouponService {
  // ===== COUPON MANAGEMENT =====
  
  // Get all coupons
  static async getCoupons(): Promise<Coupon[]> {
    try {
      const couponsRef = collection(db, COUPONS_COLLECTION);
      const querySnapshot = await getDocs(couponsRef);
      
      const coupons = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Coupon));
      
      // Sort by creation date (newest first)
      return coupons.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Error fetching coupons:', error);
      throw error;
    }
  }

  // Get active coupons
  static async getActiveCoupons(): Promise<Coupon[]> {
    try {
      const couponsRef = collection(db, COUPONS_COLLECTION);
      const q = query(
        couponsRef,
        where('isActive', '==', true)
      );
      const querySnapshot = await getDocs(q);
      
      const coupons = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Coupon));
      
      // Filter by date validity and usage limits
      const now = new Date();
      return coupons.filter(coupon => {
        // Check date validity
        const startDate = new Date(coupon.startDate + 'T00:00:00');
        const endDate = new Date(coupon.endDate + 'T23:59:59');
        const isDateValid = startDate <= now && endDate >= now;
        
        // Check usage limits
        const hasUsageLeft = !coupon.usageLimit || coupon.usedCount < coupon.usageLimit;
        
        return isDateValid && hasUsageLeft;
      });
    } catch (error) {
      console.error('Error fetching active coupons:', error);
      throw error;
    }
  }

  // Add new coupon
  static async addCoupon(couponData: CouponFormData): Promise<string> {
    try {
      console.log('CouponService: Adding coupon with data:', couponData);
      
      // Check if coupon code already exists
      const existingCoupon = await this.getCouponByCode(couponData.code);
      if (existingCoupon) {
        throw new Error(`Coupon code "${couponData.code}" already exists!`);
      }
      
      const couponsRef = collection(db, COUPONS_COLLECTION);
      
      // Filter out undefined values to avoid Firebase errors
      const cleanCouponData = Object.fromEntries(
        Object.entries(couponData).filter(([_, value]) => value !== undefined)
      );
      
      const newCoupon = {
        ...cleanCouponData,
        usedCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      console.log('CouponService: New coupon data:', newCoupon);
      const docRef = await addDoc(couponsRef, newCoupon);
      console.log('CouponService: Coupon added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('CouponService: Error adding coupon:', error);
      throw error;
    }
  }

  // Update coupon
  static async updateCoupon(couponId: string, couponData: Partial<CouponFormData>): Promise<void> {
    try {
      const couponRef = doc(db, COUPONS_COLLECTION, couponId);
      
      // If updating code, check for duplicates
      if (couponData.code) {
        const existingCoupon = await this.getCouponByCode(couponData.code);
        if (existingCoupon && existingCoupon.id !== couponId) {
          throw new Error(`Coupon code "${couponData.code}" already exists!`);
        }
      }
      
      // Filter out undefined values to avoid Firebase errors
      const cleanCouponData = Object.fromEntries(
        Object.entries(couponData).filter(([_, value]) => value !== undefined)
      );
      
      await updateDoc(couponRef, {
        ...cleanCouponData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating coupon:', error);
      throw error;
    }
  }

  // Delete coupon
  static async deleteCoupon(couponId: string): Promise<void> {
    try {
      const couponRef = doc(db, COUPONS_COLLECTION, couponId);
      await deleteDoc(couponRef);
    } catch (error) {
      console.error('Error deleting coupon:', error);
      throw error;
    }
  }

  // Toggle coupon status
  static async toggleCouponStatus(couponId: string): Promise<void> {
    try {
      const couponRef = doc(db, COUPONS_COLLECTION, couponId);
      const couponDoc = await getDoc(couponRef);
      
      if (couponDoc.exists()) {
        const currentData = couponDoc.data() as Coupon;
        await updateDoc(couponRef, {
          isActive: !currentData.isActive,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error toggling coupon status:', error);
      throw error;
    }
  }

  // Get coupon by code
  static async getCouponByCode(code: string): Promise<Coupon | null> {
    try {
      const couponsRef = collection(db, COUPONS_COLLECTION);
      const q = query(
        couponsRef,
        where('code', '==', code.toUpperCase())
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as Coupon;
    } catch (error) {
      console.error('Error fetching coupon by code:', error);
      throw error;
    }
  }

  // ===== COUPON VALIDATION =====
  
  // Increment coupon usage count
  static async incrementCouponUsage(couponCode: string): Promise<void> {
    try {
      console.log('CouponService: Incrementing usage for coupon:', couponCode);
      
      // Get the coupon by code
      const coupon = await this.getCouponByCode(couponCode);
      if (!coupon) {
        throw new Error(`Coupon with code "${couponCode}" not found`);
      }
      
      const newUsedCount = coupon.usedCount + 1;
      
      // Check if coupon has reached its usage limit
      const shouldExpire = coupon.usageLimit && newUsedCount >= coupon.usageLimit;
      
      // Update the usedCount and optionally expire the coupon
      const couponRef = doc(db, COUPONS_COLLECTION, coupon.id);
      const updateData: any = {
        usedCount: newUsedCount,
        updatedAt: serverTimestamp()
      };
      
      // If usage limit is reached, automatically expire the coupon
      if (shouldExpire) {
        updateData.isActive = false;
        console.log('CouponService: Coupon expired due to usage limit reached:', couponCode);
      }
      
      await updateDoc(couponRef, updateData);
      
      console.log('CouponService: Usage count incremented for coupon:', couponCode, 'New count:', newUsedCount);
      if (shouldExpire) {
        console.log('CouponService: Coupon automatically expired and removed from customer offers');
      }
    } catch (error) {
      console.error('CouponService: Error incrementing coupon usage:', error);
      throw error;
    }
  }
  
  // Validate coupon
  static async validateCoupon(code: string, cartTotal: number): Promise<CouponValidationResult> {
    try {
      const coupon = await this.getCouponByCode(code);
      
      if (!coupon) {
        return {
          isValid: false,
          error: 'Invalid coupon code'
        };
      }
      
      // Check if coupon is active
      if (!coupon.isActive) {
        return {
          isValid: false,
          error: 'This coupon is no longer active'
        };
      }
      
      // Check date validity
      const now = new Date();
      // Fix timezone issues by creating dates at start/end of day in local timezone
      const startDate = new Date(coupon.startDate + 'T00:00:00');
      const endDate = new Date(coupon.endDate + 'T23:59:59');
      
      if (now < startDate) {
        return {
          isValid: false,
          error: 'This coupon is not yet valid'
        };
      }
      
      if (now > endDate) {
        return {
          isValid: false,
          error: 'This coupon has expired'
        };
      }
      
      // Check minimum purchase amount
      if (cartTotal < coupon.minimumPurchaseAmount) {
        return {
          isValid: false,
          error: `Minimum purchase amount of ₹${coupon.minimumPurchaseAmount} required`
        };
      }
      
      // Check usage limit
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return {
          isValid: false,
          error: 'This coupon has reached its usage limit'
        };
      }
      
      // Calculate discount amount
      let discountAmount = 0;
      if (coupon.discountType === 'flat') {
        discountAmount = Math.min(coupon.discountValue, cartTotal);
      } else {
        discountAmount = (cartTotal * coupon.discountValue) / 100;
      }
      
      return {
        isValid: true,
        coupon,
        discountAmount
      };
    } catch (error) {
      console.error('Error validating coupon:', error);
      return {
        isValid: false,
        error: 'Error validating coupon'
      };
    }
  }

  // ===== REAL-TIME LISTENERS =====
  
  // Listen to coupons changes
  static subscribeToCoupons(callback: (coupons: Coupon[]) => void): Unsubscribe {
    const couponsRef = collection(db, COUPONS_COLLECTION);
    
    return onSnapshot(couponsRef, (querySnapshot) => {
      const coupons = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Coupon));
      
      // Sort by creation date (newest first)
      const sortedCoupons = coupons.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      callback(sortedCoupons);
    });
  }
}
