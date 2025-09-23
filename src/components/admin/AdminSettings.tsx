import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Truck, 
  XCircle, 
  ToggleLeft, 
  ToggleRight,
  Save,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useFirebaseRestaurant } from '../../hooks/useFirebaseRestaurant';
import { useToastStore } from '../../store/toastStore';
import type { RestaurantStatus } from '../../store/restaurantStore';
import Button from '../ui/Button';
import Input from '../ui/Input';

const AdminSettings: React.FC = () => {
  const { 
    status, 
    message, 
    deliveryAvailable, 
    error,
    lastUpdated,
    updatedBy,
    setStatus, 
    toggleDelivery,
    updateRestaurantStatus 
  } = useFirebaseRestaurant();

  const { addToast } = useToastStore();

  const [customMessage, setCustomMessage] = useState(message);

  // Show warning toast when there's a Firebase error
  useEffect(() => {
    if (error) {
      addToast({
        type: 'warning',
        title: 'Firebase Connection Issue',
        message: 'Using local storage fallback. Deploy Firestore rules for real-time updates.',
        duration: 6000
      });
    }
  }, [error, addToast]);

  const handleDeliveryToggle = () => {
    toggleDelivery();
    
    // Show toast for delivery toggle
    addToast({
      type: deliveryAvailable ? 'warning' : 'success',
      title: deliveryAvailable ? 'Delivery Disabled' : 'Delivery Enabled',
      message: deliveryAvailable 
        ? 'Delivery service has been temporarily disabled. Customers can still place pickup orders.'
        : 'Delivery service is now available. Customers can place delivery orders.',
      duration: 4000
    });
  };
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const statusOptions: Array<{
    id: RestaurantStatus;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }> = [
    {
      id: 'open',
      label: 'Open',
      description: 'Restaurant is fully operational',
      icon: Clock,
      color: 'text-green-600'
    },
    {
      id: 'delivery-only',
      label: 'Delivery Only',
      description: 'Open for delivery, dine-in closed',
      icon: Truck,
      color: 'text-orange-600'
    },
    {
      id: 'closed',
      label: 'Closed',
      description: 'Restaurant is closed today',
      icon: XCircle,
      color: 'text-red-600'
    }
  ];

  const handleStatusChange = (newStatus: RestaurantStatus) => {
    setStatus(newStatus);
    // Reset custom message to default when changing status
    const defaultMessages = {
      'open': 'We are open and ready to serve you!',
      'closed': 'We are closed today. Thank you for your understanding.',
      'delivery-only': 'We are open for delivery only. Dine-in is temporarily unavailable.'
    };
    setCustomMessage(defaultMessages[newStatus]);
    
    // Show info toast for status change
    const statusLabels = {
      'open': 'Open',
      'closed': 'Closed',
      'delivery-only': 'Delivery Only'
    };
    
    addToast({
      type: 'info',
      title: 'Status Changed',
      message: `Restaurant status changed to "${statusLabels[newStatus]}". Don't forget to save your changes.`,
      duration: 4000
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      await updateRestaurantStatus(status, customMessage, 'admin');
      setSaveStatus('success');
      
      // Show success toast
      addToast({
        type: 'success',
        title: 'Settings Saved!',
        message: 'Restaurant status and settings have been successfully updated.',
        duration: 4000
      });
      
      // Reset success status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error: any) {
      console.error('Error saving restaurant status:', error);
      setSaveStatus('error');
      
      // Show error toast
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save restaurant settings. Please try again.',
        duration: 5000
      });
      
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
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
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Restaurant Settings</h2>
          <p className="text-sm sm:text-base text-gray-600">Manage your restaurant status and operational settings</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {saveStatus === 'success' && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Saved</span>
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Error saving</span>
            </div>
          )}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            leftIcon={isSaving ? undefined : <Save className="w-4 h-4" />}
            className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
          >
            {isSaving ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </div>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>

      {/* Current Status Display */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h3>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {statusOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <div
                  key={option.id}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                    status === option.id ? 'bg-white shadow-sm border' : ''
                  }`}
                >
                  <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 ${option.color}`} />
                  <span className={`font-medium text-sm sm:text-base ${option.color}`}>
                    {option.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
            <p className="text-sm text-gray-600">Delivery</p>
            <button
              onClick={handleDeliveryToggle}
              className={`transition-colors ${
                deliveryAvailable ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              {deliveryAvailable ? (
                <ToggleRight className="w-6 h-6 sm:w-8 sm:h-8" />
              ) : (
                <ToggleLeft className="w-6 h-6 sm:w-8 sm:h-8" />
              )}
            </button>
          </div>
        </div>
        
        {/* Firebase Status Info */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
            <div>
              <span className="text-blue-700 font-medium">Live Status:</span>
              <span className="text-blue-600 ml-2">{status}</span>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-blue-600">Updated by: {updatedBy}</p>
              {lastUpdated && (
                <p className="text-blue-500 text-xs">
                  {new Date(lastUpdated.seconds * 1000).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          {error && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
              <p className="text-red-600 text-sm">Error: {error}</p>
              <p className="text-red-500 text-xs mt-1">
                Using local storage fallback. Deploy Firestore rules to enable real-time updates.
              </p>
            </div>
          )}
        </div>
        
        {/* Firebase Setup Instructions */}
        {error && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-yellow-800 font-semibold mb-2">🔧 Firebase Setup Required</h4>
            <p className="text-yellow-700 text-sm mb-2">
              To enable real-time updates across all devices, you need to deploy Firestore security rules.
            </p>
            <div className="text-xs text-yellow-600">
              <p>1. Go to Firebase Console → Firestore Database → Rules</p>
              <p>2. Replace rules with: <code className="bg-yellow-100 px-1 rounded">allow read, write: if true;</code></p>
              <p>3. Click "Publish"</p>
            </div>
          </div>
        )}
      </div>

      {/* Status Selection */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Restaurant Status</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statusOptions.map((option) => {
            const IconComponent = option.icon;
            const isSelected = status === option.id;
            
            return (
              <button
                key={option.id}
                onClick={() => handleStatusChange(option.id)}
                className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                  <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 ${option.color}`} />
                  <span className={`font-semibold text-sm sm:text-base ${option.color}`}>
                    {option.label}
                  </span>
                  {isSelected && (
                    <div className="ml-auto">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    </div>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-600">{option.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Message */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Message</h3>
        <div className="space-y-4">
          <Input
            label="Custom Message"
            value={customMessage}
            onChange={(e) => {
              setCustomMessage(e.target.value);
              // Show info toast when message is modified
              if (e.target.value !== message) {
                addToast({
                  type: 'info',
                  title: 'Message Modified',
                  message: 'Custom message has been updated. Don\'t forget to save your changes.',
                  duration: 3000
                });
              }
            }}
            placeholder="Enter a custom message for customers..."
            className="w-full"
          />
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Preview:</p>
            <p className="text-sm font-medium text-gray-900 break-words">{customMessage}</p>
          </div>
        </div>
      </div>

      {/* Delivery Settings */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Settings</h3>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 text-sm sm:text-base">Delivery Available</h4>
            <p className="text-xs sm:text-sm text-gray-600">
              {deliveryAvailable 
                ? 'Customers can place delivery orders' 
                : 'Delivery service is temporarily unavailable'
              }
            </p>
          </div>
          <button
            onClick={handleDeliveryToggle}
            className={`transition-all duration-200 flex-shrink-0 ${
              deliveryAvailable 
                ? 'text-green-600 hover:text-green-700' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {deliveryAvailable ? (
              <ToggleRight className="w-8 h-8 sm:w-10 sm:h-10" />
            ) : (
              <ToggleLeft className="w-8 h-8 sm:w-10 sm:h-10" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminSettings;
