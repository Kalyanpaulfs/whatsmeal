import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Package, 
  Truck,
  MapPin,
  Phone,
  User,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useOrderStore } from '../../store/orderStore';
import { formatOrderDate, formatOrderStatus, getStatusColor } from '../../utils/orderUtils';
import type { Order } from '../../types/order';

interface TrackOrderProps {
  onBack?: () => void;
}

const TrackOrder: React.FC<TrackOrderProps> = ({ onBack }) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Fallback: navigate to home
      window.location.href = '/';
    }
  };
  const { fetchOrder, isLoading, error, clearError } = useOrderStore();
  const [orderCode, setOrderCode] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [searchError, setSearchError] = useState('');

  // Clear order data when orderCode changes
  useEffect(() => {
    if (orderCode.trim() === '') {
      setOrder(null);
      setSearchError('');
    }
  }, [orderCode]);

  const handleSearch = async () => {
    if (!orderCode.trim()) {
      setSearchError('Please enter an order code');
      return;
    }

    // Clear previous data immediately when starting a new search
    setOrder(null);
    setSearchError('');
    clearError();

    try {
      // First try to find by order code in the search
      const orders = await useOrderStore.getState().searchOrders(orderCode.trim());
      const foundOrder = orders.find(o => o.orderCode.toLowerCase() === orderCode.trim().toLowerCase());
      
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        // If not found by search, try direct fetch by ID (in case orderCode is actually an ID)
        try {
          const directOrder = await fetchOrder(orderCode.trim());
          if (directOrder) {
            setOrder(directOrder);
          } else {
            setSearchError('Order not found. Please check your order code and try again.');
          }
        } catch {
          setSearchError('Order not found. Please check your order code and try again.');
        }
      }
    } catch (error) {
      console.error('Error searching for order:', error);
      setSearchError('Error searching for order. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'preparing': return <Package className="w-5 h-5" />;
      case 'out-for-delivery': return <Truck className="w-5 h-5" />;
      case 'delivered': return <CheckCircle className="w-5 h-5" />;
      case 'cancelled': return <XCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getOrderStatusMessage = (order: Order) => {
    switch (order.status) {
      case 'pending':
        return 'Your order is pending confirmation. Please check WhatsApp for confirmation details.';
      case 'preparing':
        return 'Your order is being prepared. We\'ll notify you when it\'s ready!';
      case 'out-for-delivery':
        return 'Your order is out for delivery. Track your order for real-time updates.';
      case 'delivered':
        return 'Your order has been delivered. Thank you for choosing us!';
      case 'cancelled':
        return 'Your order has been cancelled. Please contact us if you have any questions.';
      default:
        return 'Order status unknown. Please contact support.';
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'pending': return 20;
      case 'confirmation': return 30;
      case 'preparing': return 40;
      case 'out-for-delivery': return 80;
      case 'delivered': return 100;
      case 'cancelled': return 0;
      default: return 0;
    }
  };

  const getStatusSteps = (order: Order) => {
    const steps = [
      { key: 'pending', label: 'Order Placed', completed: true },
      { key: 'confirmation', label: 'Confirmed', completed: order.status === 'confirmation' || order.status === 'preparing' || order.status === 'out-for-delivery' || order.status === 'delivered' },
      { key: 'preparing', label: 'Preparing', completed: order.status === 'preparing' || order.status === 'out-for-delivery' || order.status === 'delivered' },
      { key: 'out-for-delivery', label: 'Out for Delivery', completed: order.status === 'out-for-delivery' || order.status === 'delivered' },
      { key: 'delivered', label: 'Delivered', completed: order.status === 'delivered' },
    ];

    return steps;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="ml-3 text-xl font-semibold text-gray-900">Track Order</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Enter Order Code</h2>
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter your order code (e.g., FD-20241201-1234)"
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {(searchError || error) && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {searchError || error}
                </p>
              )}
            </div>
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span className="ml-2">Track</span>
            </button>
          </div>
        </div>

        {/* Order Details */}
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Order Header */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{order.orderCode}</h3>
                  <p className="text-gray-600">Order placed on {formatOrderDate(order.createdAt)}</p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="ml-2">{formatOrderStatus(order.status)}</span>
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Order Progress</span>
                  <span>{getProgressPercentage(order.status)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressPercentage(order.status)}%` }}
                  ></div>
                </div>
              </div>

              <p className="text-gray-600">{getOrderStatusMessage(order)}</p>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h4>
              <div className="space-y-4">
                {getStatusSteps(order).map((step) => (
                  <div key={step.key} className="flex items-center">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      step.completed 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {step.completed ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-current" />
                      )}
                    </div>
                    <div className="ml-4">
                      <p className={`font-medium ${
                        step.completed ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step.label}
                      </p>
                      {step.key === 'pending' && (
                        <p className="text-sm text-gray-500">{formatOrderDate(order.createdAt)}</p>
                      )}
                      {step.key === 'confirmed' && order.confirmedAt && (
                        <p className="text-sm text-gray-500">{formatOrderDate(order.confirmedAt)}</p>
                      )}
                      {step.key === 'preparing' && order.preparedAt && (
                        <p className="text-sm text-gray-500">{formatOrderDate(order.preparedAt)}</p>
                      )}
                      {step.key === 'out-for-delivery' && order.dispatchedAt && (
                        <p className="text-sm text-gray-500">{formatOrderDate(order.dispatchedAt)}</p>
                      )}
                      {step.key === 'delivered' && order.deliveredAt && (
                        <p className="text-sm text-gray-500">{formatOrderDate(order.deliveredAt)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Customer Information</h5>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{order.customerInfo.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{order.customerInfo.phoneNumber}</span>
                    </div>
                    {order.customerInfo.address && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">{order.customerInfo.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Order Summary</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Subtotal</span>
                      <span className="text-sm font-medium">₹{order.subtotal}</span>
                    </div>
                    {order.deliveryFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Delivery Fee</span>
                        <span className="text-sm font-medium">₹{order.deliveryFee}</span>
                      </div>
                    )}
                    {order.discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Discount</span>
                        <span className="text-sm font-medium text-green-600">-₹{order.discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium text-gray-900">Total</span>
                      <span className="font-medium text-gray-900">₹{order.total}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mt-6">
                <h5 className="font-medium text-gray-900 mb-3">Order Items</h5>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={`${order.id || 'order'}-${item.dishId || 'dish'}-${index}`} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.dishName}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        {item.specialInstructions && (
                          <p className="text-sm text-gray-500">Note: {item.specialInstructions}</p>
                        )}
                      </div>
                      <p className="font-medium text-gray-900">₹{item.total}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h4>
              <p className="text-gray-600 mb-4">
                If you have any questions about your order, please contact us:
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-900">+91 72772 63880</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm text-blue-700">Mon-Sun: 9AM-11PM</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* No Order State */}
        {!order && !isLoading && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Track Your Order</h3>
            <p className="text-gray-600">
              Enter your order code above to track your order status and get real-time updates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
