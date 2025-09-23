import type { Dish } from './menu';

export interface CartItem {
  dish: Dish;
  quantity: number;
  specialInstructions?: string;
  addedAt: Date;
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  total: number;
  itemCount: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
}
