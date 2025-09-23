import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Edit, 
  Trash2, 
  Plus,
  Percent,
  DollarSign,
  Tag
} from 'lucide-react';
import { useCouponStore } from '../../store/couponStore';
import { useToastStore } from '../../store/toastStore';
import { initializeSampleCoupons } from '../../utils/initializeSampleCoupons';
import Button from '../ui/Button';
import Input from '../ui/Input';
import type { Coupon, CouponFormData } from '../../types/coupon';

const CouponManagement: React.FC = () => {
  const {
    coupons,
    isLoading,
    error,
    fetchCoupons,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
  } = useCouponStore();

  const { addToast } = useToastStore();

  const [showCouponForm, setShowCouponForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [codeError, setCodeError] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  
  // Confirmation modal states
  const [showDeleteCouponModal, setShowDeleteCouponModal] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);

  // Form state
  const [couponForm, setCouponForm] = useState<CouponFormData>({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    minimumPurchaseAmount: 0,
    startDate: new Date().toISOString().split('T')[0], // Today's date
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    isActive: true,
    usageLimit: undefined,
  });

  // Load coupons on mount
  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // Validate coupon code
  const validateCouponCode = (code: string) => {
    if (!editingCoupon && code.trim()) {
      const existingCoupon = coupons.find(coupon => 
        coupon.code.toUpperCase() === code.toUpperCase()
      );
      
      if (existingCoupon) {
        setCodeError(`Coupon code "${code}" already exists!`);
        return false;
      } else {
        setCodeError('');
        return true;
      }
    }
    setCodeError('');
    return true;
  };

  // Handle coupon code change
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value.toUpperCase();
    setCouponForm(prev => ({ ...prev, code }));
    validateCouponCode(code);
  };

  // Handle form submission
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate code
    if (!editingCoupon && !validateCouponCode(couponForm.code)) {
      return;
    }

    try {
      // Clean the form data - remove undefined values but keep empty strings for required fields
      const cleanFormData = Object.fromEntries(
        Object.entries(couponForm).filter(([key, value]) => {
          // Keep all values except undefined
          // For usageLimit specifically, also remove empty strings since it's optional
          if (key === 'usageLimit') {
            return value !== undefined && value !== '';
          }
          return value !== undefined;
        })
      ) as CouponFormData;
      
      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, cleanFormData);
        
        // Success toast for update
        addToast({
          type: 'success',
          title: 'Coupon Updated!',
          message: `"${couponForm.code}" coupon has been updated successfully.`,
          duration: 4000
        });
      } else {
        await addCoupon(cleanFormData);
        
        // Success toast for creation
        addToast({
          type: 'success',
          title: 'Coupon Created!',
          message: `"${couponForm.code}" coupon has been created successfully.`,
          duration: 4000
        });
      }
      resetCouponForm();
      setShowCouponForm(false);
    } catch (error) {
      console.error('Error saving coupon:', error);
      
      // Error toast
      addToast({
        type: 'error',
        title: 'Operation Failed',
        message: `Failed to ${editingCoupon ? 'update' : 'create'} coupon. Please try again.`,
        duration: 5000
      });
    }
  };

  // Reset form
  const resetCouponForm = () => {
    setCouponForm({
      code: '',
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      minimumPurchaseAmount: 0,
      startDate: new Date().toISOString().split('T')[0], // Today's date
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      isActive: true,
      usageLimit: undefined,
    });
    setEditingCoupon(null);
    setCodeError('');
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Check if coupon is currently valid
  const isCouponValid = (coupon: Coupon) => {
    const now = new Date();
    
    // Fix timezone issues by creating dates at start of day in local timezone
    const startDate = new Date(coupon.startDate + 'T00:00:00');
    const endDate = new Date(coupon.endDate + 'T23:59:59');
    
    // Debug logging
    console.log('Coupon validation debug:', {
      couponCode: coupon.code,
      now: now.toISOString(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      isActive: coupon.isActive,
      startValid: startDate <= now,
      endValid: endDate >= now,
      finalValid: coupon.isActive && startDate <= now && endDate >= now
    });
    
    return coupon.isActive && startDate <= now && endDate >= now;
  };

  // Handle sample coupon initialization
  const handleInitializeSampleCoupons = async () => {
    setIsInitializing(true);
    try {
      const success = await initializeSampleCoupons();
      if (success) {
        await fetchCoupons(); // Refresh the coupons list
        
        // Success toast
        addToast({
          type: 'success',
          title: 'Sample Coupons Loaded!',
          message: 'Sample coupon data has been initialized successfully.',
          duration: 5000
        });
      } else {
        // Warning toast
        addToast({
          type: 'warning',
          title: 'Initialization Failed',
          message: 'Failed to initialize sample coupons. Please try again.',
          duration: 6000
        });
      }
    } catch (error) {
      console.error('Error initializing sample coupons:', error);
      
      // Error toast
      addToast({
        type: 'error',
        title: 'Initialization Error',
        message: 'Error initializing sample coupons. Please try again.',
        duration: 6000
      });
    } finally {
      setIsInitializing(false);
    }
  };

  // Handle coupon deletion with modal
  const handleDeleteCoupon = (couponId: string) => {
    const coupon = coupons.find(c => c.id === couponId);
    if (!coupon) return;

    setCouponToDelete(coupon);
    setShowDeleteCouponModal(true);
  };

  // Confirm coupon deletion
  const confirmDeleteCoupon = async () => {
    if (!couponToDelete) return;

    try {
      await deleteCoupon(couponToDelete.id);
      
      // Success toast
      addToast({
        type: 'success',
        title: 'Coupon Deleted!',
        message: `"${couponToDelete.code}" coupon has been removed successfully.`,
        duration: 4000
      });
      
      // Close modal
      setShowDeleteCouponModal(false);
      setCouponToDelete(null);
    } catch (error) {
      console.error('Error deleting coupon:', error);
      
      // Error toast
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete coupon. Please try again.',
        duration: 5000
      });
    }
  };

  // Cancel coupon deletion
  const cancelDeleteCoupon = () => {
    setShowDeleteCouponModal(false);
    setCouponToDelete(null);
  };

  // Handle coupon status toggle with toast
  const handleToggleCouponStatus = async (couponId: string) => {
    const coupon = coupons.find(c => c.id === couponId);
    if (!coupon) return;

    try {
      await toggleCouponStatus(couponId);
      
      // Info toast
      addToast({
        type: 'info',
        title: 'Status Updated!',
        message: `"${coupon.code}" is now ${!coupon.isActive ? 'active' : 'inactive'}.`,
        duration: 3000
      });
    } catch (error) {
      console.error('Error toggling coupon status:', error);
      
      // Error toast
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update coupon status. Please try again.',
        duration: 5000
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Coupon Management</h2>
          <p className="text-sm sm:text-base text-gray-600">Create and manage discount coupons for your customers</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleInitializeSampleCoupons}
            disabled={isInitializing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Tag className="w-4 h-4" />
            {isInitializing ? 'Initializing...' : 'Add Sample Coupons'}
          </Button>
          <Button
            onClick={() => {
              setShowCouponForm(true);
              resetCouponForm();
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Coupon
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Coupons List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {coupons.map((coupon) => (
          <motion.div
            key={coupon.id}
            className={`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow ${
              !isCouponValid(coupon) ? 'opacity-60' : ''
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  coupon.discountType === 'flat' ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  {coupon.discountType === 'flat' ? (
                    <DollarSign className="w-4 h-4 text-green-600" />
                  ) : (
                    <Percent className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                    {coupon.name}
                  </h3>
                  <p className="text-xs text-gray-500 font-mono">
                    {coupon.code}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    setEditingCoupon(coupon);
                    setCouponForm({
                      code: coupon.code,
                      name: coupon.name,
                      description: coupon.description,
                      discountType: coupon.discountType,
                      discountValue: coupon.discountValue,
                      minimumPurchaseAmount: coupon.minimumPurchaseAmount,
                      startDate: coupon.startDate.split('T')[0], // Convert to YYYY-MM-DD format
                      endDate: coupon.endDate.split('T')[0],
                      isActive: coupon.isActive,
                      usageLimit: coupon.usageLimit,
                    });
                    setShowCouponForm(true);
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCoupon(coupon.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Discount:</span>
                <span className="font-semibold text-gray-900">
                  {coupon.discountType === 'flat' 
                    ? `₹${coupon.discountValue}` 
                    : `${coupon.discountValue}%`
                  }
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Min. Purchase:</span>
                <span className="text-gray-900">₹{coupon.minimumPurchaseAmount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Valid Until:</span>
                <span className="text-gray-900">{formatDate(coupon.endDate)}</span>
              </div>
              {coupon.usageLimit && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Usage:</span>
                  <span className="text-gray-900">
                    {coupon.usedCount}/{coupon.usageLimit}
                  </span>
                </div>
              )}
            </div>

            {coupon.description && (
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                {coupon.description}
              </p>
            )}

            <div className="flex items-center justify-between">
              <button
                onClick={() => handleToggleCouponStatus(coupon.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  coupon.isActive 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {coupon.isActive ? 'Active' : 'Inactive'}
              </button>
              <span className={`px-2 py-1 rounded-full text-xs ${
                isCouponValid(coupon) 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {isCouponValid(coupon) ? 'Valid' : 'Expired'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Coupon Form Modal */}
      {showCouponForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
              </h3>
              <button
                onClick={() => setShowCouponForm(false)}
                className="text-gray-400 hover:text-gray-600 text-xl p-1"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCouponSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Coupon Code"
                    value={couponForm.code}
                    onChange={handleCodeChange}
                    required
                    className={codeError ? 'border-red-500' : ''}
                    placeholder="e.g., DUBAI10"
                  />
                  {codeError && (
                    <p className="text-red-500 text-sm mt-1">{codeError}</p>
                  )}
                </div>
                <Input
                  label="Coupon Name"
                  value={couponForm.name}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="e.g., Dubai Special"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={couponForm.description}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={2}
                  placeholder="Describe the coupon offer..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm(prev => ({ 
                      ...prev, 
                      discountType: e.target.value as 'flat' | 'percentage' 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <Input
                  label={`Discount Value ${couponForm.discountType === 'flat' ? '(₹)' : '(%)'}`}
                  type="number"
                  value={couponForm.discountValue}
                  onChange={(e) => setCouponForm(prev => ({ 
                    ...prev, 
                    discountValue: Number(e.target.value) 
                  }))}
                  required
                  min="0"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Minimum Purchase (₹)"
                  type="number"
                  value={couponForm.minimumPurchaseAmount}
                  onChange={(e) => setCouponForm(prev => ({ 
                    ...prev, 
                    minimumPurchaseAmount: Number(e.target.value) 
                  }))}
                  required
                  min="0"
                />
                <Input
                  label="Usage Limit (Optional)"
                  type="number"
                  value={couponForm.usageLimit || ''}
                  onChange={(e) => setCouponForm(prev => ({ 
                    ...prev, 
                    usageLimit: e.target.value ? Number(e.target.value) : undefined 
                  }))}
                  min="1"
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={couponForm.startDate}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
                <Input
                  label="End Date"
                  type="date"
                  value={couponForm.endDate}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={couponForm.isActive}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Active
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="flex-1"
                  disabled={!!codeError}
                >
                  {editingCoupon ? 'Update' : 'Create'} Coupon
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    resetCouponForm();
                    setShowCouponForm(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Loading State - Inline */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <span className="text-gray-700">Loading coupon data...</span>
          </div>
        </div>
      )}

      {/* Coupon Delete Confirmation Modal */}
      {showDeleteCouponModal && couponToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900">Delete Coupon</h3>
                <p className="text-sm text-gray-500 mt-1">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete the <strong>"{couponToDelete.code}"</strong> coupon?
              </p>
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <p className="font-medium mb-1">Coupon Details:</p>
                <p>• Name: {couponToDelete.name}</p>
                <p>• Discount: {couponToDelete.discountType === 'percentage' ? `${couponToDelete.discountValue}%` : `₹${couponToDelete.discountValue}`}</p>
                <p>• Min Purchase: ₹{couponToDelete.minimumPurchaseAmount}</p>
                <p>• Status: {couponToDelete.isActive ? 'Active' : 'Inactive'}</p>
                <p>• Valid: {formatDate(couponToDelete.startDate)} - {formatDate(couponToDelete.endDate)}</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={cancelDeleteCoupon}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCoupon}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200 text-sm font-medium"
              >
                Delete Coupon
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CouponManagement;
