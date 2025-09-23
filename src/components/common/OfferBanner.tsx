import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, X } from 'lucide-react';
import { useCouponStore } from '../../store/couponStore';
import type { Coupon } from '../../types/coupon';

const OfferBanner: React.FC = () => {
  const { getActiveCoupons, subscribeToCoupons, coupons } = useCouponStore();
  const [activeCoupons, setActiveCoupons] = useState<Coupon[]>([]);
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Subscribe to real-time coupon updates when component mounts
  useEffect(() => {
    console.log('OfferBanner: Setting up real-time coupon subscription');
    const unsubscribe = subscribeToCoupons();
    
    // Cleanup subscription on unmount
    return () => {
      console.log('OfferBanner: Cleaning up coupon subscription');
      unsubscribe();
    };
  }, [subscribeToCoupons]);

  // Update active coupons when coupons change
  useEffect(() => {
    try {
      const activeCouponsList = getActiveCoupons();
      console.log('OfferBanner: Active coupons updated:', activeCouponsList.length);
      setActiveCoupons(activeCouponsList || []);
    } catch (error) {
      console.error('Error fetching active coupons:', error);
      setActiveCoupons([]);
    }
  }, [getActiveCoupons, coupons]);

  // Auto-rotate offers every 5 seconds
  useEffect(() => {
    if (activeCoupons.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentOfferIndex((prev) => (prev + 1) % activeCoupons.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeCoupons.length]);

  // Show a subtle fallback banner when no active coupons are found
  if (activeCoupons.length === 0) {
    return (
      <div className="w-full px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 animate-pulse"></div>
          </div>
          
          <div className="relative px-3 sm:px-6 py-3 sm:py-5">
            {/* Desktop fallback */}
            <div className="hidden sm:flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <div className="bg-white/20 p-2 rounded-full">
                  <Tag className="w-5 h-5 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-white text-lg">Stay Tuned!</h3>
                  <p className="text-white/90 text-sm">Exciting offers coming soon</p>
                </div>
              </div>
            </div>
            
            {/* Mobile fallback - compact */}
            <div className="sm:hidden flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <div className="bg-white/20 p-1 rounded-full">
                  <Tag className="w-3 h-3 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-white text-sm">Stay Tuned!</h3>
                  <p className="text-white/90 text-xs">Offers coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isVisible) {
    return null;
  }

  const currentOffer = activeCoupons[currentOfferIndex];
  
  // Safety check - if current offer doesn't exist, use the first one
  if (!currentOffer) {
    return null;
  }

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === 'flat') {
      return `₹${coupon.discountValue} off`;
    } else {
      return `${coupon.discountValue}% off`;
    }
  };

  const formatMinPurchase = (amount: number) => {
    return `on orders above ₹${amount}`;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="offer-banner"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="w-full px-3 sm:px-6 lg:px-8 py-3 sm:py-4"
        >
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden relative">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 animate-pulse"></div>
            </div>
            
            <div className="relative px-3 sm:px-6 py-3 sm:py-5">
              {/* Desktop Layout */}
              <div className="hidden md:flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="bg-white/20 p-2 rounded-full">
                      <Tag className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">Special Offer!</h3>
                      <p className="text-white/90 text-sm">Limited time deal</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full">
                    <span className="text-white font-semibold text-lg">
                      {formatDiscount(currentOffer)}
                    </span>
                    <span className="text-white/80 text-sm">
                      {formatMinPurchase(currentOffer.minimumPurchaseAmount)}
                    </span>
                  </div>
                  
                  <div className="bg-white/20 px-4 py-2 rounded-full">
                    <span className="text-white font-mono font-bold text-sm">
                      Code: {currentOffer.code}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Offer indicators */}
                  {activeCoupons.length > 1 && (
                    <div className="flex space-x-1">
                      {activeCoupons.map((coupon, index) => (
                        <button
                          key={`desktop-indicator-${coupon.id || 'coupon'}-${index}`}
                          onClick={() => setCurrentOfferIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentOfferIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                  
                  <button
                    onClick={() => setIsVisible(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Mobile Layout - Compact */}
              <div className="md:hidden">
                <div className="space-y-2">
                  {/* Header row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="bg-white/20 p-1 rounded-full flex-shrink-0">
                        <Tag className="w-3 h-3 text-white" />
                      </div>
                      <h3 className="font-bold text-white text-sm">Special Offer!</h3>
                    </div>
                    
                    <button
                      onClick={() => setIsVisible(false)}
                      className="p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                  
                  {/* Offer details row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <span className="text-white font-semibold text-sm">
                        {formatDiscount(currentOffer)}
                      </span>
                      <span className="text-white/80 text-xs">
                        {formatMinPurchase(currentOffer.minimumPurchaseAmount)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <div className="bg-white/20 px-2 py-1 rounded-full">
                        <span className="text-white font-mono font-bold text-xs">
                          {currentOffer.code}
                        </span>
                      </div>
                      
                      {/* Mobile offer indicators */}
                      {activeCoupons.length > 1 && (
                        <div className="flex space-x-1">
                          {activeCoupons.map((coupon, index) => (
                            <button
                              key={`mobile-indicator-${coupon.id || 'coupon'}-${index}`}
                              onClick={() => setCurrentOfferIndex(index)}
                              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                index === currentOfferIndex ? 'bg-white' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default memo(OfferBanner);
