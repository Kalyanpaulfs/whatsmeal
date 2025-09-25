import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useAnimation } from '../../contexts/AnimationContext';
import type { Dish } from '../../types/menu';

// Sample dish data for demo
const sampleDish: Dish = {
  id: 'demo-dish',
  name: 'Demo Pizza',
  description: 'A delicious demonstration pizza',
  price: 12.99,
  image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
  sectionId: 'mains',
  isAvailable: true,
  preparationTime: 20,
  isVegetarian: false,
  isVegan: false,
  isSpicy: false,
  ingredients: ['Tomato', 'Cheese', 'Basil'],
  allergens: ['Dairy'],
  nutritionInfo: {
    calories: 250,
    protein: 12,
    carbs: 30,
    fat: 8
  }
};

const AnimationDemo: React.FC = () => {
  const { triggerFlyingDishAnimation } = useAnimation();
  const dishRef = useRef<HTMLDivElement>(null);

  const handleDemoAnimation = () => {
    if (dishRef.current) {
      const cartButton = document.querySelector('[data-cart-button]') as HTMLElement;
      if (cartButton) {
        triggerFlyingDishAnimation(sampleDish, dishRef.current, cartButton);
      }
    }
  };

  return (
    <div className="p-8 bg-gray-50 rounded-lg">
      <h3 className="text-xl font-bold mb-4">Flying Dish Animation Demo</h3>
      <p className="text-gray-600 mb-6">
        Click the button below to see the flying dish animation in action!
      </p>
      
      <div className="flex items-center space-x-6">
        {/* Demo dish */}
        <div 
          ref={dishRef}
          className="relative w-24 h-24 rounded-lg overflow-hidden shadow-lg border-2 border-white"
          style={{
            backgroundImage: `url(${sampleDish.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute bottom-1 left-1 text-white text-xs font-medium">
            {sampleDish.name}
          </div>
        </div>

        {/* Demo button */}
        <motion.button
          onClick={handleDemoAnimation}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Test Animation
        </motion.button>

        {/* Arrow indicator */}
        <div className="flex items-center text-gray-400">
          <span className="text-sm">→</span>
          <span className="ml-2 text-sm">Cart</span>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Animation Features:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Smooth curved path from dish to cart</li>
          <li>• Shrinking and fading effects during flight</li>
          <li>• 360° rotation with sparkle effects</li>
          <li>• Cart bounce when animation completes</li>
          <li>• 0.9 second duration with custom easing</li>
        </ul>
      </div>
    </div>
  );
};

export default AnimationDemo;
