'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Gift, Check } from 'lucide-react';
import Image from 'next/image';

interface Product {
  _id: string;
  name: { ar: string; en: string };
  price: number;
  images?: string[];
}

interface FreeProductSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (productId: string) => void;
  categoryId?: string;
  maxValue?: number;
}

export default function FreeProductSelector({ isOpen, onClose, onSelect, categoryId, maxValue }: FreeProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        let prods = data.products || [];
        if (categoryId) {
          prods = prods.filter((p: any) => p.category === categoryId || p.subcategory === categoryId);
        }
        if (maxValue) {
          prods = prods.filter((p: any) => p.price <= maxValue);
        }
        setProducts(prods);
        setLoading(false);
      })
      .catch(console.error);
  }, [isOpen, categoryId, maxValue]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white border border-gray-100 rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden"
      >
        <div className="h-1 bg-gradient-to-r from-falcon-gold to-falcon-blue" />
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-falcon-gold/20 flex items-center justify-center">
              <Gift className="w-5 h-5 text-falcon-gold" />
            </div>
            <div>
              <h3 className="font-bold text-falcon-dark">اختر منتجك المجاني</h3>
              <p className="text-gray-400 text-sm">اختر منتجاً واحداً يصلح للكوبون</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">لا توجد منتجات متاحة لهذا الكوبون</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {products.map((prod) => (
                <button
                  key={prod._id}
                  onClick={() => setSelectedId(prod._id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-right ${
                    selectedId === prod._id
                      ? 'border-falcon-blue bg-falcon-bluePale'
                      : 'border-gray-100 hover:border-falcon-blue/30'
                  }`}
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={prod.images?.[0] || 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=100&q=80'}
                      alt={(prod.name as any).ar}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-bold text-falcon-dark">{(prod.name as any).ar}</p>
                    <p className="text-falcon-blue font-bold">{prod.price.toLocaleString()} د.ع</p>
                  </div>
                  {selectedId === prod._id && (
                    <div className="w-8 h-8 rounded-full bg-falcon-blue text-white flex items-center justify-center">
                      <Check className="w-5 h-5" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100">
          <button
            onClick={() => selectedId && onSelect(selectedId)}
            disabled={!selectedId}
            className="btn-primary w-full disabled:opacity-50"
          >
            تأكيد الاختيار
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
