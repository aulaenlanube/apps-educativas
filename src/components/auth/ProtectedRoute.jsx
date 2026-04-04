import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, isAdmin, role: currentRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (role) {
    // Admin puede acceder a rutas de teacher y admin
    const hasAccess = isAdmin || currentRole === role;
    if (!hasAccess) return <Navigate to="/" replace />;
  }

  return children;
}
