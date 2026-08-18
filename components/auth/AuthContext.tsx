'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  phone: string;
  name: string;
  isAdmin: boolean;
  ordersCount: number;
  loyaltyCycleCount: number;
  coupons: any[];
}

interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<AuthResult>;
  register: (phone: string, password: string, name?: string) => Promise<AuthResult>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify');
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (phone: string, password: string): Promise<AuthResult> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || 'خطأ في تسجيل الدخول' };
    } catch {
      return { success: false, error: 'حدث خطأ في الاتصال بالسيرفر' };
    }
  };

  const register = async (phone: string, password: string, name?: string): Promise<AuthResult> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, name }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || 'خطأ في إنشاء الحساب' };
    } catch {
      return { success: false, error: 'حدث خطأ في الاتصال بالسيرفر' };
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof document !== 'undefined') {
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
    router.push('/');
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
