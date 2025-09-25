import React, { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import type { Dish } from '../../types/menu';

interface FlyingDishAnimationProps {
  dish: Dish;
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  onComplete: () => void;
  duration?: number;
}

const FlyingDishAnimation: React.FC<FlyingDishAnimationProps> = ({
  dish,
  startPosition,
  endPosition,
  onComplete,
  duration = 0.8
}) => {
  const controls = useAnimation();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate the control point for the curved path (arc)
  const getControlPoint = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 100; // Create an arc by going higher
    return { x: midX, y: midY };
  };

  const controlPoint = getControlPoint(startPosition, endPosition);

  useEffect(() => {
    // Start the animation sequence
    const animateSequence = async () => {
      // Initial state - position at start with full size and opacity
      await controls.set({
        x: startPosition.x,
        y: startPosition.y,
        scale: 1,
        opacity: 1,
        rotate: 0
      });

      // Animate along the curved path while scaling down and fading out
      await controls.start({
        x: endPosition.x,
        y: endPosition.y,
        scale: 0.3,
        opacity: 0,
        rotate: 360,
        transition: {
          duration: duration,
          ease: [0.25, 0.46, 0.45, 0.94], // Custom cubic-bezier for smooth arc motion
          type: "tween"
        }
      });

      // Call completion callback after animation finishes
      onComplete();
    };

    animateSequence();

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [controls, startPosition, endPosition, duration, onComplete]);

  return (
    <motion.div
      className="fixed z-50 pointer-events-none"
      style={{
        left: 0,
        top: 0,
        width: '60px',
        height: '60px'
      }}
      animate={controls}
    >
      <div className="relative w-full h-full">
        {/* Flying dish image */}
        <motion.div
          className="absolute inset-0 rounded-lg overflow-hidden shadow-lg border-2 border-white"
          style={{
            backgroundImage: `url(${dish.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
          animate={{
            boxShadow: [
              '0 4px 12px rgba(0,0,0,0.15)',
              '0 8px 24px rgba(0,0,0,0.25)',
              '0 2px 8px rgba(0,0,0,0.1)'
            ]
          }}
          transition={{
            duration: duration,
            times: [0, 0.5, 1]
          }}
        />
        
        {/* Sparkle effect during flight */}
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: duration * 0.6,
            times: [0, 0.3, 0.6],
            repeat: 2
          }}
        />
      </div>

      {/* SVG path for the curved trajectory */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: -1 }}
      >
        <motion.path
          d={`M ${startPosition.x} ${startPosition.y} Q ${controlPoint.x} ${controlPoint.y} ${endPosition.x} ${endPosition.y}`}
          stroke="rgba(168, 85, 247, 0.3)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="5,5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: [0, 1, 0], 
            opacity: [0, 0.6, 0] 
          }}
          transition={{
            duration: duration,
            times: [0, 0.5, 1]
          }}
        />
      </svg>
    </motion.div>
  );
};

export default FlyingDishAnimation;
