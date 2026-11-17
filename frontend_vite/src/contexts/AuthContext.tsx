// Pharma Cold Track - Authentication Context
// Manages user authentication state, tokens, and permissions

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserRole } from '../types';
import type { User, LoginForm } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginForm) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  hasPermission: (roles: UserRole[]) => boolean;
  updatePreferences: (preferences: Partial<User['preferences']>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('pharma_user');
    localStorage.removeItem('pharma_token');
    setUser(null);
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem('pharma_token');
      if (storedToken) {
        const parts = storedToken.split('.');
        const payloadStr = parts.length >= 2 ? parts[1] : parts[0];
        const tokenPayload = JSON.parse(atob(payloadStr));
        if (tokenPayload.exp && tokenPayload.exp * 1000 <= Date.now()) {
          logout();
        }
      }
    } catch {
      logout();
    }
  }, [logout]);

  // Initialize auth state from localStorage/tokens
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('pharma_user');
        const storedToken = localStorage.getItem('pharma_token');

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (storedToken) {
            try {
              const parts = storedToken.split('.');
              const payloadStr = parts.length === 3 ? parts[1] : (parts.length >= 2 ? parts[parts.length - 1] : parts[0]);
              const tokenPayload = JSON.parse(atob(payloadStr));
              if (tokenPayload.exp && tokenPayload.exp * 1000 <= Date.now()) {
                logout();
                return;
              }
            } catch (tokenErr) {
              console.warn('Token verification bypassed:', tokenErr);
            }
          }
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [logout]);

  const login = useCallback(async (credentials: LoginForm) => {
    setIsLoading(true);
    try {
      // Mock user for operational demo
      const mockUser: User = {
        user_id: 'USR-001',
        email: credentials.email || 'demo@pharmatrack.com',
        name: 'Dr. Sarah Mitchell',
        role: UserRole.OPERATIONS_MANAGER,
        facility_ids: ['FAC-001', 'FAC-002'],
        mfa_enabled: credentials.email.includes('mfa'),
        last_login: Date.now(),
        created_at: Date.now() - 86400000 * 30,
        updated_at: Date.now(),
        preferences: {
          theme: 'dark',
          temperature_unit: 'C',
          notifications: {
            email: true,
            sms: true,
            push: true,
            excursion_alerts: true,
            daily_summary: true,
            weekly_report: false,
          },
          map_style: 'dark',
          auto_refresh_interval: 30,
        },
      };

      // Valid 3-part JWT structure: header.payload.signature
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({
        sub: mockUser.user_id,
        email: mockUser.email,
        role: mockUser.role,
        exp: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days expiry
      }));
      const mockToken = `${header}.${payload}.sig_${Date.now()}`;

      localStorage.setItem('pharma_user', JSON.stringify(mockUser));
      localStorage.setItem('pharma_token', mockToken);
      setUser(mockUser);
    } catch (error) {
      throw new Error('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const hasPermission = useCallback((roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  const updatePreferences = useCallback(async (preferences: Partial<User['preferences']>) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      preferences: { ...user.preferences, ...preferences },
      updated_at: Date.now(),
    };

    localStorage.setItem('pharma_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshToken,
        hasPermission,
        updatePreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
