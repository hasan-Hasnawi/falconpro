'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import ProductCard from '@/components/products/ProductCard';

interface Product {
  _id: string;
  name: { ar: string; en: string };
  price: number;
  images: string[];
  isOnSale: boolean;
  salePrice?: number;
}

export default function FeaturedProducts() {
  const params = useParams();
  const locale = (Array.isArray(params.locale) ? params.locale[0] : params.locale) || 'ar';
  const t = useTranslations('products');
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch('/api/products?featured=true')
      .then((r) => r.json())
      .then((data) => setProducts(data.products || []))
      .catch(console.error);
  }, []);

  const title = locale === 'ar' ? 'منتجات مميزة' : 'Featured Products';

  return (
    <section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-white to-falcon-bluePale/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-falcon-dark mb-4">{title}</h2>
          <div className="w-24 h-1 bg-falcon-gold mx-auto rounded-full" />
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product._id} product={product} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}
