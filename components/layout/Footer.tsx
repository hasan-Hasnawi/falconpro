'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Instagram, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SiteSettings {
  sitePhone: string;
  siteInstagram: string;
  siteDescription: string;
}

const defaults: SiteSettings = {
  sitePhone: '0776 666 1816',
  siteInstagram: '@199fal',
  siteDescription: 'أفضل المكملات الغذائية والبروتين للاعبي كمال الأجسام والرياضيين المحترفين في العراق',
};

export default function Footer() {
  const params = useParams();
  const locale = (Array.isArray(params.locale) ? params.locale[0] : params.locale) || 'ar';
  const t = useTranslations('footer');
  const [settings, setSettings] = useState<SiteSettings>(defaults);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        const s = data.settings;
        if (s) {
          setSettings({
            sitePhone: s.sitePhone || defaults.sitePhone,
            siteInstagram: s.siteInstagram || defaults.siteInstagram,
            siteDescription: s.siteDescription || defaults.siteDescription,
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-falcon-blueDark border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                <Image
                  src="/images/falconpro-logo.png"
                  alt="FalconPro"
                  fill
                  className="object-contain"
                  sizes="80px"
                />
              </div>
              <div>
                <span className="text-white font-bold text-xl">Falcon<span className="text-falcon-gold">Pro</span></span>
                <p className="text-white/50 text-xs mt-0.5">Supplements & Protein</p>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              {settings.siteDescription}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">روابط سريعة</h3>
            <div className="space-y-2">
              <Link href={`/${locale}`} className="block text-white/50 hover:text-falcon-gold text-sm transition-colors">الرئيسية</Link>
              <Link href={`/${locale}/products`} className="block text-white/50 hover:text-falcon-gold text-sm transition-colors">المنتجات</Link>
              <Link href={`/${locale}/cart`} className="block text-white/50 hover:text-falcon-gold text-sm transition-colors">السلة</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('contact')}</h3>
            <div className="space-y-3">
              <a href={`tel:${settings.sitePhone.replace(/\s/g, '')}`} className="flex items-center gap-2 text-white/50 text-sm hover:text-falcon-gold transition-colors">
                <Phone className="w-4 h-4 text-falcon-gold" />
                <span>{settings.sitePhone}</span>
              </a>
              <a href="https://instagram.com/199fal" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/50 text-sm hover:text-falcon-gold transition-colors">
                <Instagram className="w-4 h-4 text-falcon-gold" />
                <span>{settings.siteInstagram}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 text-center">
          <p className="text-white/30 text-sm">© {new Date().getFullYear()} FalconPro. {t('rights')}</p>
        </div>
      </div>
    </footer>
  );
}
