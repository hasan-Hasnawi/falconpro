'use client';

import { AuthProvider } from '@/components/auth/AuthContext';
import { CartProvider } from '@/components/cart/CartContext';
import { ToastProvider } from '@/components/ui/Toast';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}
