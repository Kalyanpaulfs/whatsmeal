import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, CartSummary } from '../types/cart';
import type { Dish } from '../types/menu';
import type { AppliedCoupon } from '../types/coupon';
import type { DeliverySettings } from '../types/deliverySettings';
import { useCouponStore } from './couponStore';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  orderType: string;
  
  // Actions
  addItem: (dish: Dish, quantity?: number, specialInstructions?: string) => void;
  removeItem: (dishId: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  updateSpecialInstructions: (dishId: string, instructions: string) => void;
  setOrderType: (orderType: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  setLoading: (loading: boolean) => void;
  
  // Getters
  getItemQuantity: (dishId: string) => number;
  getCartSummary: (deliverySettings?: DeliverySettings | null, appliedCoupon?: AppliedCoupon | null) => CartSummary;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const calculateCartSummary = (
  items: CartItem[], 
  orderType: string = 'delivery', 
  appliedCoupon: AppliedCoupon | null = null,
  deliverySettings: DeliverySettings | null = null
): CartSummary => {
  const safeItems = items || [];
  const subtotal = safeItems.reduce((sum, item) => sum + (item.dish.price * item.quantity), 0);
  
  // No tax calculation
  const tax = 0;
  
  // Delivery fee calculation - use dynamic settings from admin panel
  let deliveryFee = 0;
  if (orderType === 'delivery' && deliverySettings) {
    // Check if order meets minimum order amount
    if (subtotal >= deliverySettings.minimumOrderAmount) {
      // Check if order qualifies for free delivery
      if (subtotal >= deliverySettings.freeDeliveryThreshold) {
        deliveryFee = 0; // Free delivery
      } else {
        deliveryFee = deliverySettings.deliveryFee; // Apply delivery fee
      }
    } else {
      // Order doesn't meet minimum amount - still apply delivery fee but show warning
      deliveryFee = deliverySettings.deliveryFee;
    }
  } else if (orderType === 'delivery' && !deliverySettings) {
    // Fallback to hardcoded values if delivery settings not available
    if (subtotal < 300) {
      deliveryFee = 20; // ₹20 for orders below ₹300
    } else if (subtotal >= 300 && subtotal <= 500) {
      deliveryFee = 10; // ₹10 for orders ₹300-500
    } else {
      deliveryFee = 0; // Free for orders above ₹500
    }
  }
  // For dine-in and pickup orders, delivery fee is always 0
  
  // Calculate discount dynamically based on current subtotal
  let discount = 0;
  if (appliedCoupon) {
    // Check if cart still meets minimum purchase requirement
    if (subtotal < appliedCoupon.coupon.minimumPurchaseAmount) {
      // Cart no longer meets minimum requirement - discount should be 0
      // Note: We don't remove the coupon here as it would cause infinite re-renders
      // The coupon will be removed by the component when it detects this condition
      discount = 0;
    } else {
      // Recalculate discount based on current subtotal
      if (appliedCoupon.coupon.discountType === 'flat') {
        discount = Math.min(appliedCoupon.coupon.discountValue, subtotal);
      } else {
        // Percentage discount
        discount = (subtotal * appliedCoupon.coupon.discountValue) / 100;
      }
      discount = Math.round(discount * 100) / 100;
    }
  }
  
  const total = Math.round((subtotal + deliveryFee - discount) * 100) / 100;
  const itemCount = safeItems.reduce((sum, item) => sum + item.quantity, 0);

  // Debug logging
  if (appliedCoupon) {
    console.log('=== DYNAMIC DISCOUNT DEBUG ===');
    console.log('Current Subtotal:', subtotal);
    console.log('Coupon Type:', appliedCoupon.coupon.discountType);
    console.log('Coupon Value:', appliedCoupon.coupon.discountValue);
    console.log('Calculated Discount:', discount);
    console.log('Delivery Fee:', deliveryFee);
    console.log('Total calculation:', subtotal, '+', deliveryFee, '-', discount, '=', total);
    console.log('=== END DYNAMIC DEBUG ===');
  }

  return {
    items: safeItems,
    subtotal,
    tax,
    deliveryFee,
    discount,
    total,
    itemCount,
  };
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isLoading: false,
      orderType: 'delivery',

      addItem: (dish: Dish, quantity = 1, specialInstructions = '') => {
        set((state) => {
          const existingItem = state.items.find(item => item.dish.id === dish.id);
          
          if (existingItem) {
            // Update existing item
            const updatedItems = state.items.map(item =>
              item.dish.id === dish.id
                ? {
                    ...item,
                    quantity: item.quantity + quantity,
                    specialInstructions: specialInstructions || item.specialInstructions,
                  }
                : item
            );
            return { items: updatedItems };
          } else {
            // Add new item
            const newItem: CartItem = {
              dish,
              quantity,
              specialInstructions,
              addedAt: new Date(),
            };
            return { items: [...state.items, newItem] };
          }
        });
      },

      removeItem: (dishId: string) => {
        set((state) => ({
          items: state.items.filter(item => item.dish.id !== dishId),
        }));
      },

      updateQuantity: (dishId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(dishId);
          return;
        }

        set((state) => ({
          items: state.items.map(item =>
            item.dish.id === dishId
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      updateSpecialInstructions: (dishId: string, instructions: string) => {
        set((state) => ({
          items: state.items.map(item =>
            item.dish.id === dishId
              ? { ...item, specialInstructions: instructions }
              : item
          ),
        }));
      },

      setOrderType: (orderType: string) => {
        set({ orderType });
      },

      clearCart: () => {
        set({ items: [] });
        // Also clear any applied coupon when cart is cleared
        // This prevents coupon reuse after order placement
        const { removeCoupon } = useCouponStore.getState();
        removeCoupon();
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      getItemQuantity: (dishId: string) => {
        const item = get().items.find(item => item.dish.id === dishId);
        return item ? item.quantity : 0;
      },

      getCartSummary: (deliverySettings?: DeliverySettings | null, appliedCoupon?: AppliedCoupon | null) => {
        return calculateCartSummary(get().items, get().orderType, appliedCoupon, deliverySettings);
      },

      getTotalItems: () => {
        const items = get().items || [];
        return items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalPrice: () => {
        const items = get().items || [];
        return items.reduce((sum, item) => sum + (item.dish.price * item.quantity), 0);
      },
          
        }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
