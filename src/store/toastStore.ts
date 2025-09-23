import { create } from 'zustand';
import type { ToastMessage } from '../types/common';

interface ToastState {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  
  addToast: (toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = {
      ...toast,
      id,
      duration: toast.duration || 5000, // Default 5 seconds
    };
    
    set((state) => ({
      toasts: [...state.toasts, newToast]
    }));
    
    // Auto remove toast after duration
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter(t => t.id !== id)
      }));
    }, newToast.duration);
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter(t => t.id !== id)
    }));
  },
  
  clearToasts: () => {
    set({ toasts: [] });
  }
}));
