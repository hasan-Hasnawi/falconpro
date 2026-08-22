'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, User, LogOut, ChevronDown, Shield } from 'lucide-react';
import { useCart } from '@/components/cart/CartContext';
import { useAuth } from '@/components/auth/AuthContext';

export default function Header() {
  const params = useParams();
  const locale = (Array.isArray(params.locale) ? params.locale[0] : params.locale) || 'ar';
  const t = useTranslations('nav');
  const { count } = useCart();
  const { user, logout, checkAuth } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleUserMenuClick = () => {
    if (!user) {
      checkAuth();
    }
    setUserMenuOpen(!userMenuOpen);
  };
  const isRTL = locale === 'ar';

  const switchLocale = locale === 'ar' ? 'en' : 'ar';

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50 bg-falcon-blue border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative flex items-center justify-between h-20 sm:h-24">
          {/* Mobile: Text name in corner */}
          <Link href={`/${locale}`} className="flex items-center shrink-0 sm:hidden">
            <span className="text-white font-bold text-lg">
              Falcon<span className="text-falcon-gold">Pro</span>
            </span>
          </Link>

          {/* Logo - centered on mobile, left on desktop */}
          <Link href={`/${locale}`} className="hidden sm:flex items-center gap-3 shrink-0">
            <div className="relative w-20 h-20">
              <Image
                src="/images/falconpro-logo.png"
                alt="FalconPro"
                fill
                className="object-contain"
                sizes="80px"
                priority
              />
            </div>
            <span className="text-white font-bold text-xl">
              Falcon<span className="text-falcon-gold">Pro</span>
            </span>
          </Link>
          <Link href={`/${locale}`} className="sm:hidden absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
            <div className="relative w-12 h-12">
              <Image
                src="/images/falconpro-logo.png"
                alt="FalconPro"
                fill
                className="object-contain"
                sizes="48px"
                priority
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href={`/${locale}`} className="text-white/80 hover:text-falcon-gold transition-colors text-sm font-medium">
              {t('home')}
            </Link>
            <Link href={`/${locale}/products`} className="text-white/80 hover:text-falcon-gold transition-colors text-sm font-medium">
              {t('products')}
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Locale Switch */}
            <Link
              href={`/${switchLocale}`}
              className="text-white/60 hover:text-falcon-gold text-sm font-medium transition-colors"
            >
              {locale === 'ar' ? 'EN' : 'عربي'}
            </Link>

            {/* Cart */}
            <Link href={`/${locale}/cart`} className="relative p-2 text-white/80 hover:text-falcon-gold transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-falcon-gold text-falcon-dark text-xs font-bold rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={handleUserMenuClick}
                  className="flex items-center gap-1 p-2 text-white/80 hover:text-falcon-gold transition-colors"
                >
                  <User className="w-5 h-5" />
                  <ChevronDown className="w-4 h-4 hidden sm:block" />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`absolute top-full ${isRTL ? 'left-0' : 'right-0'} mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden`}
                    >
                      <Link href={`/${locale}/profile`} className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setUserMenuOpen(false)}>
                        <User className="w-4 h-4" />
                        <span className="text-sm">{t('profile')}</span>
                      </Link>
                      {user.isAdmin && (
                        <Link href="/admin" className="flex items-center gap-2 px-4 py-3 text-falcon-blue hover:bg-blue-50 transition-colors" onClick={() => setUserMenuOpen(false)}>
                          <Shield className="w-4 h-4" />
                          <span className="text-sm">{t('admin')}</span>
                        </Link>
                      )}
                      <button onClick={() => { logout(); setUserMenuOpen(false); }} className="flex items-center gap-2 w-full px-4 py-3 text-red-500 hover:bg-red-50 transition-colors">
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">{t('logout')}</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href={`/${locale}/login`} className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-sm text-white border border-white/30 rounded-lg hover:bg-white/10 transition-colors">
                <User className="w-4 h-4" />
                {t('login')}
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-white">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-falcon-blueDark border-t border-white/10">
            <div className="px-4 py-4 space-y-3">
              <Link href={`/${locale}`} className="block text-white/80 py-2" onClick={() => setMobileMenuOpen(false)}>{t('home')}</Link>
              <Link href={`/${locale}/products`} className="block text-white/80 py-2" onClick={() => setMobileMenuOpen(false)}>{t('products')}</Link>
              <Link href={`/${locale}/cart`} className="block text-white/80 py-2" onClick={() => setMobileMenuOpen(false)}>{t('cart')} ({count})</Link>
              {!user && <Link href={`/${locale}/login`} className="block text-falcon-gold py-2" onClick={() => setMobileMenuOpen(false)}>{t('login')}</Link>}
              {user && (
                <>
                  <Link href={`/${locale}/profile`} className="block text-white/80 py-2" onClick={() => setMobileMenuOpen(false)}>{t('profile')}</Link>
                  <button onClick={logout} className="block text-red-400 py-2">{t('logout')}</button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
