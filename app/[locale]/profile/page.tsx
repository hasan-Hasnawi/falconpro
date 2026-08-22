'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Gift, Clock, Package, Truck, CheckCircle, XCircle, Ticket, ChevronLeft, Sparkles, X } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { getLocalizedName } from '@/lib/utils';
import Link from 'next/link';

interface Order {
  _id: string;
  items: { name: string | { ar: string; en: string }; quantity: number; price: number }[];
  finalTotal: number;
  status: string;
  createdAt: string;
  province: string;
}

interface LoyaltyStage {
  orderNumber: number;
  rewardType: string;
  rewardValue: number | string;
  description: { ar: string; en: string };
}

interface Settings {
  loyaltyStages: LoyaltyStage[];
  loyaltyCycleReset: number | null;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  pending: { label: 'قيد المراجعة', color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: <Clock className="w-4 h-4" /> },
  confirmed: { label: 'تم التأكيد', color: 'text-falcon-blue', bgColor: 'bg-blue-50', icon: <CheckCircle className="w-4 h-4" /> },
  shipped: { label: 'تم الشحن', color: 'text-falcon-gold', bgColor: 'bg-amber-50', icon: <Truck className="w-4 h-4" /> },
  delivered: { label: 'تم التوصيل', color: 'text-emerald-600', bgColor: 'bg-emerald-50', icon: <Package className="w-4 h-4" /> },
  cancelled: { label: 'ملغي', color: 'text-red-500', bgColor: 'bg-red-50', icon: <XCircle className="w-4 h-4" /> },
};

const rewardIcons: Record<string, React.ReactNode> = {
  free_delivery: <Truck className="w-5 h-5" />,
  percentage_discount: <Sparkles className="w-5 h-5" />,
  fixed_discount: <Ticket className="w-5 h-5" />,
  free_product: <Gift className="w-5 h-5" />,
};

const rewardLabels: Record<string, string> = {
  free_delivery: 'توصيل مجاني',
  percentage_discount: 'خصم نسبة',
  fixed_discount: 'خصم مبلغ',
  free_product: 'منتج مجاني',
};

