import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Trash2, Utensils, Clock, Truck, User, Phone, MapPin, Navigation, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useRestaurantStore } from '../../store/restaurantStore';
import { useCouponStore } from '../../store/couponStore';
import { useDeliverySettingsStore } from '../../store/deliverySettingsStore';
import { validateOrder } from '../../utils/orderValidation';
import { calculateDistance } from '../../utils/locationUtils';
import { useCouponValidation } from '../../hooks/useCouponValidation';
import { useOrderStore } from '../../store/orderStore';
import { useToastStore } from '../../store/toastStore';
import { generateOrderCode } from '../../utils/orderUtils';
import { generateWhatsAppOrderLink } from '../../utils/whatsappUtils';
import { OrderService } from '../../services/orderService';
import Button from '../ui/Button';
import CartItem from './CartItem';
import Input from '../ui/Input';
import OrderBlockedBanner from './OrderBlockedBanner';
import CouponApplication from './CouponApplication';
import LocationWarning from '../common/LocationWarning';
// OrderType is defined inline as 'delivery' | 'pickup' | 'dine-in'

const CartDrawer: React.FC = () => {
  const {
    items,
    isEmpty,
    totalItems,
    isOpen,
    closeCart,
    clearCart,
    orderType: storeOrderType,
    setOrderType,
    getCartSummary,
  } = useCart();
  
  const { appliedCoupon, removeCoupon } = useCouponStore();
  
  const { status, deliveryAvailable } = useRestaurantStore();
  
  const { activeSettings, validateLocation, fetchActiveSettings } = useDeliverySettingsStore();

  const { createOrder } = useOrderStore();
  const { addToast } = useToastStore();

  // Auto-validate and remove coupon if cart no longer meets minimum requirements
  useCouponValidation();

  const [selectedOrderType, setSelectedOrderType] = useState<'delivery' | 'pickup' | 'dine-in'>(storeOrderType as 'delivery' | 'pickup' | 'dine-in');
  const [orderDetails, setOrderDetails] = useState({
    customerName: '',
    phoneNumber: '',
    tablePreference: '',
    pickupTime: '',
    deliveryAddress: '',
    notes: '',
  });
  const [locationApproved, setLocationApproved] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [manualLatitude, setManualLatitude] = useState('');
  const [manualLongitude, setManualLongitude] = useState('');
  const [showLocationWarning, setShowLocationWarning] = useState(false);
  const [warningData, setWarningData] = useState<{
    type: 'success' | 'error' | 'warning';
    title: string;
    message: string;
    distance?: number;
    maxRadius?: number;
  } | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderCode, setOrderCode] = useState('');
  const [isUserBlocked, setIsUserBlocked] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');

  // Helper function to show location warnings
  const showWarning = (
    type: 'success' | 'error' | 'warning',
    title: string,
    message: string,
    distance?: number,
    maxRadius?: number
  ) => {
    setWarningData({ type, title, message, distance, maxRadius });
    setShowLocationWarning(true);
  };

  // Fetch active delivery settings when component mounts
  useEffect(() => {
    fetchActiveSettings();
  }, [fetchActiveSettings]);

  // Check if user is blocked when phone number is entered
  useEffect(() => {
    const checkUserBlocked = async () => {
      if (orderDetails.phoneNumber.trim() && orderDetails.phoneNumber.length >= 10) {
        try {
          const blocked = await OrderService.checkUserBlocked(orderDetails.phoneNumber.trim());
          setIsUserBlocked(blocked);
        } catch (error) {
          console.error('Error checking user blocked status:', error);
          setIsUserBlocked(false);
        }
      } else {
        setIsUserBlocked(false);
      }
    };

    const timeoutId = setTimeout(checkUserBlocked, 500); // Debounce the check
    return () => clearTimeout(timeoutId);
  }, [orderDetails.phoneNumber]);


  // Check if orders can be placed
  const orderStatus = validateOrder(selectedOrderType, status, deliveryAvailable);

  // Calculate cart summary with current selected order type
  const cartSummary = useMemo(() => {
    return getCartSummary(activeSettings, appliedCoupon);
  }, [items, selectedOrderType, appliedCoupon, activeSettings, getCartSummary]);

  // Utility function to open WhatsApp with proper mobile/desktop handling
  const openWhatsAppInNewTab = (url: string) => {
    // More robust mobile detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    
    // Only consider it mobile if it's actually a mobile device AND has touch OR small screen
    const isActuallyMobile = isMobile && (isTouchDevice || isSmallScreen);
    
    console.log('Device detection:', { 
      isMobile, 
      isTouchDevice, 
      isSmallScreen, 
      isActuallyMobile,
      userAgent: navigator.userAgent,
      windowWidth: window.innerWidth
    });
    console.log('Opening WhatsApp URL:', url);
    
    // For now, let's force desktop behavior to test
    console.log('Forcing desktop behavior - opening in new tab');
    
    // Method 1: Try window.open
    const whatsappWindow = window.open(url, '_blank', 'noopener,noreferrer');
    
    if (whatsappWindow && !whatsappWindow.closed) {
      console.log('WhatsApp opened successfully in new tab via window.open');
      return;
    }
    
    // Method 2: If popup blocked, create link element
    console.log('Popup blocked, trying link element method');
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log('WhatsApp opened via link element');
  };

  const handleWhatsAppOrder = async () => {
    // Quick validation first
    if (selectedOrderType === 'delivery') {
      const minOrderAmount = activeSettings?.minimumOrderAmount || 200;
      if (cartSummary.subtotal < minOrderAmount) {
        alert(`Minimum order value for delivery is ₹${minOrderAmount}. Please add ₹${minOrderAmount - cartSummary.subtotal} more to proceed.`);
        return;
      }
    }

    if (!orderDetails.customerName.trim()) {
      alert('Please enter your name to proceed with the order.');
      return;
    }

    if (!orderDetails.phoneNumber.trim()) {
      alert('Please enter your phone number to proceed with the order.');
      return;
    }

    if (orderDetails.phoneNumber.length < 10) {
      alert('Please enter a valid 10-digit phone number.');
      return;
    }

    if (selectedOrderType === 'pickup' && !orderDetails.pickupTime.trim()) {
      alert('Please select a pickup time to proceed with the order.');
      return;
    }

    if (selectedOrderType === 'delivery') {
      if (!orderDetails.deliveryAddress.trim()) {
        alert('Please enter your delivery address to proceed with the order.');
        return;
      }
      
      if (!locationApproved) {
        showWarning(
          'warning',
          'Location Verification Required',
          'Please verify your delivery location first by clicking "Get My Location" or entering coordinates manually.',
          undefined,
          activeSettings?.deliveryRadius
        );
        return;
      }
    }

    // Generate order code and WhatsApp URL immediately
    const newOrderCode = generateOrderCode();
    setOrderCode(newOrderCode);

    // Prepare WhatsApp data immediately
    const whatsappData = {
      orderCode: newOrderCode,
      customerName: orderDetails.customerName.trim(),
      phoneNumber: orderDetails.phoneNumber.trim(),
      orderType: selectedOrderType,
      items: items.map(item => ({
        name: item.dish.name,
        quantity: item.quantity,
        price: item.dish.price,
        total: item.dish.price * item.quantity,
      })),
      subtotal: cartSummary.subtotal,
      deliveryFee: cartSummary.deliveryFee,
      discount: cartSummary.discount,
      total: cartSummary.total,
      ...(selectedOrderType === 'delivery' && orderDetails.deliveryAddress.trim() && { 
        address: orderDetails.deliveryAddress.trim() 
      }),
      ...(selectedOrderType === 'dine-in' && orderDetails.tablePreference.trim() && { 
        tablePreference: orderDetails.tablePreference.trim() 
      }),
      ...(selectedOrderType === 'pickup' && orderDetails.pickupTime.trim() && { 
        pickupTime: orderDetails.pickupTime.trim() 
      }),
      ...(orderDetails.notes && orderDetails.notes.trim() && { 
        notes: orderDetails.notes.trim() 
      }),
    };

    const whatsappUrl = generateWhatsAppOrderLink(whatsappData, '917277263880');
    setWhatsappUrl(whatsappUrl);

    // Open WhatsApp IMMEDIATELY in a new tab
    try {
      console.log('Opening WhatsApp immediately in new tab:', whatsappUrl);
      openWhatsAppInNewTab(whatsappUrl);
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      // Show error message instead of redirecting current tab
      addToast({
        type: 'error',
        title: 'WhatsApp Error',
        message: 'Could not open WhatsApp. Please try again or copy the order details manually.',
        duration: 10000
      });
    }

    // Show immediate feedback
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    addToast({
      type: 'info',
      title: 'Opening WhatsApp...',
      message: isMobile 
        ? `Order ${newOrderCode} is opening in WhatsApp app. Please send the message to confirm your order.`
        : `Order ${newOrderCode} is opening in a new tab. Please send the message to confirm your order.`,
      duration: 3000
    });

    // Now do the heavy processing in the background
    setIsPlacingOrder(true);

    // Check if user is blocked in the background (non-blocking)
    OrderService.checkUserBlocked(orderDetails.phoneNumber.trim())
      .then((isUserBlocked) => {
        if (isUserBlocked) {
          addToast({
            type: 'error',
            title: 'Account Blocked',
            message: 'Your account has been blocked. Please contact support for assistance.',
            duration: 10000
          });
        }
      })
      .catch((error) => {
        console.error('Error checking user blocked status:', error);
        // Continue with order if check fails (fail open)
      });

    try {
      console.log('Starting order creation process...');
      console.log('Using order code:', newOrderCode);

      // Prepare order data
      const orderData = {
        orderCode: newOrderCode,
        customerInfo: {
          name: orderDetails.customerName.trim(),
          phoneNumber: orderDetails.phoneNumber.trim(),
          ...(selectedOrderType === 'delivery' && orderDetails.deliveryAddress.trim() && { 
            address: orderDetails.deliveryAddress.trim() 
          }),
          ...(selectedOrderType === 'dine-in' && orderDetails.tablePreference.trim() && { 
            tablePreference: orderDetails.tablePreference.trim() 
          }),
          ...(selectedOrderType === 'pickup' && orderDetails.pickupTime.trim() && { 
            pickupTime: orderDetails.pickupTime.trim() 
          }),
        },
        items: items.map(item => ({
          dishId: item.dish.id,
          dishName: item.dish.name,
          price: item.dish.price,
          quantity: item.quantity,
          total: item.dish.price * item.quantity,
          ...(item.specialInstructions && item.specialInstructions.trim() && { 
            specialInstructions: item.specialInstructions.trim() 
          }),
        })),
        orderType: selectedOrderType,
        status: 'pending' as const,
        subtotal: cartSummary.subtotal,
        deliveryFee: cartSummary.deliveryFee,
        discount: cartSummary.discount,
        total: cartSummary.total,
        ...(appliedCoupon && {
          appliedCoupon: {
            code: appliedCoupon.coupon.code,
            name: appliedCoupon.coupon.name,
            discountType: appliedCoupon.coupon.discountType,
            discountValue: appliedCoupon.coupon.discountValue,
          }
        }),
        ...(activeSettings && {
          deliverySettings: {
            restaurantLocation: {
              latitude: activeSettings.restaurantLocation.latitude,
              longitude: activeSettings.restaurantLocation.longitude,
              address: activeSettings.restaurantLocation.address,
            },
            deliveryRadius: activeSettings.deliveryRadius,
          }
        }),
        ...(selectedOrderType === 'delivery' && manualLatitude && manualLongitude && {
          customerLocation: {
            latitude: parseFloat(manualLatitude),
            longitude: parseFloat(manualLongitude),
            address: orderDetails.deliveryAddress.trim(),
          }
        }),
        estimatedDeliveryTime: activeSettings?.estimatedDeliveryTime || 30,
        ...(orderDetails.notes && orderDetails.notes.trim() && { notes: orderDetails.notes.trim() }),
        paymentMethod: 'cash' as const,
        statusHistory: [{
          status: 'pending' as const,
          timestamp: new Date().toISOString(),
          reason: 'Order placed'
        }],
        ...(appliedCoupon && {
          appliedCouponId: appliedCoupon.coupon.id,
          appliedCouponCode: appliedCoupon.coupon.code,
        }),
        isVip: false,
        isBlocked: false,
      };

      // Clean order data to remove any undefined values
      const cleanOrderData = (obj: any): any => {
        if (obj === null || obj === undefined) return null;
        if (typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(cleanOrderData);
        
        const cleaned: any = {};
        for (const [key, value] of Object.entries(obj)) {
          if (value !== undefined) {
            cleaned[key] = cleanOrderData(value);
          }
        }
        return cleaned;
      };
      
      const cleanedOrderData = cleanOrderData(orderData);
      console.log('Order data prepared:', orderData);
      console.log('Cleaned order data:', cleanedOrderData);
      console.log('Cart items:', items);
      console.log('Cart summary:', cartSummary);
      
      // Check for any undefined values in the cleaned data
      const hasUndefined = JSON.stringify(cleanedOrderData).includes('undefined');
      console.log('Has undefined values:', hasUndefined);
      
      if (hasUndefined) {
        console.error('Found undefined values in order data:', cleanedOrderData);
        throw new Error('Order data contains undefined values');
      }
      
      // Create order with "pending_whatsapp" status (not confirmed yet)
      const orderDataWithStatus = {
        ...cleanedOrderData,
        status: 'pending_whatsapp' as const,
        statusHistory: [{
          status: 'pending_whatsapp' as const,
          timestamp: new Date().toISOString(),
          reason: 'Order prepared, awaiting WhatsApp confirmation'
        }]
      };
      
      console.log('Calling createOrder with pending_whatsapp status...');
      await createOrder(orderDataWithStatus);
      console.log('Order created with pending_whatsapp status!');
      
      // Show instructions to user
      setTimeout(() => {
        addToast({
          type: 'info',
          title: 'Complete Your Order',
          message: 'The restaurant will confirm your order after receiving the message.',
          duration: 4000
        });
      }, 2000);
      
      // Store WhatsApp URL for potential manual access
      sessionStorage.setItem('lastWhatsAppUrl', whatsappUrl);
      
      // Show order confirmation modal
      setOrderPlaced(true);
      
      // Clear cart and close drawer after showing modal
      setTimeout(() => {
        clearCart();
        removeCoupon(); // Clear applied coupon to prevent reuse
        closeCart();
      }, 2000);

    } catch (error) {
      console.error('Error creating order:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
      alert(`Failed to place order: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleGoBack = () => {
    closeCart();
  };

  const handleInputChange = (field: string, value: string) => {
    // Input validation based on field type
    let validatedValue = value;
    
    if (field === 'phoneNumber') {
      // Only allow numbers for phone
      validatedValue = value.replace(/[^0-9]/g, '');
    } else if (field === 'customerName') {
      // Only allow letters and spaces for name
      validatedValue = value.replace(/[^a-zA-Z\s]/g, '');
    }
    
    setOrderDetails(prev => ({
      ...prev,
      [field]: validatedValue,
    }));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      showWarning(
        'error',
        'Geolocation Not Supported',
        'Your browser does not support geolocation. Please enter your coordinates manually or try a different browser.',
        undefined,
        activeSettings?.deliveryRadius
      );
      return;
    }

    if (!activeSettings) {
      showWarning(
        'warning',
        'Settings Loading',
        'Delivery settings are being loaded. Please wait a moment and try again.',
        undefined,
        undefined
      );
      return;
    }

    setIsGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Use dynamic delivery settings
        console.log('=== LOCATION DEBUG ===');
        console.log('Your GPS location:', { latitude, longitude });
        console.log('Restaurant location from admin:', { 
          latitude: activeSettings.restaurantLocation.latitude, 
          longitude: activeSettings.restaurantLocation.longitude 
        });
        console.log('Delivery radius:', activeSettings.deliveryRadius);
        
        // Calculate distance manually to debug
        const manualDistance = calculateDistance(
          latitude,
          longitude,
          activeSettings.restaurantLocation.latitude,
          activeSettings.restaurantLocation.longitude
        );
        console.log('Manual distance calculation:', manualDistance, 'km');
        
        const validation = validateLocation(
          latitude,
          longitude,
          activeSettings.restaurantLocation.latitude,
          activeSettings.restaurantLocation.longitude,
          activeSettings.deliveryRadius
        );
        
        console.log('Validation result:', validation);
        console.log('=== END DEBUG ===');
        
        if (validation.isValid) {
          setLocationApproved(true);
          showWarning(
            'success',
            'Location Approved!',
            `Great! You are ${validation.distance?.toFixed(1)}km away and within our ${activeSettings.deliveryRadius}km delivery radius. You can proceed with your order.`,
            validation.distance,
            activeSettings.deliveryRadius
          );
        } else {
          setLocationApproved(false);
          showWarning(
            'error',
            'Delivery Not Available',
            `Sorry, you are ${validation.distance?.toFixed(1)}km away. We only deliver within ${activeSettings.deliveryRadius}km radius. Please try a different location or choose pickup instead.`,
            validation.distance,
            activeSettings.deliveryRadius
          );
        }
        
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        showWarning(
          'error',
          'Location Error',
          'Unable to get your location. Please check your location permissions or try entering coordinates manually.',
          undefined,
          activeSettings?.deliveryRadius
        );
        setIsGettingLocation(false);
      }
    );
  };

  const testManualLocation = () => {
    if (!activeSettings) {
      showWarning(
        'warning',
        'Settings Loading',
        'Delivery settings are being loaded. Please wait a moment and try again.',
        undefined,
        undefined
      );
      return;
    }

    const lat = parseFloat(manualLatitude);
    const lng = parseFloat(manualLongitude);

    if (isNaN(lat) || isNaN(lng)) {
      showWarning(
        'error',
        'Invalid Coordinates',
        'Please enter valid latitude and longitude coordinates. Make sure they are numbers.',
        undefined,
        activeSettings?.deliveryRadius
      );
      return;
    }

    console.log('=== MANUAL LOCATION TEST ===');
    console.log('Manual coordinates:', { latitude: lat, longitude: lng });
    console.log('Restaurant location:', { 
      latitude: activeSettings.restaurantLocation.latitude, 
      longitude: activeSettings.restaurantLocation.longitude 
    });

    const validation = validateLocation(
      lat,
      lng,
      activeSettings.restaurantLocation.latitude,
      activeSettings.restaurantLocation.longitude,
      activeSettings.deliveryRadius
    );

    console.log('Manual validation result:', validation);

    if (validation.isValid) {
      setLocationApproved(true);
      showWarning(
        'success',
        'Location Approved!',
        `Great! The coordinates you entered are ${validation.distance?.toFixed(1)}km away and within our ${activeSettings.deliveryRadius}km delivery radius. You can proceed with your order.`,
        validation.distance,
        activeSettings.deliveryRadius
      );
    } else {
      setLocationApproved(false);
      showWarning(
        'error',
        'Location Out of Range',
        `Sorry, the coordinates you entered are ${validation.distance?.toFixed(1)}km away. We only deliver within ${activeSettings.deliveryRadius}km radius. Please try different coordinates or choose pickup instead.`,
        validation.distance,
        activeSettings.deliveryRadius
      );
    }
  };


  const orderTypes = [
    {
      id: 'dine-in' as 'delivery' | 'pickup' | 'dine-in',
      name: 'Dine-In',
      icon: <Utensils className="w-4 h-4" />,
      color: 'bg-blue-500',
    },
    {
      id: 'pickup' as 'delivery' | 'pickup' | 'dine-in',
      name: 'Pickup',
      icon: <Clock className="w-4 h-4" />,
      color: 'bg-green-500',
    },
    {
      id: 'delivery' as 'delivery' | 'pickup' | 'dine-in',
      name: 'Delivery',
      icon: <Truck className="w-4 h-4" />,
      color: 'bg-orange-500',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />

          {/* Location Warning - Mobile Overlay */}
          {warningData && showLocationWarning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:hidden"
            >
              {/* Mobile backdrop - lighter */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/20"
                onClick={() => setShowLocationWarning(false)}
              />
              
              {/* Mobile warning card */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className={`relative w-full max-w-sm z-[70] ${
                  warningData.type === 'success' ? 'bg-green-50 border-green-200' :
                  warningData.type === 'error' ? 'bg-red-50 border-red-200' :
                  'bg-yellow-50 border-yellow-200'
                } border rounded-2xl shadow-2xl`}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      warningData.type === 'success' ? 'text-green-600 bg-green-100' :
                      warningData.type === 'error' ? 'text-red-600 bg-red-100' :
                      'text-yellow-600 bg-yellow-100'
                    }`}>
                      {warningData.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    </div>
                    <h3 className={`font-semibold text-base ${
                      warningData.type === 'success' ? 'text-green-800' :
                      warningData.type === 'error' ? 'text-red-800' :
                      'text-yellow-800'
                    }`}>
                      {warningData.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowLocationWarning(false)}
                    className={`p-1.5 rounded-full hover:bg-black/10 transition-colors ${
                      warningData.type === 'success' ? 'text-green-600' :
                      warningData.type === 'error' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Distance Info */}
                {warningData.distance !== undefined && warningData.maxRadius !== undefined && (
                  <div className="px-4 pb-3">
                    <div className="bg-white/60 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <MapPin className={`w-4 h-4 ${
                            warningData.type === 'success' ? 'text-green-600' :
                            warningData.type === 'error' ? 'text-red-600' :
                            'text-yellow-600'
                          }`} />
                          <span className="text-sm font-medium text-gray-700">Your Distance</span>
                        </div>
                        <span className={`text-lg font-bold ${
                          warningData.type === 'success' ? 'text-green-600' :
                          warningData.type === 'error' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {warningData.distance.toFixed(1)} km
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Delivery Radius</span>
                        <span className="font-medium">{warningData.maxRadius} km</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Message */}
                <div className="px-4 pb-4">
                  <div className={`rounded-xl p-3 bg-white/60 border ${
                    warningData.type === 'success' ? 'border-green-200/50' :
                    warningData.type === 'error' ? 'border-red-200/50' :
                    'border-yellow-200/50'
                  }`}>
                    <p className={`text-sm leading-relaxed ${
                      warningData.type === 'success' ? 'text-green-700' :
                      warningData.type === 'error' ? 'text-red-700' :
                      'text-yellow-700'
                    }`}>
                      {warningData.message}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-4 pb-4">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setShowLocationWarning(false);
                        getCurrentLocation();
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Try Again</span>
                    </button>
                    <button
                      onClick={() => setShowLocationWarning(false)}
                      className={`w-full font-medium py-2.5 px-4 rounded-xl transition-colors duration-200 text-sm text-white ${
                        warningData.type === 'success' ? 'bg-green-600 hover:bg-green-700' :
                        warningData.type === 'error' ? 'bg-red-600 hover:bg-red-700' :
                        'bg-yellow-600 hover:bg-yellow-700'
                      }`}
                    >
                      Got It
                    </button>
                  </div>
                </div>

                {/* Tip for Error Cases */}
                {warningData.type === 'error' && (
                  <div className="px-4 pb-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                      <p className="text-xs text-yellow-800 leading-relaxed">
                        💡 <strong>Tip:</strong> You can still place an order for pickup! 
                        Just change the order type to "Pickup" in your cart.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* Location Warning - Desktop Modal */}
          {warningData && showLocationWarning && (
            <div className="hidden sm:block">
              <LocationWarning
                isVisible={showLocationWarning}
                type={warningData.type}
                title={warningData.title}
                message={warningData.message}
                distance={warningData.distance}
                maxRadius={warningData.maxRadius}
                onClose={() => setShowLocationWarning(false)}
                onRetry={() => {
                  setShowLocationWarning(false);
                  getCurrentLocation();
                }}
                onContinue={() => setShowLocationWarning(false)}
              />
            </div>
          )}

          {/* Drawer */}
          <motion.div
            key="cart-drawer"
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-hard z-50 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Your Order
                </h2>
                {totalItems > 0 && (
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                    {totalItems}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isEmpty ? (
                <motion.div
                  className="flex flex-col items-center justify-center h-full p-8 text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <ShoppingCart className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Add some delicious dishes to get started!
                  </p>
                  <Button
                    variant="primary"
                    onClick={closeCart}
                    leftIcon={<ShoppingCart className="w-4 h-4" />}
                  >
                    Browse Menu
                  </Button>
                </motion.div>
              ) : (
                <div className="p-4 space-y-4">
                  {/* Order Blocking Banner */}
                  {!orderStatus.canOrder && (
                    <OrderBlockedBanner reason={orderStatus.reason || ''} />
                  )}
                  
                  {/* Order Type Selection - Compact */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Order Type</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {orderTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => {
                            setSelectedOrderType(type.id);
                            setOrderType(type.id);
                          }}
                          className={`p-2 rounded-lg border transition-all duration-200 ${
                            selectedOrderType === type.id
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-600'
                          }`}
                        >
                          <div className="flex flex-col items-center space-y-1">
                            <div className={`w-6 h-6 rounded-full ${type.color} flex items-center justify-center text-white`}>
                              {type.icon}
                            </div>
                            <span className="text-xs font-medium">{type.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cart Items */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900">
                      Items ({totalItems})
                    </h3>
                    <div className="space-y-2">
                      {items.map((item, index) => {
                        const key = `cart-item-${item.dish.id || `dish-${index}`}-${index}`;
                        return (
                          <motion.div
                            key={key}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <CartItem item={item} />
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Order Details - Compact Form */}
                  <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                    <h3 className="text-sm font-medium text-gray-900">Order Details</h3>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="Name *"
                        value={orderDetails.customerName}
                        onChange={(e) => handleInputChange('customerName', e.target.value)}
                        leftIcon={<User className="w-3 h-3" />}
                        placeholder="Your name"
                        className="text-sm"
                        size="sm"
                        required
                      />
                      <Input
                        label="Phone *"
                        value={orderDetails.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        leftIcon={<Phone className="w-3 h-3" />}
                        placeholder="10-digit number"
                        type="tel"
                        className="text-sm"
                        size="sm"
                        required
                        maxLength={10}
                      />
                    </div>

                    {/* User Blocked Banner */}
                    {isUserBlocked && (
                      <OrderBlockedBanner reason="Your account has been blocked. Please contact support for assistance." />
                    )}

                    {/* Conditional fields based on order type */}
                    {selectedOrderType === 'dine-in' && (
                      <Input
                        label="Table Preference (Optional)"
                        value={orderDetails.tablePreference}
                        onChange={(e) => handleInputChange('tablePreference', e.target.value)}
                        leftIcon={<Utensils className="w-3 h-3" />}
                        placeholder="e.g., Window table"
                        className="text-sm"
                        size="sm"
                      />
                    )}

                    {selectedOrderType === 'pickup' && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Pickup Time *
                        </label>
                        <input
                          type="time"
                          value={orderDetails.pickupTime}
                          onChange={(e) => setOrderDetails(prev => ({ ...prev, pickupTime: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                      </div>
                    )}

                    {selectedOrderType === 'delivery' && (
                      <div className="space-y-3">
                        <Input
                          label="Delivery Address *"
                          value={orderDetails.deliveryAddress}
                          onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                          leftIcon={<MapPin className="w-3 h-3" />}
                          placeholder="Complete address"
                          className="text-sm"
                          size="sm"
                          required
                        />
                        
                        {/* Location Approval Section */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Navigation className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800">
                                Location Verification
                              </span>
                            </div>
                            {locationApproved && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                ✓ Approved
                              </span>
                            )}
                          </div>
                          
                          <p className="text-xs text-blue-600 mb-3">
                            We deliver within 3km radius. Please verify your location.
                          </p>
                          
                    <Button
                            variant="outline"
                      size="sm"
                            onClick={getCurrentLocation}
                            disabled={isGettingLocation}
                            className="w-full text-xs py-2 border-blue-300 text-blue-700 hover:bg-blue-100"
                          >
                            {isGettingLocation ? (
                              <>
                                <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                                Getting Location...
                              </>
                            ) : (
                              <>
                                <Navigation className="w-3 h-3 mr-2" />
                                Get My Location
                              </>
                            )}
                    </Button>
                    
                    {/* Manual Testing Section */}
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <button
                        onClick={() => setShowManualInput(!showManualInput)}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        {showManualInput ? 'Hide' : 'Show'} Manual Testing (GPS Issues)
                      </button>
                      
                      {showManualInput && (
                        <div className="mt-3 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-gray-600">Latitude</label>
                              <input
                                type="number"
                                step="any"
                                value={manualLatitude}
                                onChange={(e) => setManualLatitude(e.target.value)}
                                placeholder="22.4051"
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600">Longitude</label>
                              <input
                                type="number"
                                step="any"
                                value={manualLongitude}
                                onChange={(e) => setManualLongitude(e.target.value)}
                                placeholder="88.2194"
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                              />
                            </div>
                          </div>
                          <button
                            onClick={testManualLocation}
                            className="w-full px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Test Manual Coordinates
                          </button>
                          <p className="text-xs text-gray-500">
                            Use this if GPS is inaccurate. Enter the exact coordinates from Google Maps.
                          </p>
                        </div>
                      )}
                    </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer - Integrated Summary */}
            {!isEmpty && (
              <motion.div
                className="border-t border-gray-200 p-4 bg-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Coupon Application */}
                <CouponApplication deliverySettings={activeSettings} />

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">₹{cartSummary.subtotal}</span>
                    </div>
                    {selectedOrderType === 'delivery' && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Delivery Fee</span>
                          <span className="font-medium">
                            {cartSummary.deliveryFee > 0 ? `₹${cartSummary.deliveryFee}` : 'Free'}
                          </span>
                        </div>
                        {activeSettings && (
                          <div className="text-xs text-gray-500">
                            {cartSummary.subtotal < activeSettings.minimumOrderAmount ? (
                              <span className="text-red-600">
                                ⚠️ Minimum order ₹{activeSettings.minimumOrderAmount} required for delivery
                              </span>
                            ) : cartSummary.deliveryFee > 0 ? (
                              <span>
                                Free delivery on orders above ₹{activeSettings.freeDeliveryThreshold}
                              </span>
                            ) : (
                              <span className="text-green-600">
                                ✓ You qualify for free delivery!
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {cartSummary.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span className="font-medium">-₹{cartSummary.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-semibold text-gray-900">Total</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-purple-600 font-semibold">₹{cartSummary.total}</span>
                          <button
                            onClick={clearCart}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Clear Cart"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Minimum Order Warning - Only for delivery */}
                  {selectedOrderType === 'delivery' && cartSummary.subtotal < (activeSettings?.minimumOrderAmount || 200) && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-xs text-red-700">
                          Minimum order value for delivery is ₹{activeSettings?.minimumOrderAmount || 200}. Add ₹{(activeSettings?.minimumOrderAmount || 200) - cartSummary.subtotal} more to proceed.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleGoBack}
                    className="flex-1 text-sm py-2"
                  >
                    Go Back
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleWhatsAppOrder}
                    disabled={
                      isPlacingOrder ||
                      !orderStatus.canOrder ||
                      (selectedOrderType === 'delivery' && cartSummary.subtotal < (activeSettings?.minimumOrderAmount || 200)) ||
                      !orderDetails.customerName.trim() ||
                      !orderDetails.phoneNumber.trim() ||
                      orderDetails.phoneNumber.length < 10 ||
                      isUserBlocked ||
                      (selectedOrderType === 'pickup' && !orderDetails.pickupTime.trim()) ||
                      (selectedOrderType === 'delivery' && (!orderDetails.deliveryAddress.trim() || !locationApproved))
                    }
                    className="flex-1 text-sm py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500"
                  >
                    {isPlacingOrder ? 'Placing Order...' : 'Order via WhatsApp'}
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </>
      )}

      {/* Order Confirmation Modal */}
      <AnimatePresence>
        {orderPlaced && (
          <motion.div
            key="order-confirmation-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              key="order-confirmation-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Order Sent!</h3>
              <p className="text-gray-600 mb-4">
                Your order <span className="font-semibold text-purple-600">#{orderCode}</span> is sent.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                The restaurant will confirm your order after receiving the WhatsApp message.
              </p>
              <div className="flex flex-col space-y-3">
                {whatsappUrl && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      openWhatsAppInNewTab(whatsappUrl);
                    }}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Open WhatsApp
                  </Button>
                )}
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOrderPlaced(false);
                      setOrderCode('');
                      setWhatsappUrl('');
                      closeCart();
                    }}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      // Navigate to track order page
                      window.location.href = '/track-order';
                    }}
                    className="flex-1"
                  >
                    Track Order
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};

export default CartDrawer;
