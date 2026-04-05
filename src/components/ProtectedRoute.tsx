/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  requiredPermission?: {
    module: string;
    action: 'view' | 'create' | 'edit' | 'delete' | 'approve';
  };
}

export default function ProtectedRoute({ 
  children, 
  requiredRoles,
  requiredPermission 
}: ProtectedRouteProps) {
  const { isAuthenticated, user, hasPermission, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check permission requirements
  if (requiredPermission && !hasPermission(requiredPermission.module, requiredPermission.action)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check route access
  const { canAccessRoute } = useAuth();
  if (!canAccessRoute(location.pathname)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