export default function ProfilePage() {
  const params = useParams();
  const locale = (Array.isArray(params.locale) ? params.locale[0] : params.locale) || 'ar';
  const router = useRouter();
  const t = useTranslations('profile');
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [guestPhone, setGuestPhone] = useState('');
  const [earnedRewards, setEarnedRewards] = useState<any[]>([]);

  useEffect(() => {
    const savedPhone = localStorage.getItem('falconpro-last-phone');
    if (savedPhone) setGuestPhone(savedPhone);

    // Check for newly earned rewards from checkout
    const rewardsJson = localStorage.getItem('falconpro-earned-rewards');
    if (rewardsJson) {
      try {
        const rewards = JSON.parse(rewardsJson);
        if (rewards.length > 0) {
          setEarnedRewards(rewards);
        }
      } catch {}
    }
  }, []);

  const closeRewardModal = () => {
    setEarnedRewards([]);
    localStorage.removeItem('falconpro-earned-rewards');
  };

  useEffect(() => {
    if (!loading && !user && !guestPhone) {
      router.push(`/${locale}/login`);
    }
  }, [user, loading, guestPhone, locale, router]);

  useEffect(() => {
    setOrdersLoading(true);
    const url = user ? '/api/orders' : `/api/orders?phone=${encodeURIComponent(guestPhone)}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => setOrders(data.orders || []))
      .catch(console.error)
      .finally(() => setOrdersLoading(false));

    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => setSettings(data.settings))
      .catch(console.error);
  }, [user, guestPhone]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-falcon-blue/30 border-t-falcon-blue rounded-full animate-spin" />
      </div>
    );
  }

  const ordersCount = user ? user.ordersCount : orders.length;
  const stages = settings?.loyaltyStages || [];
  const sortedStages = [...stages].sort((a, b) => a.orderNumber - b.orderNumber);
  const maxStageNumber = sortedStages.length > 0 ? sortedStages[sortedStages.length - 1].orderNumber : 1;
  const cycleReset = settings?.loyaltyCycleReset || maxStageNumber + 1;
  const progressPercent = Math.min((ordersCount / (cycleReset - 1 || 1)) * 100, 100);

  return (
    <div className="py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-falcon-dark mb-2">
          {t('title')}
        </motion.h1>
        {!user && guestPhone && (
          <p className="text-gray-500 mb-8 text-sm">الطلبات المرتبطة برقم: {guestPhone}</p>
        )}

        {/* Reward Modal */}
        <AnimatePresence>
          {earnedRewards.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            >
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeRewardModal} />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white border border-gray-100 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              >
                <div className="h-1 bg-gradient-to-r from-falcon-gold to-falcon-blue" />
                <button onClick={closeRewardModal} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
                <div className="p-8 text-center space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-falcon-gold/20 flex items-center justify-center">
                    <Gift className="w-10 h-10 text-falcon-gold" />
                  </div>
                  <h2 className="text-2xl font-bold text-falcon-dark">مبروك! 🎉</h2>
                  <p className="text-gray-500">لقد حصلت على جوائز جديدة من كرت الولاء</p>
                  <div className="space-y-2">
                    {earnedRewards.map((reward: any, idx: number) => (
                      <div key={idx} className="p-4 bg-falcon-bluePale/50 rounded-xl border border-falcon-blue/20">
                        <p className="font-bold text-falcon-dark">{reward.stage?.description?.ar || reward.coupon?.description?.ar || 'جائزة جديدة'}</p>
                        <p className="text-sm text-falcon-blue mt-1">كود الكوبون: <span className="font-bold">{reward.coupon?.code}</span></p>
                      </div>
                    ))}
                  </div>
                  <Link href={`/${locale}/profile/coupons`} onClick={closeRewardModal} className="btn-primary block w-full">
                    عرض كوبوناتي
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loyalty Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-6 bg-gradient-to-br from-falcon-blue to-falcon-blueDark rounded-2xl text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Gift className="w-6 h-6 text-falcon-gold" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">كرت الولاء</h2>
                <p className="text-falcon-gold text-sm">اكمل المراحل واحصل على المكافآت</p>
              </div>
            </div>
            {user && (
              <Link href={`/${locale}/profile/coupons`} className="flex items-center gap-1 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors">
                <Ticket className="w-4 h-4" />
                كوبوناتي
                <ChevronLeft className="w-4 h-4" />
              </Link>
            )}
          </div>

          {!user && (
            <p className="text-white/70 text-sm mb-4">سجل دخول للحصول على كوبونات الولاء. الطلبات كزائر لا تتراكم في كرت الولاء.</p>
          )}

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/80">تقدمك</span>
              <span className="text-falcon-gold font-bold">{ordersCount} / {cycleReset - 1} طلب</span>
            </div>
            <div className="relative h-3 bg-white/20 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 1, ease: 'easeOut' }} className="absolute inset-y-0 left-0 bg-falcon-gold rounded-full" />
            </div>
          </div>

          {/* Stages Timeline */}
          {sortedStages.length > 0 && (
            <div className="space-y-3">
              {sortedStages.map((stage) => {
                const isCompleted = ordersCount >= stage.orderNumber;
                const isNext = !isCompleted && ordersCount + 1 === stage.orderNumber;
                return (
                  <div key={stage.orderNumber} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isCompleted ? 'bg-white/20' : 'bg-white/10'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted ? 'bg-falcon-gold text-falcon-dark' : isNext ? 'bg-white text-falcon-blue' : 'bg-white/10 text-white/60'}`}>
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : rewardIcons[stage.rewardType] || <Gift className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold text-sm ${isCompleted ? 'text-white' : 'text-white/90'}`}>
                        {(stage.description as any).ar || rewardLabels[stage.rewardType]}
                      </p>
                      <p className="text-white/60 text-xs">
                        بعد الطلب {stage.orderNumber} · {rewardLabels[stage.rewardType]}
                      </p>
                    </div>
                    {isCompleted && <span className="text-xs bg-falcon-gold text-falcon-dark px-2 py-1 rounded-lg font-bold">مكتمل</span>}
                    {isNext && <span className="text-xs bg-white text-falcon-blue px-2 py-1 rounded-lg font-bold">المرحلة القادمة</span>}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Orders */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-xl font-bold text-falcon-dark mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-falcon-blue" />{t('orders')}
          </h2>

          {ordersLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="animate-pulse bg-gray-100 h-24 rounded-xl" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 bg-white border border-gray-100 rounded-xl">
              <p className="text-gray-400">{t('noOrders')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const status = statusConfig[order.status] || statusConfig.pending;
                return (
                  <div key={order._id} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-400 text-sm">#{order._id.slice(-6)}</span>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${status.bgColor} ${status.color}`}>
                        {status.icon}<span>{status.label}</span>
                      </div>
                    </div>
                    <div className="space-y-1 mb-3">
                      {order.items.map((item, idx) => (
                        <p key={idx} className="text-gray-600 text-sm">{getLocalizedName(item.name, locale)} × {item.quantity}</p>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <span className="text-gray-400 text-sm">{order.province}</span>
                      <span className="text-falcon-blue font-bold">{order.finalTotal.toLocaleString()} د.ع</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
