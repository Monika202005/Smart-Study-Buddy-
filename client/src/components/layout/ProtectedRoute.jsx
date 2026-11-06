import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';

/**
 * ProtectedRoute Wrapper
 * Redirects to /login if there is no authenticated token in the store.
 */
export default function ProtectedRoute({ children }) {
  const { token, isAuthenticated } = useStore();
  const location = useLocation();

  if (!token || !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
