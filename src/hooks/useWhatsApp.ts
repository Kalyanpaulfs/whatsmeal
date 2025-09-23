import { useCallback } from 'react';
import type { CartItem } from '../types/cart';
import type { Order } from '../types/order';
import { generateOrderMessage, openWhatsApp, shareOrder, copyOrderToClipboard } from '../utils/whatsappUtils';
import { RESTAURANT_CONFIG } from '../lib/config';

interface UseWhatsAppReturn {
  sendOrder: (items: CartItem[], orderDetails: Order, total: number) => void;
  shareOrderMessage: (items: CartItem[], orderDetails: Order, total: number) => Promise<void>;
  copyOrderMessage: (items: CartItem[], orderDetails: Order, total: number) => Promise<boolean>;
}

export const useWhatsApp = (): UseWhatsAppReturn => {
  const sendOrder = useCallback((
    items: CartItem[],
    orderDetails: Order,
    total: number
  ) => {
    const message = generateOrderMessage(
      items,
      orderDetails,
      RESTAURANT_CONFIG.name,
      total
    );
    
    // Generate WhatsApp URL
    const whatsappUrl = `https://wa.me/${RESTAURANT_CONFIG.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    
    openWhatsApp(whatsappUrl);
  }, []);

  const shareOrderMessage = useCallback(async (
    items: CartItem[],
    orderDetails: Order,
    total: number
  ) => {
    await shareOrder(
      items,
      orderDetails,
      RESTAURANT_CONFIG.name,
      total
    );
  }, []);

  const copyOrderMessage = useCallback(async (
    items: CartItem[],
    orderDetails: Order,
    total: number
  ): Promise<boolean> => {
    const message = generateOrderMessage(
      items,
      orderDetails,
      RESTAURANT_CONFIG.name,
      total
    );
    
    return await copyOrderToClipboard(message);
  }, []);

  return {
    sendOrder,
    shareOrderMessage,
    copyOrderMessage,
  };
};
