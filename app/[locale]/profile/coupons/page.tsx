'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Ticket, Copy, Check, ShoppingBag, AlertCircle, ChevronRight, Truck, Gift, Percent, DollarSign } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import Link from 'next/link';

interface Coupon {
  _id?: string;
  code: string;
  type: 'free_delivery' | 'percentage' | 'fixed' | 'free_product';
  value: number | string;
  description: { ar: string; en: string };
  isUsed: boolean;
  usedAt?: string;
  earnedAt: string;
  expiresAt?: string;
  freeProductChoice?: {
    type: 'admin' | 'user';
    productId?: string;
    categoryId?: string;
    maxValue?: number;
  };
}

const typeIcons: Record<string, React.ReactNode> = {
  free_delivery: <Truck className="w-6 h-6" />,
  percentage: <Percent className="w-6 h-6" />,
  fixed: <DollarSign className="w-6 h-6" />,
  free_product: <Gift className="w-6 h-6" />,
};

const typeColors: Record<string, string> = {
  free_delivery: 'bg-blue-50 text-falcon-blue border-blue-200',
  percentage: 'bg-purple-50 text-purple-600 border-purple-200',
  fixed: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  free_product: 'bg-falcon-gold/20 text-amber-700 border-falcon-gold/50',
};

export default function CouponsPage() {
  const params = useParams();
  const locale = (Array.isArray(params.locale) ? params.locale[0] : params.locale) || 'ar';
  const router = useRouter();
  const { user, loading } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}/login`);
    }
  }, [user, loading, locale, router]);

  useEffect(() => {
    if (user) {
      fetch('/api/users/coupons')
        .then((r) => r.json())
        .then((data) => setCoupons(data.coupons || []))
        .catch(console.error);
    }
  }, [user]);

  const isExpired = (coupon: Coupon) => {
    if (!coupon.expiresAt) return false;
    return new Date(coupon.expiresAt) < new Date();
  };

  const getStatus = (coupon: Coupon) => {
    if (coupon.isUsed) return 'used';
    if (isExpired(coupon)) return 'expired';
    return 'active';
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-falcon-blue/30 border-t-falcon-blue rounded-full animate-spin" />
      </div>
    );
  }

  const activeCoupons = coupons.filter((c) => getStatus(c) === 'active');
  const usedCoupons = coupons.filter((c) => getStatus(c) === 'used');
  const expiredCoupons = coupons.filter((c) => getStatus(c) === 'expired');

  const renderCouponCard = (coupon: Coupon) => {
    const status = getStatus(coupon);
    return (
      <motion.div
        key={coupon._id || coupon.code}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-5 bg-white border rounded-2xl shadow-sm hover:shadow-md transition-all ${
          status === 'active' ? 'border-gray-100' : 'border-gray-100 opacity-70'
        }`}
      >
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${typeColors[coupon.type] || 'bg-gray-50 text-gray-600'}`}>
            {typeIcons[coupon.type] || <Ticket className="w-6 h-6" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-falcon-dark">{coupon.description?.ar || 'كوبون'}</h3>
              {status === 'active' && (
                <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg border border-emerald-200">نشط</span>
              )}
              {status === 'used' && (
                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded-lg">مستخدم</span>
              )}
              {status === 'expired' && (
                <span className="px-2 py-1 bg-red-50 text-red-500 text-xs font-bold rounded-lg border border-red-200">منتهي</span>
              )}
            </div>
            <p className="text-gray-500 text-sm mb-3">
              {coupon.type === 'percentage' && `خصم ${coupon.value}%`}
              {coupon.type === 'fixed' && `خصم ${Number(coupon.value).toLocaleString()} د.ع`}
              {coupon.type === 'free_delivery' && 'توصيل مجاني'}
              {coupon.type === 'free_product' && 'منتج مجاني'}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 bg-falcon-bluePale text-falcon-blue font-bold rounded-lg text-sm">{coupon.code}</span>
                {status === 'active' && (
                  <button
                    onClick={() => copyCode(coupon.code)}
                    className="p-1.5 text-gray-400 hover:text-falcon-blue hover:bg-falcon-bluePale rounded-lg transition-all"
                    title="نسخ الكود"
                  >
                    {copiedCode === coupon.code ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>
              {status === 'active' && (
                <Link
                  href={`/${locale}/cart`}
                  className="flex items-center gap-1 px-4 py-2 bg-falcon-blue text-white text-sm font-bold rounded-xl hover:bg-falcon-blueDark transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  استخدم
                </Link>
              )}
            </div>
            {coupon.expiresAt && (
              <p className="text-gray-400 text-xs mt-2">
                {status === 'expired' ? 'انتهت الصلاحية: ' : 'صالح حتى: '}
                {new Date(coupon.expiresAt).toLocaleDateString('ar-IQ')}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Link href={`/${locale}/profile`} className="text-gray-500 hover:text-falcon-blue transition-colors flex items-center gap-1">
            <ChevronRight className="w-5 h-5" />
            البروفايل
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-2xl font-bold text-falcon-dark flex items-center gap-2">
            <Ticket className="w-7 h-7 text-falcon-gold" />
            كوبوناتي
          </h1>
        </div>

        {activeCoupons.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-falcon-dark mb-4 flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-500" />
              كوبونات نشطة
            </h2>
            <div className="grid gap-4">
              {activeCoupons.map(renderCouponCard)}
            </div>
          </div>
        )}

        {usedCoupons.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-falcon-dark mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-gray-400" />
              كوبونات مستخدمة
            </h2>
            <div className="grid gap-4">
              {usedCoupons.map(renderCouponCard)}
            </div>
          </div>
        )}

        {expiredCoupons.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-falcon-dark mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              كوبونات منتهية
            </h2>
            <div className="grid gap-4">
              {expiredCoupons.map(renderCouponCard)}
            </div>
          </div>
        )}

        {coupons.length === 0 && (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl">
            <Ticket className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">لا توجد كوبونات حالياً</p>
            <p className="text-gray-400 text-sm">قم بإجراء طلبات للحصول على كوبونات الولاء</p>
            <Link href={`/${locale}/products`} className="btn-primary inline-block mt-4">
              تسوق الآن
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
