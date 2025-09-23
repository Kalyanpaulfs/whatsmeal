import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/admin/ProtectedRoute';
import AdminDashboard from '../components/admin/AdminDashboard';

const AdminPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/overview" replace />} />
        <Route path="/*" element={<AdminDashboard />} />
      </Routes>
    </ProtectedRoute>
  );
};

export default AdminPage;
