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
  Eye,
  RefreshCw
} from 'lucide-react';
import { useOrderStore } from '../../store/orderStore';
import { formatOrderDate, formatOrderStatus, getStatusColor, getTimeElapsed, getOrdersFromLocalStorage } from '../../utils/orderUtils';
import type { Order } from '../../types/order';

interface MyOrdersProps {
  onBack?: () => void;
}

const MyOrders: React.FC<MyOrdersProps> = ({ onBack }) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Fallback: navigate to home
      window.location.href = '/';
    }
  };
  const { customerOrders, loadCustomerOrders, fetchOrder, isLoading } = useOrderStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Clean up any duplicate orders in localStorage first
    const existingOrders = getOrdersFromLocalStorage();
    const uniqueOrders = existingOrders.filter((order, index, self) => 
      index === self.findIndex(o => o.id === order.id)
    );
    
    if (uniqueOrders.length !== existingOrders.length) {
      localStorage.setItem('customerOrders', JSON.stringify(uniqueOrders));
    }
    
    loadCustomerOrders();
  }, [loadCustomerOrders]);

  // Debug logging (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Customer orders loaded:', customerOrders);
      if (customerOrders.length > 0) {
        console.log('First order details:', customerOrders[0]);
        console.log('First order items:', customerOrders[0].items);
        console.log('First order total:', customerOrders[0].total);
      }
    }
  }, [customerOrders]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Sync each order with Firebase to get latest status
      for (const order of customerOrders) {
        try {
          const updatedOrder = await fetchOrder(order.id);
          if (updatedOrder) {
            // Order will be automatically synced to localStorage by the store
          }
        } catch (error) {
          console.error(`Error syncing order ${order.id}:`, error);
        }
      }
      // Reload customer orders to get updated data
      loadCustomerOrders();
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
    
    // Try to fetch latest status from Firebase
    try {
      const updatedOrder = await fetchOrder(order.id);
      if (updatedOrder) {
        setSelectedOrder(updatedOrder);
      }
    } catch (error) {
      console.error('Error fetching latest order status:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmation': return <CheckCircle className="w-4 h-4" />;
      case 'preparing': return <Package className="w-4 h-4" />;
      case 'out-for-delivery': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredOrders = customerOrders
    .filter(order => 
      order.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Sort by creation date, most recent first
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Descending order (newest first)
    });

  const getOrderStatusMessage = (order: Order) => {
    switch (order.status) {
      case 'pending':
        return 'Your order is pending confirmation. Please check WhatsApp for confirmation details.';
      case 'confirmation':
        return 'Your order has been confirmed! We\'ll start preparing it soon.';
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
              <h1 className="ml-3 text-xl font-semibold text-gray-900">My Orders</h1>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search orders by code or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading your orders...</p>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No orders found' : 'No orders yet'}
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Your order history will appear here once you place an order'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => (
              <motion.div
                key={`order-${order.id || 'order'}-${index}-${order.createdAt || 'date'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {order.orderCode}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{formatOrderStatus(order.status)}</span>
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>{formatOrderDate(order.createdAt)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <span>₹{order.total.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Package className="w-4 h-4 mr-2" />
                          <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">
                        {getOrderStatusMessage(order)}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          {getTimeElapsed(order.createdAt)}
                        </div>
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Order Details - {selectedOrder.orderCode}</h3>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Order Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">Order Status</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    <span className="ml-1">{formatOrderStatus(selectedOrder.status)}</span>
                  </span>
                </div>
                <p className="text-sm text-gray-600">{getOrderStatusMessage(selectedOrder)}</p>
              </div>

              {/* Customer Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">{selectedOrder.customerInfo.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">{selectedOrder.customerInfo.phoneNumber}</span>
                  </div>
                  {selectedOrder.customerInfo.address && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{selectedOrder.customerInfo.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={`${selectedOrder.id || 'order'}-${item.dishId || 'dish'}-${index}`} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
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

              {/* Order Summary */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{selectedOrder.subtotal}</span>
                  </div>
                  {selectedOrder.deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span>₹{selectedOrder.deliveryFee}</span>
                    </div>
                  )}
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount</span>
                      <span className="text-green-600">-₹{selectedOrder.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>₹{selectedOrder.total}</span>
                  </div>
                </div>
              </div>

              {/* Order Timeline */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Order Timeline</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-gray-600">Order placed on {formatOrderDate(selectedOrder.createdAt)}</span>
                  </div>
                  {selectedOrder.confirmedAt && (
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-gray-600">Order confirmed on {formatOrderDate(selectedOrder.confirmedAt)}</span>
                    </div>
                  )}
                  {selectedOrder.preparedAt && (
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                      <span className="text-gray-600">Order prepared on {formatOrderDate(selectedOrder.preparedAt)}</span>
                    </div>
                  )}
                  {selectedOrder.dispatchedAt && (
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                      <span className="text-gray-600">Order dispatched on {formatOrderDate(selectedOrder.dispatchedAt)}</span>
                    </div>
                  )}
                  {selectedOrder.deliveredAt && (
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-gray-600">Order delivered on {formatOrderDate(selectedOrder.deliveredAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
