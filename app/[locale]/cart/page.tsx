'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/components/cart/CartContext';

export default function CartPage() {
  const params = useParams();
  const locale = (Array.isArray(params.locale) ? params.locale[0] : params.locale) || 'ar';
  const t = useTranslations('cart');
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <ShoppingBag className="w-20 h-20 text-gray-200 mb-6" />
        <h2 className="text-2xl font-bold text-falcon-dark mb-2">{t('empty')}</h2>
        <Link
          href={`/${locale}/products`}
          className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-falcon-blue text-white font-bold rounded-xl hover:bg-falcon-blueDark transition-colors"
        >
          {t('continueShopping')}
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-falcon-dark mb-8">
          {t('title')}
        </motion.h1>

        <div className="space-y-4">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={`${item.productId}-${item.flavor?.name?.ar || 'default'}`}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm"
              >
                {/* Mobile: Image + Name row */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden shrink-0 bg-gray-50">
                    <Image
                      src={item.image || 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=200&q=80&fm=webp'}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-falcon-dark font-semibold text-sm sm:text-base line-clamp-2">{item.name}</h3>
                    {item.flavor && (
                      <p className="text-gray-500 text-xs mt-1">
                        النكهة: {item.flavor.name.ar}
                      </p>
                    )}
                    <p className="text-falcon-blue font-medium mt-1 text-sm">{item.price.toLocaleString()} <span className="text-xs">د.ع</span></p>
                  </div>
                </div>

                {/* Mobile: Quantity + Price + Delete row */}
                <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1, item.flavor?.name?.ar)} className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg bg-gray-100 text-falcon-dark hover:bg-gray-200 flex items-center justify-center transition-colors active:scale-95">
                      <Minus className="w-5 h-5 sm:w-4 sm:h-4" />
                    </button>
                    <span className="w-10 sm:w-8 text-center text-falcon-dark font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1, item.flavor?.name?.ar)} className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg bg-gray-100 text-falcon-dark hover:bg-gray-200 flex items-center justify-center transition-colors active:scale-95">
                      <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="text-falcon-dark font-bold text-sm sm:text-base">{(item.price * item.quantity).toLocaleString()} <span className="text-xs">د.ع</span></p>

                    <button onClick={() => removeItem(item.productId, item.flavor?.name?.ar)} className="p-2.5 sm:p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors active:scale-95">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-500">{t('total')}</span>
            <span className="text-falcon-dark font-bold text-xl">{total.toLocaleString()} د.ع</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={clearCart} className="px-4 py-3 text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors text-sm">
              إفراغ السلة
            </button>
            <Link href={`/${locale}/checkout`} className="flex-1 text-center px-6 py-3 bg-falcon-blue text-white font-bold rounded-xl hover:bg-falcon-blueDark transition-colors">
              {t('checkout')}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
