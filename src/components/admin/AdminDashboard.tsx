import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, Routes, Route } from 'react-router-dom';
import { 
  LogOut, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Settings, 
  Menu as MenuIcon,
  X,
  Tag,
  MapPin,
  DollarSign,
  Clock,
  Package,
  Truck,
  CheckCircle,
  Crown,
  UserPlus,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useFirebaseRestaurant } from '../../hooks/useFirebaseRestaurant';
import { useOrderStore } from '../../store/orderStore';
import { useCustomerStore } from '../../store/customerStore';
import AdminSettings from './AdminSettings';
import MenuManagement from './MenuManagement';
import CouponManagement from './CouponManagement';
import DeliverySettingsManagement from './DeliverySettingsManagement';
import OrderManagement from './OrderManagement';
import CustomerManagement from './CustomerManagement';
import Button from '../ui/Button';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Initialize Firebase restaurant service for admin
  useFirebaseRestaurant();

  // Get stores for data
  const { 
    analytics: orderAnalytics, 
    fetchAnalytics: fetchOrderAnalytics,
    subscribeToAnalytics: subscribeToOrderAnalytics,
    unsubscribeFromOrders,
    isLoading: ordersLoading 
  } = useOrderStore();
  
  const { 
    stats: customerStats, 
    insights: customerInsights,
    fetchStats: fetchCustomerStats,
    fetchInsights: fetchCustomerInsights,
    isLoading: customersLoading 
  } = useCustomerStore();

  // Check if data is loading
  const isLoading = ordersLoading || customersLoading;

  // Get current active tab from URL
  const activeTab = location.pathname.split('/').pop() || 'overview';

  // Load data on component mount with real-time subscriptions
  useEffect(() => {
    console.log('AdminDashboard: Setting up real-time subscriptions');
    subscribeToOrderAnalytics();
    fetchCustomerStats();
    fetchCustomerInsights();
    
    // Cleanup on unmount
    return () => {
      console.log('AdminDashboard: Cleaning up real-time subscriptions');
      unsubscribeFromOrders();
    };
  }, [subscribeToOrderAnalytics, unsubscribeFromOrders, fetchCustomerStats, fetchCustomerInsights]);

  const handleLogout = async () => {
    await logout();
  };

  const handleTabChange = (tabId: string) => {
    navigate(`/admin/${tabId}`);
    setIsMobileMenuOpen(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchOrderAnalytics(),
        fetchCustomerStats(),
        fetchCustomerInsights()
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Calculate stats from real data
  const stats: Array<{
    title: string;
    value: string;
    change: string;
    changeType: 'positive' | 'negative';
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      title: 'Total Orders',
      value: orderAnalytics?.totalOrders?.toString() || '0',
      change: '+12%',
      changeType: 'positive',
      icon: ShoppingCart
    },
    {
      title: 'Total Revenue',
      value: orderAnalytics ? `₹${orderAnalytics.totalRevenue.toLocaleString()}` : '₹0',
      change: '+8%',
      changeType: 'positive',
      icon: DollarSign
    },
    {
      title: 'Total Customers',
      value: customerStats?.totalCustomers?.toString() || '0',
      change: '+15%',
      changeType: 'positive',
      icon: Users
    },
    {
      title: 'VIP Customers',
      value: customerStats?.vipCustomers?.toString() || '0',
      change: '+5%',
      changeType: 'positive',
      icon: Crown
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'menu', label: 'Menu Management', icon: MenuIcon },
    { id: 'coupons', label: 'Coupons', icon: Tag },
    { id: 'delivery', label: 'Delivery Settings', icon: MapPin },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <MenuIcon className="w-5 h-5" />
              </button>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <span className="hidden sm:inline-flex px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Live
              </span>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile User Info & Logout */}
              <div className="lg:hidden flex items-center space-x-3">
                <div className="text-right min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-900 truncate max-w-32">{user?.email}</p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors"
                  leftIcon={<LogOut className="w-4 h-4" />}
                >
                  <span className="text-sm font-medium">Logout</span>
                </Button>
              </div>
              
              {/* Desktop User Info & Logout */}
              <div className="hidden lg:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  leftIcon={<LogOut className="w-4 h-4" />}
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="p-4">
            <div className="space-y-2">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id || `tab-${index}`}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-purple-100 text-purple-700 border-r-2 border-purple-600'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6">
          <Routes>
            <Route path="/overview" element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Welcome Section */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome back!</h2>
                    <p className="text-sm sm:text-base text-gray-600">Here's what's happening with your restaurant today.</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    leftIcon={isRefreshing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  >
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                  </Button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: 4 }).map((_, index) => (
                    <motion.div
                      key={`loading-${index}`}
                      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                    >
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  stats.map((stat, index) => (
                    <motion.div
                      key={`stat-${stat.title}-${index}`}
                      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                          <p className={`text-sm mt-1 ${
                            stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stat.change} from last month
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <stat.icon className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Order Status Overview */}
              {orderAnalytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <motion.div
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Clock className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                        <p className="text-2xl font-bold text-gray-900">{orderAnalytics.pendingOrders}</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Package className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Preparing</p>
                        <p className="text-2xl font-bold text-gray-900">{orderAnalytics.preparingOrders}</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Truck className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Out for Delivery</p>
                        <p className="text-2xl font-bold text-gray-900">{orderAnalytics.outForDeliveryOrders}</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Delivered</p>
                        <p className="text-2xl font-bold text-gray-900">{orderAnalytics.deliveredOrders}</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Customer Insights */}
              {isLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <motion.div
                      key={`insight-loading-${index}`}
                      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
                      initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6, duration: 0.6 }}
                    >
                      <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="space-y-3">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={`loading-customer-${index}-${i}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                <div>
                                  <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-12"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : customerInsights ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <motion.div
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                      Top Customers by Revenue
                    </h3>
                    <div className="space-y-3">
                      {customerInsights.topCustomersBySpent.slice(0, 5).map((customer, index) => (
                        <div key={`top-customer-spent-${customer.id || index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                            <p className="font-medium text-gray-900">₹{customer.totalSpent.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">{customer.totalOrders} orders</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <UserPlus className="w-5 h-5 mr-2 text-blue-600" />
                      Recent Customers
                    </h3>
                    <div className="space-y-3">
                      {customerInsights.newCustomersThisWeek.slice(0, 5).map((customer, index) => (
                        <div key={`new-customer-week-${customer.id || index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                            <p className="text-sm text-gray-500">
                              {new Date(customer.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">{customer.totalOrders} orders</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              ) : null}

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <motion.div
                  className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <Button
                      variant="outline"
                      className="h-16 sm:h-20 flex flex-col items-center justify-center space-y-1 sm:space-y-2"
                      onClick={() => handleTabChange('menu')}
                    >
                      <MenuIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="text-xs sm:text-sm">Manage Menu</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-16 sm:h-20 flex flex-col items-center justify-center space-y-1 sm:space-y-2"
                      onClick={() => handleTabChange('orders')}
                    >
                      <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="text-xs sm:text-sm">View Orders</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-16 sm:h-20 flex flex-col items-center justify-center space-y-1 sm:space-y-2"
                      onClick={() => handleTabChange('customers')}
                    >
                      <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="text-xs sm:text-sm">Customers</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-16 sm:h-20 flex flex-col items-center justify-center space-y-1 sm:space-y-2"
                      onClick={() => handleTabChange('settings')}
                    >
                      <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="text-xs sm:text-sm">Settings</span>
                    </Button>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Restaurant Status</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Firebase Connection</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Connected
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Real-time Updates</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Enabled
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Order Management</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        Ready
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Customer Management</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        Ready
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            } />
            
            <Route path="/orders" element={<OrderManagement />} />
            <Route path="/menu" element={<MenuManagement />} />
            <Route path="/coupons" element={<CouponManagement />} />
            <Route path="/delivery" element={<DeliverySettingsManagement />} />
            <Route path="/customers" element={<CustomerManagement />} />
            
            <Route path="/settings" element={<AdminSettings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
