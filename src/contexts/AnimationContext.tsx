import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import FlyingDishAnimation from '../components/animations/FlyingDishAnimation';
import type { Dish } from '../types/menu';

interface AnimationContextType {
  triggerFlyingDishAnimation: (
    dish: Dish,
    startElement: HTMLElement,
    endElement: HTMLElement
  ) => void;
}

interface FlyingAnimation {
  id: string;
  dish: Dish;
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

interface AnimationProviderProps {
  children: ReactNode;
}

export const AnimationProvider: React.FC<AnimationProviderProps> = ({ children }) => {
  const [flyingAnimations, setFlyingAnimations] = useState<FlyingAnimation[]>([]);

  const getElementPosition = (element: HTMLElement): { x: number; y: number } => {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  };

  const triggerFlyingDishAnimation = (
    dish: Dish,
    startElement: HTMLElement,
    endElement: HTMLElement
  ) => {
    const startPosition = getElementPosition(startElement);
    const endPosition = getElementPosition(endElement);
    
    const animationId = `flying-${dish.id}-${Date.now()}`;
    
    const newAnimation: FlyingAnimation = {
      id: animationId,
      dish,
      startPosition,
      endPosition
    };

    setFlyingAnimations(prev => [...prev, newAnimation]);
  };

  const removeFlyingAnimation = (animationId: string) => {
    setFlyingAnimations(prev => prev.filter(anim => anim.id !== animationId));
  };

  const handleAnimationComplete = (animationId: string) => {
    // Trigger cart bounce effect
    const cartButton = document.querySelector('[data-cart-button]') as HTMLElement;
    if (cartButton) {
      cartButton.style.animation = 'none';
      cartButton.offsetHeight; // Trigger reflow
      cartButton.style.animation = 'cartBounce 0.6s ease-out';
    }
    
    // Remove animation after a short delay
    setTimeout(() => {
      removeFlyingAnimation(animationId);
    }, 100);
  };

  return (
    <AnimationContext.Provider value={{ triggerFlyingDishAnimation }}>
      {children}
      
      {/* Flying animations container */}
      <AnimatePresence>
        {flyingAnimations.map((animation) => (
          <FlyingDishAnimation
            key={animation.id}
            dish={animation.dish}
            startPosition={animation.startPosition}
            endPosition={animation.endPosition}
            onComplete={() => handleAnimationComplete(animation.id)}
            duration={0.9}
          />
        ))}
      </AnimatePresence>
    </AnimationContext.Provider>
  );
};

export const useAnimation = (): AnimationContextType => {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};
