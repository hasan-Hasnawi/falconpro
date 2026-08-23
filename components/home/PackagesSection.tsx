'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import PackageCard from '@/components/products/PackageCard';

interface PackageItem {
  _id: string;
  name: { ar: string; en: string };
  description?: { ar: string; en: string };
  images?: string[];
  products: { name: { ar: string; en: string }; quantity: number; originalPrice: number; discount: number }[];
  totalOriginalPrice: number;
  finalPrice: number;
}

export default function PackagesSection() {
  const params = useParams();
  const locale = (Array.isArray(params.locale) ? params.locale[0] : params.locale) || 'ar';
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [packagesTitle, setPackagesTitle] = useState(locale === 'ar' ? 'عروض البكجات' : 'Package Deals');

  useEffect(() => {
    fetch('/api/packages')
      .then((r) => r.json())
      .then((data) => setPackages(data.packages || []))
      .catch(console.error);

    fetch('/api/settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        const s = data.settings;
        if (s) {
          setPackagesTitle(locale === 'ar' ? (s.packagesTitleAr || 'عروض البكجات') : (s.packagesTitleEn || 'Package Deals'));
        }
      })
      .catch(console.error);
  }, [locale]);

  if (packages.length === 0) return null;

  return (
    <section className="py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-falcon-dark mb-4">{packagesTitle}</h2>
          <div className="w-24 h-1 bg-falcon-gold mx-auto rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {packages.slice(0, 4).map((pkg) => (
            <PackageCard key={pkg._id} packageItem={pkg} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}
