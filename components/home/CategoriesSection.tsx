'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  Dumbbell, Heart, Flame, Footprints, Bike, Apple, Brain, Shield,
  Star, Zap, Target, Gem, Crown, Trophy, Rocket, Sparkles,
  ArrowRight
} from 'lucide-react';

interface Category {
  _id: string;
  name: { ar: string; en: string };
  type: string;
  icon: string;
  image?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  Dumbbell: <Dumbbell className="w-7 h-7" />,
  Heart: <Heart className="w-7 h-7" />,
  Flame: <Flame className="w-7 h-7" />,
  Footprints: <Footprints className="w-7 h-7" />,
  Bike: <Bike className="w-7 h-7" />,
  Apple: <Apple className="w-7 h-7" />,
  Brain: <Brain className="w-7 h-7" />,
  Shield: <Shield className="w-7 h-7" />,
  Star: <Star className="w-7 h-7" />,
  Zap: <Zap className="w-7 h-7" />,
  Target: <Target className="w-7 h-7" />,
  Gem: <Gem className="w-7 h-7" />,
  Crown: <Crown className="w-7 h-7" />,
  Trophy: <Trophy className="w-7 h-7" />,
  Rocket: <Rocket className="w-7 h-7" />,
  Sparkles: <Sparkles className="w-7 h-7" />,
  Package: <Dumbbell className="w-7 h-7" />,
};

const cardGradients = [
  'from-blue-600 via-blue-500 to-cyan-400',
  'from-amber-500 via-orange-500 to-red-500',
  'from-emerald-500 via-teal-500 to-cyan-500',
  'from-purple-600 via-violet-500 to-pink-500',
  'from-rose-500 via-pink-500 to-fuchsia-500',
  'from-sky-500 via-blue-500 to-indigo-500',
];

export default function CategoriesSection() {
  const params = useParams();
  const locale = (Array.isArray(params.locale) ? params.locale[0] : params.locale) || 'ar';
  const t = useTranslations('categories');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/categories?type=main', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []))
      .catch(console.error);
  }, []);

  const getIcon = (iconName: string) => iconMap[iconName] || <Dumbbell className="w-7 h-7" />;

  return (
    <section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 bg-falcon-blue/10 text-falcon-blue text-sm font-bold rounded-full mb-4">
            {t('title')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-falcon-dark mb-4">{t('title')}</h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-falcon-blue to-falcon-blueLight mx-auto rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {categories.map((cat, i) => {
            const gradient = cardGradients[i % cardGradients.length];
            return (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <Link
                  href={`/${locale}/products?category=${cat._id}`}
                  className="group block relative overflow-hidden rounded-2xl min-h-[200px] transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
                >
                  {cat.image ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url(${cat.image})` }}
                    />
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-all duration-500`} />
                  )}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-500" />

                  <div className="relative z-10 p-6 sm:p-8 flex flex-col justify-between min-h-[200px] text-white">
                    <div>
                      <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-5 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                        {getIcon(cat.icon)}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-extrabold mb-2 drop-shadow-lg">
                        {(cat.name as any)[locale as string]}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-white/90 group-hover:text-white transition-colors">
                      <span className="text-sm font-bold">{t('viewAll')}</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
