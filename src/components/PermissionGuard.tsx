/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

interface PermissionGuardProps {
  children: ReactNode;
  module: string;
  action: 'view' | 'create' | 'edit' | 'delete' | 'approve';
  fallback?: ReactNode;
}

export default function PermissionGuard({ 
  children, 
  module, 
  action, 
  fallback = null 
}: PermissionGuardProps) {
  const { hasPermission } = useAuth();
  
  if (!hasPermission(module, action)) {
    return fallback;
  }
  
  return <>{children}</>;
}
