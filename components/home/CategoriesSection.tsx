'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Dumbbell, Heart, Package, ArrowRight } from 'lucide-react';

interface Category {
  _id: string;
  name: { ar: string; en: string };
  type: string;
  icon: string;
  image?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  Dumbbell: <Dumbbell className="w-8 h-8" />,
  Heart: <Heart className="w-8 h-8" />,
  Package: <Package className="w-8 h-8" />,
};

export default function CategoriesSection() {
  const params = useParams();
  const locale = (Array.isArray(params.locale) ? params.locale[0] : params.locale) || 'ar';
  const t = useTranslations('categories');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/categories?type=main')
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []))
      .catch(console.error);
  }, []);

  const getIcon = (iconName: string) => iconMap[iconName] || <Package className="w-8 h-8" />;

  const colors = [
    'from-falcon-blue/5 to-falcon-blue/10 border-falcon-blue/20',
    'from-falcon-gold/5 to-falcon-gold/10 border-falcon-gold/20',
    'from-emerald-500/5 to-emerald-500/10 border-emerald-500/20',
  ];

  return (
    <section className="py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-falcon-dark mb-4">{t('title')}</h2>
          <div className="w-24 h-1 bg-falcon-blue mx-auto rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                href={`/${locale}/products?category=${cat._id}`}
                className={`group block relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors[i % 3]} border p-6 sm:p-8 hover:shadow-lg hover:shadow-falcon-blue/10 transition-all duration-300`}
              >
                <div className="relative z-10">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-falcon-blue/10 flex items-center justify-center text-falcon-blue mb-4 sm:mb-6 group-hover:bg-falcon-blue group-hover:text-white transition-all duration-300">
                    {getIcon(cat.icon)}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-falcon-dark mb-2">{(cat.name as any)[locale as string]}</h3>
                  <div className="flex items-center gap-2 text-falcon-blue group-hover:text-falcon-blueDark transition-colors">
                    <span className="text-sm font-medium">{t('viewAll')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
