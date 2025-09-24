import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  Phone, 
  MapPin, 
  DollarSign,
  Users,
  Star,
  Ban,
  Crown,
  TrendingUp,
  UserPlus,
  AlertCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { useCustomerStore } from '../../store/customerStore';
import { useToastStore } from '../../store/toastStore';
import type { Customer, CustomerFilters } from '../../types/customer';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

const CustomerManagement: React.FC = () => {
  const {
    customers,
    insights,
    stats,
    isLoading,
    error,
    fetchCustomers,
    fetchAnalytics,
    fetchInsights,
    fetchStats,
    updateCustomer,
    deleteCustomer,
    searchCustomers,
    syncAllCustomersFromOrders,
    clearError
  } = useCustomerStore();
  
  const { addToast } = useToastStore();

  // Helper function to generate unique keys for customers
  const generateCustomerKey = (customer: Customer, index: number, prefix: string = 'customer'): string => {
    // Try different combinations to ensure uniqueness
    if (customer.id && customer.id.trim() !== '') {
      return `${prefix}-${customer.id}`;
    }
    if (customer.phoneNumber && customer.phoneNumber.trim() !== '') {
      return `${prefix}-${customer.phoneNumber}`;
    }
    if (customer.name && customer.name.trim() !== '') {
      return `${prefix}-${customer.name.toLowerCase().replace(/\s+/g, '-')}-${index}`;
    }
    // Fallback to index with timestamp to ensure uniqueness
    return `${prefix}-unknown-${index}-${Date.now()}`;
  };

  const [filters, setFilters] = useState<CustomerFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchAnalytics();
    fetchInsights();
    fetchStats();
  }, [fetchCustomers, fetchAnalytics, fetchInsights, fetchStats]);

  useEffect(() => {
    if (searchTerm.trim()) {
      searchCustomers(searchTerm);
    } else {
      fetchCustomers(filters);
    }
  }, [searchTerm, filters, searchCustomers, fetchCustomers]);

  const handleToggleVip = async (customer: Customer) => {
    try {
      await updateCustomer(customer.id, { isVIP: !customer.isVIP });
      
      addToast({
        type: 'info',
        title: 'VIP Status Updated!',
        message: `Customer ${customer.name} ${!customer.isVIP ? 'marked as VIP' : 'removed from VIP'}.`,
        duration: 3000
      });
    } catch (error) {
      console.error('Error toggling VIP status:', error);
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update VIP status. Please try again.',
        duration: 5000
      });
    }
  };

  const handleToggleBlocked = async (customer: Customer) => {
    try {
      await updateCustomer(customer.id, { isBlocked: !customer.isBlocked });
      
      addToast({
        type: 'warning',
        title: 'Block Status Updated!',
        message: `Customer ${customer.name} ${!customer.isBlocked ? 'blocked' : 'unblocked'}.`,
        duration: 3000
      });
    } catch (error) {
      console.error('Error toggling blocked status:', error);
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update block status. Please try again.',
        duration: 5000
      });
    }
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };

  const confirmDeleteCustomer = async () => {
    if (!customerToDelete) return;
    
    try {
      await deleteCustomer(customerToDelete.id);
      
      addToast({
        type: 'error',
        title: 'Customer Deleted!',
        message: `Customer ${customerToDelete.name} has been successfully deleted.`,
        duration: 4000
      });
      
      setShowDeleteModal(false);
      setCustomerToDelete(null);
    } catch (error) {
      console.error('Error deleting customer:', error);
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete customer. Please try again.',
        duration: 5000
      });
    }
  };

  const handleSyncCustomers = async () => {
    if (isSyncing || isLoading) {
      console.warn('Sync already in progress, skipping...');
      return;
    }
    
    setIsSyncing(true);
    try {
      console.log('CustomerManagement: Starting customer sync...');
      await syncAllCustomersFromOrders();
      
      addToast({
        type: 'success',
        title: 'Sync Complete!',
        message: 'All customers have been synced from existing orders.',
        duration: 4000
      });
      
      console.log('CustomerManagement: Customer sync completed successfully');
    } catch (error) {
      console.error('CustomerManagement: Error syncing customers:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      addToast({
        type: 'error',
        title: 'Sync Failed',
        message: `Failed to sync customers from orders: ${errorMessage}`,
        duration: 5000
      });
    } finally {
      setIsSyncing(false);
    }
  };



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

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
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Customer Management</h2>
          <p className="text-sm sm:text-base text-gray-600">Manage and track customer information</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleSyncCustomers}
            disabled={isSyncing || isLoading}
            leftIcon={isSyncing || isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}

          >
            {isSyncing ? 'Syncing...' : isLoading ? 'Loading...' : 'Sync from Orders'}
          </Button>
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

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Crown className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">VIP Customers</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.vipCustomers}</p>
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
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UserPlus className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New This Month</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.newCustomersThisMonth}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Insights */}
      {insights && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Customers by Spent */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Top Customers by Spent
            </h3>
            <div className="space-y-3">
              {insights.topCustomersBySpent.map((customer, index) => (
                <div key={generateCustomerKey(customer, index, 'top-spent')} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-green-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{customer.name}</p>
                      <p className="text-sm text-gray-500">{customer.phoneNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(customer.totalSpent)}</p>
                    <p className="text-sm text-gray-500">{customer.totalOrders} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Customers by Orders */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Top Customers by Orders
            </h3>
            <div className="space-y-3">
              {insights.topCustomersByOrders.map((customer, index) => (
                <div key={generateCustomerKey(customer, index, 'top-orders')} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{customer.name}</p>
                      <p className="text-sm text-gray-500">{customer.phoneNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{customer.totalOrders} orders</p>
                    <p className="text-sm text-gray-500">{formatCurrency(customer.totalSpent)}</p>
                  </div>
                </div>
              ))}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">VIP Status</label>
              <select
                value={filters.isVIP === undefined ? '' : filters.isVIP.toString()}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  isVIP: e.target.value === '' ? undefined : e.target.value === 'true' 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Customers</option>
                <option value="true">VIP Only</option>
                <option value="false">Non-VIP Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Block Status</label>
              <select
                value={filters.isBlocked === undefined ? '' : filters.isBlocked.toString()}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  isBlocked: e.target.value === '' ? undefined : e.target.value === 'true' 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Customers</option>
                <option value="true">Blocked Only</option>
                <option value="false">Active Only</option>
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
            placeholder="Search by name or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No customers found
                  </td>
                </tr>
              ) : (
                customers.map((customer, index) => (
                  <tr key={generateCustomerKey(customer, index, 'customer')} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {customer.name}
                            {customer.isVIP && (
                              <Crown className="w-4 h-4 text-yellow-500 ml-2" />
                            )}
                            {customer.isBlocked && (
                              <Ban className="w-4 h-4 text-red-500 ml-2" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            Joined {formatDate(customer.createdAt)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900 flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {customer.phoneNumber}
                        </div>
                        {customer.address && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {customer.address}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.totalOrders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(customer.totalSpent)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(customer.lastOrderAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        {/* View Customer Button */}
                        <button
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setShowCustomerDetails(true);
                          }}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="View Customer Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {/* VIP Toggle Button */}
                        <button
                          onClick={() => handleToggleVip(customer)}
                          className={`p-2 rounded-lg transition-colors duration-200 ${
                            customer.isVIP 
                              ? 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50' 
                              : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                          }`}
                          title={customer.isVIP ? 'Remove VIP Status' : 'Mark as VIP'}
                        >
                          <Star className="w-4 h-4" />
                        </button>
                        
                        {/* Block Toggle Button */}
                        <button
                          onClick={() => handleToggleBlocked(customer)}
                          className={`p-2 rounded-lg transition-colors duration-200 ${
                            customer.isBlocked 
                              ? 'text-red-600 hover:text-red-900 hover:bg-red-50' 
                              : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                          }`}
                          title={customer.isBlocked ? 'Unblock Customer' : 'Block Customer'}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteCustomer(customer)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Delete Customer"
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
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">
              Loading customers...
            </div>
          ) : customers.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No customers found
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {customers.map((customer, index) => (
                <div key={generateCustomerKey(customer, index, 'mobile-customer')} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {customer.name}
                        </h3>
                        {customer.isVIP && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                        {customer.isBlocked && (
                          <Ban className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {customer.phoneNumber}
                      </div>
                      {customer.address && (
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {customer.address}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(customer.totalSpent)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {customer.totalOrders} orders
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Last order: {formatDate(customer.lastOrderAt)}
                    </div>
                    
                    {/* Action Buttons - Mobile Optimized */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowCustomerDetails(true);
                        }}
                        className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="View Customer Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleToggleVip(customer)}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          customer.isVIP 
                            ? 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50' 
                            : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                        }`}
                        title={customer.isVIP ? 'Remove VIP Status' : 'Mark as VIP'}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleToggleBlocked(customer)}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          customer.isBlocked 
                            ? 'text-red-600 hover:text-red-900 hover:bg-red-50' 
                            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                        }`}
                        title={customer.isBlocked ? 'Unblock Customer' : 'Block Customer'}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteCustomer(customer)}
                        className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Delete Customer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Customer Details Modal */}
      {showCustomerDetails && selectedCustomer && (
        <Modal
          isOpen={showCustomerDetails}
          onClose={() => setShowCustomerDetails(false)}
          title={`Customer Details - ${selectedCustomer.name}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900">Customer Information</h4>
                <p className="text-sm text-gray-600">Name: {selectedCustomer.name}</p>
                <p className="text-sm text-gray-600">Phone: {selectedCustomer.phoneNumber}</p>
                {selectedCustomer.address && (
                  <p className="text-sm text-gray-600">Address: {selectedCustomer.address}</p>
                )}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Order Statistics</h4>
                <p className="text-sm text-gray-600">Total Orders: {selectedCustomer.totalOrders}</p>
                <p className="text-sm text-gray-600">Total Spent: {formatCurrency(selectedCustomer.totalSpent)}</p>
                <p className="text-sm text-gray-600">Average Order: {formatCurrency(selectedCustomer.totalSpent / selectedCustomer.totalOrders)}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900">Status</h4>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  selectedCustomer.isVIP ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  <Crown className="w-3 h-3 mr-1" />
                  {selectedCustomer.isVIP ? 'VIP Customer' : 'Regular Customer'}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  selectedCustomer.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  <Ban className="w-3 h-3 mr-1" />
                  {selectedCustomer.isBlocked ? 'Blocked' : 'Active'}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900">Timeline</h4>
              <p className="text-sm text-gray-600">Joined: {formatDate(selectedCustomer.createdAt)}</p>
              <p className="text-sm text-gray-600">Last Order: {formatDate(selectedCustomer.lastOrderAt)}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && customerToDelete && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Customer"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Customer</h3>
              <p className="text-sm text-gray-600">This action cannot be undone</p>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-700 mb-2">
              Are you sure you want to delete this customer?
            </p>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium text-gray-900">{customerToDelete.name}</p>
              <p className="text-sm text-gray-600">
                Phone: {customerToDelete.phoneNumber}
              </p>
              <p className="text-sm text-gray-600">
                Total Orders: {customerToDelete.totalOrders}
              </p>
              <p className="text-sm text-gray-600">
                Total Spent: {formatCurrency(customerToDelete.totalSpent)}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDeleteCustomer}
            >
              Delete Customer
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CustomerManagement;

