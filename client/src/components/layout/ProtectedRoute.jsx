import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Loader2 } from 'lucide-react';

/**
 * ProtectedRoute Wrapper
 * Verifies token via GET /api/auth/me and redirects to /login if unauthenticated.
 */
export default function ProtectedRoute({ children }) {
  const { token, isAuthenticated, user, fetchCurrentUser } = useStore();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(!user && Boolean(token));

  useEffect(() => {
    let isMounted = true;
    if (token && !user) {
      fetchCurrentUser().finally(() => {
        if (isMounted) setIsVerifying(false);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [token, user, fetchCurrentUser]);

  if (!token || !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <p className="text-sm font-medium">Verifying your session...</p>
      </div>
    );
  }

  return children;
}
