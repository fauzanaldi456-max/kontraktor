/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { User, UserRole } from '../types/auth';
import { MOCK_USERS, ROLE_PERMISSIONS, ROLE_NAVIGATION_ACCESS } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  hasPermission: (module: string, action: 'view' | 'create' | 'edit' | 'delete' | 'approve') => boolean;
  canAccessRoute: (route: string) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock authentication - in production, this would be an API call
const mockAuthenticate = (email: string, password: string): User | null => {
  const user = MOCK_USERS.find(u => u.email === email);
  if (user && password === 'password') {
    return user;
  }
  return null;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const authenticatedUser = mockAuthenticate(email, password);
    if (authenticatedUser) {
      setUser(authenticatedUser);
      localStorage.setItem('erp_user', JSON.stringify(authenticatedUser));
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('erp_user');
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    const newUser = MOCK_USERS.find(u => u.role === role);
    if (newUser) {
      setUser(newUser);
      localStorage.setItem('erp_user', JSON.stringify(newUser));
    }
  }, []);

  const hasPermission = useCallback((module: string, action: 'view' | 'create' | 'edit' | 'delete' | 'approve'): boolean => {
    if (!user) return false;
    const permissions = ROLE_PERMISSIONS[user.role];
    const modulePermission = permissions[module];
    if (!modulePermission) return false;
    return modulePermission[action] ?? false;
  }, [user]);

  const canAccessRoute = useCallback((route: string): boolean => {
    if (!user) return false;
    const allowedRoutes = ROLE_NAVIGATION_ACCESS[user.role];
    return allowedRoutes.includes(route);
  }, [user]);

  // Check for stored user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('erp_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('erp_user');
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        switchRole,
        hasPermission,
        canAccessRoute,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
