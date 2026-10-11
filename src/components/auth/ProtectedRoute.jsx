import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BrandLoader from '@/components/ui/BrandLoader';

// `role` admite string o array. Admin tiene acceso a todo.
export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, isAdmin, role: currentRole, loading } = useAuth();

  if (loading) {
    return <BrandLoader variant="screen" />;
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    const hasAccess = isAdmin || allowed.includes(currentRole);
    if (!hasAccess) return <Navigate to="/" replace />;
  }

  return children;
}
