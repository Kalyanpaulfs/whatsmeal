import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useToastStore } from '../../store/toastStore';
import type { ToastMessage } from '../../types/common';

const Toast: React.FC<{ toast: ToastMessage }> = ({ toast }) => {
  const { removeToast } = useToastStore();

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getToastClasses = () => {
    const baseClasses = "flex items-start p-4 rounded-lg shadow-lg border max-w-sm w-full";
    switch (toast.type) {
      case 'success':
        return `${baseClasses} bg-white border-l-4 border-l-green-500`;
      case 'error':
        return `${baseClasses} bg-white border-l-4 border-l-red-500`;
      case 'warning':
        return `${baseClasses} bg-white border-l-4 border-l-yellow-500`;
      case 'info':
        return `${baseClasses} bg-white border-l-4 border-l-blue-500`;
      default:
        return `${baseClasses} bg-white border-l-4 border-l-blue-500`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.3 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.3 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={getToastClasses()}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900">
            {toast.title}
          </h4>
          {toast.message && (
            <p className="mt-1 text-sm text-gray-600">
              {toast.message}
            </p>
          )}
        </div>
        <button
          onClick={() => removeToast(toast.id)}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
