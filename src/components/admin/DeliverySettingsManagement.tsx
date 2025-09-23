import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Settings, Plus, Edit, Trash2, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react';
import { useDeliverySettingsStore } from '../../store/deliverySettingsStore';
import { useToastStore } from '../../store/toastStore';
import { initializeSampleDeliverySettings } from '../../utils/initializeSampleDeliverySettings';
import type { DeliverySettings, DeliverySettingsFormData } from '../../types/deliverySettings';
import Modal from '../ui/Modal';

const DeliverySettingsManagement: React.FC = () => {
  const {
    settings,
    activeSettings,
    isLoading,
    error,
    fetchSettings,
    addSettings,
    updateSettings,
    deleteSettings,
    toggleSettingsStatus,
    clearError
  } = useDeliverySettingsStore();

  const { addToast } = useToastStore();

  const [showForm, setShowForm] = useState(false);
  const [editingSettings, setEditingSettings] = useState<DeliverySettings | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [settingsToDelete, setSettingsToDelete] = useState<DeliverySettings | null>(null);
  const [settingsForm, setSettingsForm] = useState<DeliverySettingsFormData>({
    deliveryRadius: 3,
    restaurantLocation: {
      latitude: 19.0760,
      longitude: 72.8777,
      address: '123 Food Street, Downtown, Mumbai 400001',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      postalCode: '400001',
    },
    deliveryFee: 49,
    freeDeliveryThreshold: 499,
    minimumOrderAmount: 299,
    estimatedDeliveryTime: 30,
    isActive: true,
  });

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('restaurantLocation.')) {
      const locationField = field.split('.')[1];
      setSettingsForm(prev => ({
        ...prev,
        restaurantLocation: {
          ...prev.restaurantLocation,
          [locationField]: value,
        },
      }));
    } else {
      setSettingsForm(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // Validation checks
    if (settingsForm.deliveryRadius < 0.5) {
      addToast({
        type: 'warning',
        title: 'Invalid Delivery Radius',
        message: 'Delivery radius must be at least 0.5km.',
        duration: 4000
      });
      return;
    }

    if (settingsForm.deliveryFee < 0) {
      addToast({
        type: 'warning',
        title: 'Invalid Delivery Fee',
        message: 'Delivery fee cannot be negative.',
        duration: 4000
      });
      return;
    }

    if (settingsForm.freeDeliveryThreshold < settingsForm.minimumOrderAmount) {
      addToast({
        type: 'warning',
        title: 'Invalid Threshold',
        message: 'Free delivery threshold should be higher than minimum order amount.',
        duration: 4000
      });
      return;
    }

    try {
      if (editingSettings) {
        await updateSettings(editingSettings.id, settingsForm);
        addToast({
          type: 'success',
          title: 'Settings Updated!',
          message: 'Delivery settings have been successfully updated.',
          duration: 4000
        });
      } else {
        await addSettings(settingsForm);
        addToast({
          type: 'success',
          title: 'Settings Added!',
          message: 'New delivery settings have been successfully created.',
          duration: 4000
        });
      }
      
      setShowForm(false);
      setEditingSettings(null);
      setSettingsForm({
        deliveryRadius: 3,
        restaurantLocation: {
          latitude: 19.0760,
          longitude: 72.8777,
          address: '123 Food Street, Downtown, Mumbai 400001',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          postalCode: '400001',
        },
        deliveryFee: 49,
        freeDeliveryThreshold: 499,
        minimumOrderAmount: 299,
        estimatedDeliveryTime: 30,
        isActive: true,
      });
    } catch (error) {
      console.error('Error saving delivery settings:', error);
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save delivery settings. Please try again.',
        duration: 5000
      });
    }
  };

  const handleEdit = (settings: DeliverySettings) => {
    setEditingSettings(settings);
    setSettingsForm({
      deliveryRadius: settings.deliveryRadius,
      restaurantLocation: settings.restaurantLocation,
      deliveryFee: settings.deliveryFee,
      freeDeliveryThreshold: settings.freeDeliveryThreshold,
      minimumOrderAmount: settings.minimumOrderAmount,
      estimatedDeliveryTime: settings.estimatedDeliveryTime,
      isActive: settings.isActive,
    });
    setShowForm(true);
    addToast({
      type: 'info',
      title: 'Editing Settings',
      message: `You are now editing the ${settings.deliveryRadius}km delivery zone settings.`,
      duration: 4000
    });
  };

  const handleDelete = (id: string) => {
    const settingToDelete = settings.find(s => s.id === id);
    
    if (settingToDelete?.isActive) {
      addToast({
        type: 'warning',
        title: 'Cannot Delete Active Settings',
        message: 'Please deactivate the settings before deleting them.',
        duration: 5000
      });
      return;
    }

    setSettingsToDelete(settingToDelete || null);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!settingsToDelete) return;

    try {
      await deleteSettings(settingsToDelete.id);
      addToast({
        type: 'success',
        title: 'Settings Deleted!',
        message: `The ${settingsToDelete.deliveryRadius}km delivery zone settings have been successfully deleted.`,
        duration: 4000
      });
      setShowDeleteModal(false);
      setSettingsToDelete(null);
    } catch (error) {
      console.error('Error deleting delivery settings:', error);
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete delivery settings. Please try again.',
        duration: 5000
      });
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSettingsToDelete(null);
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    const newStatus = !isActive;
    
    // Check if trying to activate when another setting is already active
    if (newStatus && activeSettings && activeSettings.id !== id) {
      if (window.confirm('Another delivery setting is already active. This will deactivate the current one. Continue?')) {
        try {
          await toggleSettingsStatus(id, newStatus);
          addToast({
            type: 'success',
            title: 'Settings Activated!',
            message: 'Delivery settings have been activated and are now in effect.',
            duration: 4000
          });
        } catch (error) {
          console.error('Error toggling delivery settings status:', error);
          addToast({
            type: 'error',
            title: 'Status Change Failed',
            message: 'Failed to change settings status. Please try again.',
            duration: 5000
          });
        }
      }
      return;
    }

    try {
      await toggleSettingsStatus(id, newStatus);
      addToast({
        type: newStatus ? 'success' : 'warning',
        title: newStatus ? 'Settings Activated!' : 'Settings Deactivated!',
        message: newStatus 
          ? 'Delivery settings have been activated and are now in effect.' 
          : 'Delivery settings have been deactivated.',
        duration: 4000
      });
    } catch (error) {
      console.error('Error toggling delivery settings status:', error);
      addToast({
        type: 'error',
        title: 'Status Change Failed',
        message: 'Failed to change settings status. Please try again.',
        duration: 5000
      });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSettings(null);
    setSettingsForm({
      deliveryRadius: 3,
      restaurantLocation: {
        latitude: 19.0760,
        longitude: 72.8777,
        address: '123 Food Street, Downtown, Mumbai 400001',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        postalCode: '400001',
      },
      deliveryFee: 49,
      freeDeliveryThreshold: 499,
      minimumOrderAmount: 299,
      estimatedDeliveryTime: 30,
      isActive: true,
    });
    clearError();
    addToast({
      type: 'info',
      title: 'Form Cancelled',
      message: editingSettings ? 'Edit cancelled. No changes were made.' : 'Add new settings cancelled.',
      duration: 3000
    });
  };

  const handleInitializeSample = async () => {
    if (window.confirm('This will create sample delivery settings. Continue?')) {
      try {
        await initializeSampleDeliverySettings();
        await fetchSettings();
        addToast({
          type: 'success',
          title: 'Sample Data Created!',
          message: 'Sample delivery settings have been successfully initialized.',
          duration: 4000
        });
      } catch (error) {
        console.error('Error initializing sample delivery settings:', error);
        addToast({
          type: 'error',
          title: 'Initialization Failed',
          message: 'Failed to create sample delivery settings. Please try again.',
          duration: 5000
        });
      }
    }
  };

  if (isLoading && settings.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Delivery Settings</h2>
          <p className="text-sm sm:text-base text-gray-600">Manage delivery radius, location, and fees</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {settings.length === 0 && (
            <button
              onClick={handleInitializeSample}
              className="flex items-center justify-center gap-2 bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Initialize Sample</span>
              <span className="sm:hidden">Initialize</span>
            </button>
          )}
          <button
            onClick={() => {
              setShowForm(true);
              addToast({
                type: 'info',
                title: 'Adding New Settings',
                message: 'Fill out the form below to create new delivery settings.',
                duration: 4000
              });
            }}
            className="flex items-center justify-center gap-2 bg-primary-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Settings</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
          <button
            onClick={clearError}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Active Settings Info */}
      {activeSettings && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-800 text-sm sm:text-base">Currently Active Settings</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
            <div>
              <span className="font-medium text-green-700">Delivery Radius:</span>
              <span className="ml-2 text-green-600">{activeSettings.deliveryRadius}km</span>
            </div>
            <div>
              <span className="font-medium text-green-700">Delivery Fee:</span>
              <span className="ml-2 text-green-600">₹{activeSettings.deliveryFee}</span>
            </div>
            <div>
              <span className="font-medium text-green-700">Free Delivery:</span>
              <span className="ml-2 text-green-600">₹{activeSettings.freeDeliveryThreshold}+</span>
            </div>
          </div>
        </div>
      )}

      {/* Settings Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingSettings ? 'Edit Delivery Settings' : 'Add New Delivery Settings'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Delivery Radius */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Radius (km)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  step="0.5"
                  value={settingsForm.deliveryRadius}
                  onChange={(e) => handleInputChange('deliveryRadius', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              {/* Delivery Fee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Fee (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={settingsForm.deliveryFee}
                  onChange={(e) => handleInputChange('deliveryFee', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              {/* Free Delivery Threshold */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Free Delivery Threshold (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={settingsForm.freeDeliveryThreshold}
                  onChange={(e) => handleInputChange('freeDeliveryThreshold', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              {/* Minimum Order Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Order Amount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={settingsForm.minimumOrderAmount}
                  onChange={(e) => handleInputChange('minimumOrderAmount', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              {/* Estimated Delivery Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Delivery Time (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  step="5"
                  value={settingsForm.estimatedDeliveryTime}
                  onChange={(e) => handleInputChange('estimatedDeliveryTime', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              {/* Active Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={settingsForm.isActive ? 'active' : 'inactive'}
                  onChange={(e) => handleInputChange('isActive', e.target.value === 'active')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Restaurant Location */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Restaurant Location
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={settingsForm.restaurantLocation.latitude}
                    onChange={(e) => handleInputChange('restaurantLocation.latitude', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={settingsForm.restaurantLocation.longitude}
                    onChange={(e) => handleInputChange('restaurantLocation.longitude', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={settingsForm.restaurantLocation.address}
                    onChange={(e) => handleInputChange('restaurantLocation.address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={settingsForm.restaurantLocation.city}
                    onChange={(e) => handleInputChange('restaurantLocation.city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={settingsForm.restaurantLocation.state}
                    onChange={(e) => handleInputChange('restaurantLocation.state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={settingsForm.restaurantLocation.country}
                    onChange={(e) => handleInputChange('restaurantLocation.country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={settingsForm.restaurantLocation.postalCode}
                    onChange={(e) => handleInputChange('restaurantLocation.postalCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Saving...' : editingSettings ? 'Update Settings' : 'Add Settings'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Settings List */}
      <div className="space-y-4">
        {settings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm sm:text-base">No delivery settings found. Add your first settings to get started.</p>
          </div>
        ) : (
          settings.map((setting) => (
            <div
              key={setting.id}
              className={`bg-white border rounded-lg p-4 sm:p-6 ${
                setting.isActive ? 'border-green-200 bg-green-50' : 'border-gray-200'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                      {setting.deliveryRadius}km Delivery Zone
                    </h3>
                    {setting.isActive && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full w-fit">
                        Active
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{setting.restaurantLocation.city}, {setting.restaurantLocation.state}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>₹{setting.deliveryFee} delivery fee</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{setting.estimatedDeliveryTime} min delivery</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Min Order:</span>
                      <span>₹{setting.minimumOrderAmount}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center lg:justify-end gap-2">
                  <button
                    onClick={() => handleToggleStatus(setting.id, setting.isActive)}
                    className={`p-2 rounded-lg transition-colors ${
                      setting.isActive
                        ? 'text-green-600 hover:bg-green-100'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={setting.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {setting.isActive ? (
                      <ToggleRight className="w-5 h-5" />
                    ) : (
                      <ToggleLeft className="w-5 h-5" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleEdit(setting)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(setting.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        title=""
      >
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Delete Delivery Settings</h3>
              <p className="text-xs sm:text-sm text-gray-500">This action cannot be undone.</p>
            </div>
          </div>

          {/* Confirmation Message */}
          <p className="text-sm sm:text-base text-gray-700 mb-4">
            Are you sure you want to delete the <span className="font-semibold">"{settingsToDelete?.deliveryRadius}km delivery zone"</span> settings?
          </p>

          {/* Settings Details */}
          {settingsToDelete && (
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">Settings Details:</h4>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                  <span className="text-gray-600">Delivery Zone:</span>
                  <span className="font-medium">{settingsToDelete.deliveryRadius}km radius</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium break-words">{settingsToDelete.restaurantLocation.city}, {settingsToDelete.restaurantLocation.state}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                  <span className="text-gray-600">Delivery Fee:</span>
                  <span className="font-medium">₹{settingsToDelete.deliveryFee}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                  <span className="text-gray-600">Min Order:</span>
                  <span className="font-medium">₹{settingsToDelete.minimumOrderAmount}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                  <span className="text-gray-600">Free Delivery:</span>
                  <span className="font-medium">₹{settingsToDelete.freeDeliveryThreshold}+</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                  <span className="text-gray-600">Delivery Time:</span>
                  <span className="font-medium">{settingsToDelete.estimatedDeliveryTime} min</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button
              onClick={cancelDelete}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
            >
              Delete Settings
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DeliverySettingsManagement;
