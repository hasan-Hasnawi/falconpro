'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Check, AlertCircle } from 'lucide-react';
import { useCart } from '@/components/cart/CartContext';

interface Product {
  _id: string;
  name: { ar: string; en: string };
  price: number;
  images: string[];
  isOnSale: boolean;
  salePrice?: number;
  stock?: number;
  isOutOfStock?: boolean;
  flavors?: { name: { ar: string; en: string }; image: string; stock: number }[];
}

interface ProductCardProps {
  product: Product;
  locale: string;
}

const ProductCard = React.memo(function ProductCard({ product, locale }: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const name = (product.name as any)[locale] || product.name.en;
  const displayPrice = product.isOnSale && product.salePrice ? product.salePrice : product.price;

  const isOutOfStock = product.isOutOfStock || (product.stock ?? 0) <= 0;
  const hasFlavors = (product.flavors?.length || 0) > 0;

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    // If product has flavors, redirect to product page to choose flavor
    if (hasFlavors) {
      window.location.href = `/${locale}/products/${product._id}`;
      return;
    }

    addItem({
      productId: product._id,
      name,
      price: displayPrice,
      quantity: 1,
      image: product.images[0] || '',
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }, [addItem, product._id, name, displayPrice, product.images, isOutOfStock, hasFlavors, locale]);

  return (
    <div className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-falcon-blue/30 hover:shadow-lg hover:shadow-falcon-blue/10 transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
        <Link href={`/${locale}/products/${product._id}`} className="block relative aspect-square overflow-hidden bg-gray-50">
        <Image
          src={product.images[0] || 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=500&q=80&fm=webp'}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 50vw, 25vw"
          loading="lazy"
        />
        {product.isOnSale && product.salePrice && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
            {Math.round(((product.price - product.salePrice) / product.price) * 100)}%
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              نفذت الكمية
            </div>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-falcon-dark font-semibold text-sm sm:text-base line-clamp-2 mb-2 min-h-[2.5rem]">
          {name}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-falcon-blue font-bold text-lg">
            {displayPrice.toLocaleString()} <span className="text-xs">د.ع</span>
          </span>
          {product.isOnSale && product.salePrice && (
            <span className="text-gray-400 text-sm line-through">
              {product.price.toLocaleString()}
            </span>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
            isOutOfStock
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : added
              ? 'bg-emerald-500 text-white'
              : hasFlavors
              ? 'bg-falcon-gold/20 text-falcon-gold hover:bg-falcon-gold hover:text-falcon-dark'
              : 'bg-falcon-blue/10 text-falcon-blue hover:bg-falcon-blue hover:text-white'
          }`}
        >
          {isOutOfStock ? (
            <>
              <AlertCircle className="w-4 h-4" />
              نفذت الكمية
            </>
          ) : added ? (
            <>
              <Check className="w-4 h-4" />
              تمت الإضافة
            </>
          ) : hasFlavors ? (
            <>
              <ShoppingCart className="w-4 h-4" />
              اختر النكهة
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              أضف للسلة
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
