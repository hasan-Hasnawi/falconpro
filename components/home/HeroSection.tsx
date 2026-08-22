'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowRight, Zap, Dumbbell } from 'lucide-react';
import Image from 'next/image';

interface HeroSettings {
  heroTitleAr: string;
  heroTitleEn: string;
  heroSubtitleAr: string;
  heroSubtitleEn: string;
  heroDescriptionAr: string;
  heroDescriptionEn: string;
  heroCtaAr: string;
  heroCtaEn: string;
  heroImages: string[];
}

const defaultSettings: HeroSettings = {
  heroTitleAr: 'FalconPro',
  heroTitleEn: 'FalconPro',
  heroSubtitleAr: 'Event Title',
  heroSubtitleEn: 'Event Title',
  heroDescriptionAr: 'Best supplements and protein',
  heroDescriptionEn: 'Best supplements and protein',
  heroCtaAr: 'Shop Now',
  heroCtaEn: 'Shop Now',
  heroImages: [],
};

export default function HeroSection() {
  const params = useParams();
  const locale = (Array.isArray(params.locale) ? params.locale[0] : params.locale) || 'ar';
  const t = useTranslations('hero');
  const isRTL = locale === 'ar';
  const [settings, setSettings] = useState<HeroSettings>(defaultSettings);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        const s = data.settings;
        if (s) {
          setSettings({
            heroTitleAr: s.heroTitleAr || defaultSettings.heroTitleAr,
            heroTitleEn: s.heroTitleEn || defaultSettings.heroTitleEn,
            heroSubtitleAr: s.heroSubtitleAr || defaultSettings.heroSubtitleAr,
            heroSubtitleEn: s.heroSubtitleEn || defaultSettings.heroSubtitleEn,
            heroDescriptionAr: s.heroDescriptionAr || defaultSettings.heroDescriptionAr,
            heroDescriptionEn: s.heroDescriptionEn || defaultSettings.heroDescriptionEn,
            heroCtaAr: s.heroCtaAr || defaultSettings.heroCtaAr,
            heroCtaEn: s.heroCtaEn || defaultSettings.heroCtaEn,
            heroImages: s.heroImages || [],
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (settings.heroImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % settings.heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [settings.heroImages.length]);

  const title = isRTL ? settings.heroTitleAr : settings.heroTitleEn;
  const subtitle = isRTL ? settings.heroSubtitleAr : settings.heroSubtitleEn;
  const description = isRTL ? settings.heroDescriptionAr : settings.heroDescriptionEn;
  const cta = isRTL ? settings.heroCtaAr : settings.heroCtaEn;
  const hasImages = settings.heroImages.length > 0;

  return (
    <section className="relative min-h-[60vh] sm:min-h-[85vh] flex items-center justify-center overflow-hidden">
      {hasImages && (
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImage}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${settings.heroImages[currentImage]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70" />
        </div>
      )}

      {!hasImages && (
        <div className="absolute inset-0 bg-gradient-to-br from-falcon-blue via-falcon-blueDark to-falcon-blue" />
      )}

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-falcon-gold rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {hasImages && settings.heroImages.length > 1 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {settings.heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentImage(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === currentImage ? 'bg-falcon-gold w-6' : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-right"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full mb-6"
            >
              <Zap className="w-4 h-4 text-falcon-gold" />
              <span className="text-falcon-gold text-sm font-bold">
                {subtitle}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="hidden sm:block text-5xl lg:text-7xl font-extrabold text-white mb-3 sm:mb-4"
            >
              {title}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="sm:hidden flex flex-col items-center mb-4"
            >
              <div className="relative w-40 h-40">
                <Image
                  src="/images/falconpro-logo.png"
                  alt="FalconPro"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                  sizes="160px"
                />
              </div>
              <h1 className="text-2xl font-extrabold text-white mt-2">
                Falcon<span className="text-falcon-gold">Pro</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="hidden sm:block text-white/60 text-base lg:text-lg max-w-xl mx-auto lg:mx-0 mb-6 sm:mb-8 leading-relaxed"
            >
              {description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link
                href={`/${locale}/products`}
                className="group inline-flex items-center gap-2 px-8 py-4 bg-falcon-gold text-falcon-dark font-bold rounded-xl hover:bg-falcon-goldLight transition-all duration-300 shadow-lg shadow-falcon-gold/30"
              >
                <Dumbbell className="w-5 h-5" />
                {cta}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-10 flex flex-wrap gap-3 justify-center lg:justify-start"
            >
              {[t('motivation1'), t('motivation2'), t('motivation3')].map((msg, i) => (
                <span key={i} className="px-3 py-1.5 bg-white/10 text-white/70 text-sm rounded-lg border border-white/10">
                  {msg}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {!hasImages && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-falcon-gold/20 rounded-full blur-3xl animate-pulse" />
                <Image
                  src="/images/falconpro-logo.png"
                  alt="FalconPro"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F0F4FF" />
        </svg>
      </div>
    </section>
  );
}
