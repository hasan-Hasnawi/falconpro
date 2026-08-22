'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface CartItemFlavor {
  name: { ar: string; en: string };
  image: string;
}

export interface CartItem {
  productId: string;
  name: any;
  price: number;
  quantity: number;
  image: string;
  flavor?: CartItemFlavor;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, flavorName?: string) => void;
  updateQuantity: (productId: string, quantity: number, flavorName?: string) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string, flavorName?: string) => number;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function sameItem(a: CartItem, productId: string, flavorName?: string) {
  if (a.productId !== productId) return false;
  const aFlavorName = a.flavor?.name?.ar || '';
  const targetFlavorName = flavorName || '';
  return aFlavorName === targetFlavorName;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('falconpro-cart');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem('falconpro-cart', JSON.stringify(items));
    }
  }, [items]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const flavorName = item.flavor?.name?.ar || '';
      const existing = prev.find((i) => sameItem(i, item.productId, flavorName));
      if (existing) {
        return prev.map((i) =>
          sameItem(i, item.productId, flavorName)
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((productId: string, flavorName?: string) => {
    setItems((prev) => {
      const filtered = prev.filter((i) => !sameItem(i, productId, flavorName));
      if (filtered.length === 0) {
        localStorage.removeItem('falconpro-cart');
      }
      return filtered;
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, flavorName?: string) => {
    if (quantity < 1) {
      setItems((prev) => {
        const filtered = prev.filter((i) => !sameItem(i, productId, flavorName));
        if (filtered.length === 0) {
          localStorage.removeItem('falconpro-cart');
        }
        return filtered;
      });
      return;
    }
    setItems((prev) =>
      prev.map((i) => (sameItem(i, productId, flavorName) ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem('falconpro-cart');
  }, []);

  const getItemQuantity = useCallback((productId: string, flavorName?: string) => {
    return items.reduce((sum, item) => {
      if (sameItem(item, productId, flavorName)) {
        return sum + item.quantity;
      }
      return sum;
    }, 0);
  }, [items]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, getItemQuantity, total, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
