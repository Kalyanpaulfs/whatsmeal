import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import type { Dish } from '../types/menu';

export const useCart = () => {
  const {
    items,
    isOpen,
    isLoading,
    orderType,
    addItem,
    removeItem,
    updateQuantity,
    updateSpecialInstructions,
    setOrderType,
    clearCart,
    toggleCart,
    openCart,
    closeCart,
    setLoading,
    getItemQuantity,
    getCartSummary,
    getTotalItems,
  } = useCartStore();
  
  const { addToast } = useToastStore();

  const addToCart = (dish: Dish, quantity = 1, specialInstructions = '') => {
    addItem(dish, quantity, specialInstructions);
    
    // Show success toast with a slight delay to allow animation to start
    setTimeout(() => {
      addToast({
        type: 'success',
        title: 'Added to Cart!',
        message: `${dish.name} has been added to your cart.`,
        duration: 3000
      });
    }, 500);
  };

  const removeFromCart = (dishId: string) => {
    // Get dish name before removing
    const item = items.find(item => item.dish.id === dishId);
    const dishName = item?.dish.name || 'Item';
    
    removeItem(dishId);
    
    // Show info toast
    addToast({
      type: 'info',
      title: 'Removed from Cart',
      message: `${dishName} has been removed from your cart.`,
      duration: 3000
    });
  };

  const changeQuantity = (dishId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(dishId);
    } else {
      // Get dish name before updating
      const item = items.find(item => item.dish.id === dishId);
      const dishName = item?.dish.name || 'Item';
      
      updateQuantity(dishId, quantity);
      
      // Show info toast for quantity update
      addToast({
        type: 'info',
        title: 'Quantity Updated',
        message: `${dishName} quantity updated to ${quantity}.`,
        duration: 2000
      });
    }
  };

  const updateInstructions = (dishId: string, instructions: string) => {
    updateSpecialInstructions(dishId, instructions);
  };

  const isEmpty = items.length === 0;
  const totalItems = getTotalItems();
  const cartSummary = getCartSummary();

  return {
    // State
    items,
    isOpen,
    isLoading,
    isEmpty,
    totalItems,
    cartSummary,
    orderType,
    
    // Actions
    addToCart,
    removeFromCart,
    changeQuantity,
    updateInstructions,
    setOrderType,
    clearCart,
    toggleCart,
    openCart,
    closeCart,
    setLoading,
    
    // Getters
        getItemQuantity,
        getCartSummary,
        getTotalItems,
      };
};
