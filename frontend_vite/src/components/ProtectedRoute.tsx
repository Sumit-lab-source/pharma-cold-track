// Pharma Cold Track - Protected Route Component
// Wrapper component that requires authentication

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, hasPermission } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#06080d]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
          <p className="text-xs text-slate-500 font-mono tracking-wide">Validating session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !hasPermission(allowedRoles as any)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#06080d] p-4">
        <div className="bg-[#0f1419] border border-white/[0.08] rounded-2xl max-w-md w-full p-8 text-center shadow-2xl">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold text-white mb-2">Access Denied</h1>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Your current operator credential does not have authorization for this view. Required role: <span className="text-white font-semibold font-mono">{allowedRoles.join(' / ')}</span>
          </p>
          <button
            onClick={() => window.history.back()}
            className="w-full py-2.5 px-4 gradient-brand text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            Return to Previous Screen
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
