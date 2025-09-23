import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4 mx-auto">
          <span className="text-white font-bold text-2xl">B</span>
        </div>
        <h2 className="text-2xl font-bold text-secondary-900 mb-2 font-display">
          Bella Vista
        </h2>
        <p className="text-secondary-600 mb-6">Loading delicious menu...</p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
