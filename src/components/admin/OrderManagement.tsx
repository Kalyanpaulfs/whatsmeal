import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Phone, 
  MapPin, 
  Clock, 
  DollarSign,
  ShoppingBag,
  AlertCircle,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  Star,
  UserX,
  Ban,
  RefreshCw
} from 'lucide-react';
import { useOrderStore } from '../../store/orderStore';
import { useToastStore } from '../../store/toastStore';
import { formatOrderDate, formatOrderStatus, getStatusColor, getTimeElapsed } from '../../utils/orderUtils';
import type { Order, OrderFilters, OrderStatus, OrderStatusUpdate } from '../../types/order';
import Modal from '../ui/Modal';

const OrderManagement: React.FC = () => {
  const {
    orders,
    analytics,
    isLoading,
    error,
    fetchOrders,
    updateOrderStatus,
    updateOrder,
    deleteOrder,
    searchOrders,
    clearError,
    subscribeToOrders,
    subscribeToAnalytics,
    unsubscribeFromOrders
  } = useOrderStore();
  
  const { addToast } = useToastStore();

  const [filters, setFilters] = useState<OrderFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState<OrderStatusUpdate>({ status: 'pending' });
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Bulk selection state
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [bulkActionType, setBulkActionType] = useState<'delete' | 'vip' | 'block' | 'unblock' | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Set up real-time subscriptions on mount
  useEffect(() => {
    console.log('OrderManagement: Setting up real-time subscriptions');
    
    // Set up subscriptions first for real-time updates
    subscribeToOrders(filters);
    subscribeToAnalytics();
    
    // Also fetch immediately for faster initial load
    fetchOrders(filters);
    
    // Fallback: fetch orders if subscription doesn't work (reduced time)
    const fallbackTimer = setTimeout(() => {
      if (orders.length === 0 && !isLoading) {
        console.log('OrderManagement: Fallback - fetching orders manually');
        fetchOrders(filters);
      }
      // Mark initial load as complete after fallback period
      setIsInitialLoad(false);
    }, 1500); // Reduced to 1.5 seconds
    
    // Also set a maximum timeout to ensure we don't stay in loading forever
    const maxTimeout = setTimeout(() => {
      setIsInitialLoad(false);
    }, 3000); // Reduced to 3 seconds max
    
    // Cleanup on unmount
    return () => {
      console.log('OrderManagement: Cleaning up real-time subscriptions');
      clearTimeout(fallbackTimer);
      clearTimeout(maxTimeout);
      unsubscribeFromOrders();
    };
  }, []); // Empty dependency array to run only on mount

  // Update subscription when filters change
  useEffect(() => {
    if (!searchTerm.trim()) {
      console.log('OrderManagement: Updating subscription with new filters:', filters);
      subscribeToOrders(filters);
    }
  }, [filters, searchTerm, subscribeToOrders]);

  // Mark initial load as complete when orders are received or when loading stops
  useEffect(() => {
    if (isInitialLoad && (orders.length > 0 || (!isLoading && orders.length === 0))) {
      console.log('OrderManagement: Initial load complete - orders:', orders.length, 'isLoading:', isLoading);
      setIsInitialLoad(false);
    }
  }, [orders.length, isInitialLoad, isLoading]);

  // Debug log for real-time order updates
  useEffect(() => {
    console.log('OrderManagement: Orders updated - count:', orders.length, 'isLoading:', isLoading);
    if (orders.length > 0) {
      console.log('OrderManagement: Latest order statuses:', orders.slice(0, 3).map(o => ({ id: o.id, code: o.orderCode, status: o.status })));
    }
  }, [orders, isLoading]);

  // Force refresh analytics when orders change to ensure real-time updates
  useEffect(() => {
    if (orders.length > 0) {
      console.log('OrderManagement: Orders changed, refreshing analytics for real-time updates');
      subscribeToAnalytics();
    }
  }, [orders.length, subscribeToAnalytics]);

  // Reset initial load state when component mounts (for tab navigation)
  useEffect(() => {
    setIsInitialLoad(true);
    // Set a shorter timeout for initial load completion
    const quickTimeout = setTimeout(() => {
      setIsInitialLoad(false);
    }, 1000); // Only 1 second for initial load
    
    return () => clearTimeout(quickTimeout);
  }, []);

  // Handle search separately (not real-time)
  useEffect(() => {
    if (searchTerm.trim()) {
      searchOrders(searchTerm);
    }
  }, [searchTerm, searchOrders]);

  // Manual refresh function
  const handleRefresh = async () => {
    console.log('OrderManagement: Manual refresh triggered');
    try {
      await fetchOrders(filters);
      addToast({
        type: 'success',
        title: 'Orders Refreshed',
        message: 'Order data has been refreshed successfully.',
        duration: 3000
      });
    } catch (error) {
      console.error('OrderManagement: Error refreshing orders:', error);
      addToast({
        type: 'error',
        title: 'Refresh Failed',
        message: 'Failed to refresh orders. Please try again.',
        duration: 5000
      });
    }
  };

  // Bulk selection functions
  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map(order => order.id!)));
    }
  };

  const handleBulkAction = (actionType: 'delete' | 'vip' | 'block' | 'unblock') => {
    if (selectedOrders.size === 0) return;
    setBulkActionType(actionType);
    setShowBulkModal(true);
  };

  const confirmBulkAction = async () => {
    if (!bulkActionType || selectedOrders.size === 0) return;

    const selectedOrderIds = Array.from(selectedOrders);
    const selectedOrderObjects = filteredOrders.filter(order => selectedOrderIds.includes(order.id!));

    try {
      switch (bulkActionType) {
        case 'delete':
          for (const orderId of selectedOrderIds) {
            await deleteOrder(orderId);
          }
          addToast({
            type: 'success',
            title: 'Orders Deleted',
            message: `${selectedOrderIds.length} orders have been deleted successfully.`,
            duration: 3000
          });
          break;

        case 'vip':
          for (const order of selectedOrderObjects) {
            await updateOrder(order.id!, { isVip: true });
          }
          addToast({
            type: 'success',
            title: 'VIP Status Updated',
            message: `${selectedOrderIds.length} customers have been marked as VIP.`,
            duration: 3000
          });
          break;

        case 'block':
          for (const order of selectedOrderObjects) {
            await updateOrder(order.id!, { isBlocked: true });
          }
          addToast({
            type: 'success',
            title: 'Customers Blocked',
            message: `${selectedOrderIds.length} customers have been blocked.`,
            duration: 3000
          });
          break;

        case 'unblock':
          for (const order of selectedOrderObjects) {
            await updateOrder(order.id!, { isBlocked: false });
          }
          addToast({
            type: 'success',
            title: 'Customers Unblocked',
            message: `${selectedOrderIds.length} customers have been unblocked.`,
            duration: 3000
          });
          break;
      }

      setSelectedOrders(new Set());
      setShowBulkModal(false);
      setBulkActionType(null);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      addToast({
        type: 'error',
        title: 'Bulk Action Failed',
        message: 'Failed to perform bulk action. Please try again.',
        duration: 5000
      });
    }
  };

  const cancelBulkAction = () => {
    setShowBulkModal(false);
    setBulkActionType(null);
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;
    
    try {
      await updateOrderStatus(selectedOrder.id, statusUpdate);
      
      // Show success toast
      addToast({
        type: 'success',
        title: 'Order Status Updated!',
        message: `Order ${selectedOrder.orderCode} status updated to ${statusUpdate.status}.`,
        duration: 4000
      });
      
      setShowStatusModal(false);
      setSelectedOrder(null);
      setStatusUpdate({ status: 'pending' });
    } catch (error) {
      console.error('Error updating order status:', error);
      
      // Show error toast
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update order status. Please try again.',
        duration: 5000
      });
    }
  };

  const handleToggleVip = async (order: Order) => {
    try {
      await updateOrder(order.id, { isVip: !order.isVip });
      
      // Show info toast
      addToast({
        type: 'info',
        title: 'VIP Status Updated!',
        message: `Order ${order.orderCode} ${!order.isVip ? 'marked as VIP' : 'removed from VIP'}.`,
        duration: 3000
      });
    } catch (error) {
      console.error('Error toggling VIP status:', error);
      
      // Show error toast
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update VIP status. Please try again.',
        duration: 5000
      });
    }
  };

  const handleToggleBlocked = async (order: Order) => {
    try {
      await updateOrder(order.id, { isBlocked: !order.isBlocked });
      
      // Show warning toast
      addToast({
        type: 'warning',
        title: 'Block Status Updated!',
        message: `Order ${order.orderCode} ${!order.isBlocked ? 'blocked' : 'unblocked'}.`,
        duration: 3000
      });
    } catch (error) {
      console.error('Error toggling blocked status:', error);
      
      // Show error toast
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update block status. Please try again.',
        duration: 5000
      });
    }
  };

  const handleConfirmWhatsAppOrder = async (order: Order) => {
    try {
      await updateOrderStatus(order.id, { 
        status: 'pending',
        notes: 'Order confirmed after WhatsApp message received'
      });
      
      // Show success toast
      addToast({
        type: 'success',
        title: 'Order Confirmed!',
        message: `Order ${order.orderCode} has been confirmed and is now pending preparation.`,
        duration: 5000
      });
    } catch (error) {
      console.error('Error confirming WhatsApp order:', error);
      
      // Show error toast
      addToast({
        type: 'error',
        title: 'Confirmation Failed',
        message: 'Failed to confirm order. Please try again.',
        duration: 5000
      });
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    setOrderToDelete(order || null);
    setShowDeleteModal(true);
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    
    try {
      await deleteOrder(orderToDelete.id);
      
      // Show error toast (red for destructive action)
      addToast({
        type: 'error',
        title: 'Order Deleted!',
        message: `Order ${orderToDelete.orderCode} has been successfully deleted.`,
        duration: 4000
      });
      
      setShowDeleteModal(false);
      setOrderToDelete(null);
    } catch (error) {
      console.error('Error deleting order:', error);
      
      // Show error toast
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete order. Please try again.',
        duration: 5000
      });
    }
  };

  const cancelDeleteOrder = () => {
    setShowDeleteModal(false);
    setOrderToDelete(null);
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending_whatsapp': return <Phone className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmation': return <CheckCircle className="w-4 h-4" />;
      case 'preparing': return <Package className="w-4 h-4" />;
      case 'out-for-delivery': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredOrders = orders
    .filter(order => {
      if (filters.status && order.status !== filters.status) return false;
      if (filters.orderType && order.orderType !== filters.orderType) return false;
      if (filters.isVip !== undefined && order.isVip !== filters.isVip) return false;
      if (filters.isBlocked !== undefined && order.isBlocked !== filters.isBlocked) return false;
      return true;
    })
    .filter(order => {
      if (!searchTerm.trim()) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        order.orderCode.toLowerCase().includes(searchLower) ||
        order.customerInfo.name.toLowerCase().includes(searchLower) ||
        order.customerInfo.phoneNumber.includes(searchTerm) ||
        order.items.some(item => 
          item.dishName.toLowerCase().includes(searchLower)
        )
      );
    })
    .sort((a, b) => {
      // Sort by creation date, most recent first
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Descending order (newest first)
    });

  // Determine if we should show loading state
  const shouldShowLoading = isLoading || isInitialLoad;

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
            <button
              onClick={clearError}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Order Management</h2>
          <p className="text-sm sm:text-base text-gray-600">Manage and track customer orders</p>
        </div>
        <div className="flex items-center space-x-3">
          {selectedOrders.size > 0 && (
            <div className="flex items-center space-x-2 mr-4">
              <span className="text-sm text-gray-600">
                {selectedOrders.size} selected
              </span>
              <button
                onClick={() => setSelectedOrders(new Set())}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            </div>
          )}
          <button
            onClick={handleRefresh}
            disabled={shouldShowLoading}
            className="flex items-center px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${shouldShowLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
            <span className="sm:hidden">Refresh</span>
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm sm:text-base"
          >
            <Filter className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Filters</span>
            <span className="sm:hidden">Filter</span>
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedOrders.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-blue-900">
                {selectedOrders.size} order{selectedOrders.size > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleBulkAction('vip')}
                className="flex items-center px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 text-sm"
              >
                <Star className="w-4 h-4 mr-1" />
                Mark VIP
              </button>
              <button
                onClick={() => handleBulkAction('block')}
                className="flex items-center px-3 py-1.5 bg-red-100 text-red-800 rounded-md hover:bg-red-200 text-sm"
              >
                <Ban className="w-4 h-4 mr-1" />
                Block
              </button>
              <button
                onClick={() => handleBulkAction('unblock')}
                className="flex items-center px-3 py-1.5 bg-green-100 text-green-800 rounded-md hover:bg-green-200 text-sm"
              >
                <UserX className="w-4 h-4 mr-1" />
                Unblock
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="flex items-center px-3 py-1.5 bg-red-100 text-red-800 rounded-md hover:bg-red-200 text-sm"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{analytics.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">₹{analytics.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Truck className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Orders Out for Delivery</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{analytics.outForDeliveryOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{analytics.pendingOrders}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as OrderStatus || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmation">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="out-for-delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order Type</label>
              <select
                value={filters.orderType || ''}
                onChange={(e) => setFilters({ ...filters, orderType: e.target.value as any || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="delivery">Delivery</option>
                <option value="pickup">Pickup</option>
                <option value="dine-in">Dine-in</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by order code, phone number, or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {shouldShowLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    <div className="flex flex-col items-center space-y-2">
                      <p>No orders found</p>
                      {!shouldShowLoading && (
                        <button
                          onClick={handleRefresh}
                          className="text-blue-600 hover:text-blue-800 text-sm underline"
                        >
                          Click to refresh
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => (
                  <tr key={order.id || `order-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedOrders.has(order.id!)}
                        onChange={() => handleSelectOrder(order.id!)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.orderCode}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.orderType.toUpperCase()}
                          </div>
                        </div>
                        {order.isVip && (
                          <Star className="w-4 h-4 text-yellow-500 ml-2" />
                        )}
                        {order.isBlocked && (
                          <Ban className="w-4 h-4 text-red-500 ml-2" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.customerInfo.name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {order.customerInfo.phoneNumber}
                        </div>
                        {order.customerInfo.address && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {order.customerInfo.address}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{formatOrderStatus(order.status)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{order.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{formatOrderDate(order.createdAt)}</div>
                      <div className="text-xs">{getTimeElapsed(order.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        {/* View Order Button */}
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDetails(true);
                          }}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="View Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {/* Edit Status Button */}
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setStatusUpdate({ status: order.status });
                            setShowStatusModal(true);
                          }}
                          className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors duration-200"
                          title="Update Order Status"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        {/* VIP Toggle Button */}
                        <button
                          onClick={() => handleToggleVip(order)}
                          className={`p-2 rounded-lg transition-colors duration-200 ${
                            order.isVip 
                              ? 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50' 
                              : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                          }`}
                          title={order.isVip ? 'Remove VIP Status' : 'Mark as VIP'}
                        >
                          <Star className="w-4 h-4" />
                        </button>
                        
                        {/* Block Toggle Button */}
                        <button
                          onClick={() => handleToggleBlocked(order)}
                          className={`p-2 rounded-lg transition-colors duration-200 ${
                            order.isBlocked 
                              ? 'text-red-600 hover:text-red-900 hover:bg-red-50' 
                              : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                          }`}
                          title={order.isBlocked ? 'Unblock Order' : 'Block Order'}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden">
          {shouldShowLoading ? (
            <div className="p-6 text-center text-gray-500">
              Loading orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <div className="flex flex-col items-center space-y-2">
                <p>No orders found</p>
                {!shouldShowLoading && (
                  <button
                    onClick={handleRefresh}
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    Click to refresh
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredOrders.map((order, index) => (
                <div key={order.id || `order-${index}`} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {order.orderCode}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{formatOrderStatus(order.status)}</span>
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customerInfo.name}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center mt-1">
                        <Phone className="w-3 h-3 mr-1" />
                        {order.customerInfo.phoneNumber}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{order.total.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatOrderDate(order.createdAt)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <span className="capitalize">{order.orderType}</span>
                      {order.isVip && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Star className="w-3 h-3 mr-1" />
                          VIP
                        </span>
                      )}
                      {order.isBlocked && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          <UserX className="w-3 h-3 mr-1" />
                          Blocked
                        </span>
                      )}
                    </div>
                    
                    {/* Action Buttons - Mobile Optimized */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {/* Primary Actions Row */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDetails(true);
                          }}
                          className="flex items-center space-x-1 px-3 py-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors duration-200 text-sm font-medium"
                          title="View Order Details"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">View</span>
                        </button>
                        
                        {/* Special button for pending_whatsapp orders */}
                        {order.status === 'pending_whatsapp' ? (
                          <button
                            onClick={() => handleConfirmWhatsAppOrder(order)}
                            className="flex items-center space-x-1 px-3 py-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors duration-200 text-sm font-medium"
                            title="Confirm WhatsApp Order"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Confirm</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setStatusUpdate({ status: order.status });
                              setShowStatusModal(true);
                            }}
                            className="flex items-center space-x-1 px-3 py-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors duration-200 text-sm font-medium"
                            title="Update Order Status"
                          >
                            <Edit className="w-4 h-4" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                        )}
                      </div>
                      
                      {/* Secondary Actions Row */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleVip(order)}
                          className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors duration-200 text-sm font-medium ${
                            order.isVip 
                              ? 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50' 
                              : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                          }`}
                          title={order.isVip ? 'Remove VIP Status' : 'Mark as VIP'}
                        >
                          <Star className="w-4 h-4" />
                          <span className="hidden sm:inline">{order.isVip ? 'VIP' : 'Mark VIP'}</span>
                        </button>
                        
                        <button
                          onClick={() => handleToggleBlocked(order)}
                          className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors duration-200 text-sm font-medium ${
                            order.isBlocked 
                              ? 'text-red-600 hover:text-red-900 hover:bg-red-50' 
                              : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                          }`}
                          title={order.isBlocked ? 'Unblock Order' : 'Block Order'}
                        >
                          <UserX className="w-4 h-4" />
                          <span className="hidden sm:inline">{order.isBlocked ? 'Unblock' : 'Block'}</span>
                        </button>
                        
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="flex items-center space-x-1 px-3 py-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors duration-200 text-sm font-medium"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Order Details - {selectedOrder.orderCode}</h3>
              <button
                onClick={() => setShowOrderDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Customer Information</h4>
                  <p className="text-sm text-gray-600">Name: {selectedOrder.customerInfo.name}</p>
                  <p className="text-sm text-gray-600">Phone: {selectedOrder.customerInfo.phoneNumber}</p>
                  {selectedOrder.customerInfo.address && (
                    <p className="text-sm text-gray-600">Address: {selectedOrder.customerInfo.address}</p>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Order Information</h4>
                  <p className="text-sm text-gray-600">Type: {selectedOrder.orderType.toUpperCase()}</p>
                  <p className="text-sm text-gray-600">Status: {formatOrderStatus(selectedOrder.status)}</p>
                  <p className="text-sm text-gray-600">Created: {formatOrderDate(selectedOrder.createdAt)}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={`${selectedOrder.id || 'order'}-${item.dishId || 'dish'}-${index}`} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{item.dishName}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">₹{item.total}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Subtotal:</span>
                  <span>₹{selectedOrder.subtotal}</span>
                </div>
                {selectedOrder.deliveryFee > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Delivery Fee:</span>
                    <span>₹{selectedOrder.deliveryFee}</span>
                  </div>
                )}
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Discount:</span>
                    <span>-₹{selectedOrder.discount}</span>
                  </div>
                )}
                <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>₹{selectedOrder.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Update Order Status</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusUpdate.status}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value as OrderStatus })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmation">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="out-for-delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={statusUpdate.notes || ''}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>

              {statusUpdate.status === 'cancelled' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cancellation Reason</label>
                  <input
                    type="text"
                    value={statusUpdate.cancelledReason || ''}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, cancelledReason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Reason for cancellation"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end mt-6">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && orderToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Order</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete this order?
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-900">Order #{orderToDelete.orderCode}</p>
                <p className="text-sm text-gray-600">
                  Customer: {orderToDelete.customerInfo.name}
                </p>
                <p className="text-sm text-gray-600">
                  Total: ₹{orderToDelete.total.toFixed(2)}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={cancelDeleteOrder}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteOrder}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Confirmation Modal */}
      <Modal
        isOpen={showBulkModal}
        onClose={cancelBulkAction}
        title={`Bulk ${bulkActionType ? bulkActionType.charAt(0).toUpperCase() + bulkActionType.slice(1) : 'Action'}`}
      >
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              {bulkActionType === 'delete' && <XCircle className="h-8 w-8 text-red-600" />}
              {bulkActionType === 'vip' && <Star className="h-8 w-8 text-yellow-600" />}
              {bulkActionType === 'block' && <Ban className="h-8 w-8 text-red-600" />}
              {bulkActionType === 'unblock' && <UserX className="h-8 w-8 text-green-600" />}
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">
                {bulkActionType === 'delete' && 'Delete Orders'}
                {bulkActionType === 'vip' && 'Mark as VIP'}
                {bulkActionType === 'block' && 'Block Customers'}
                {bulkActionType === 'unblock' && 'Unblock Customers'}
              </h3>
              <p className="text-sm text-gray-500">
                {selectedOrders.size} order{selectedOrders.size > 1 ? 's' : ''} selected
              </p>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-6">
            {bulkActionType === 'delete' && 'Are you sure you want to delete the selected orders? This action cannot be undone.'}
            {bulkActionType === 'vip' && 'Are you sure you want to mark the selected customers as VIP?'}
            {bulkActionType === 'block' && 'Are you sure you want to block the selected customers?'}
            {bulkActionType === 'unblock' && 'Are you sure you want to unblock the selected customers?'}
          </p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={cancelBulkAction}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmBulkAction}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                bulkActionType === 'delete' ? 'bg-red-600 hover:bg-red-700' :
                bulkActionType === 'vip' ? 'bg-yellow-600 hover:bg-yellow-700' :
                bulkActionType === 'block' ? 'bg-red-600 hover:bg-red-700' :
                'bg-green-600 hover:bg-green-700'
              }`}
            >
              {bulkActionType === 'delete' && 'Delete Orders'}
              {bulkActionType === 'vip' && 'Mark as VIP'}
              {bulkActionType === 'block' && 'Block Customers'}
              {bulkActionType === 'unblock' && 'Unblock Customers'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrderManagement;
