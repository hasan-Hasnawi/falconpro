'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowRight, Check, Tag, MapPin, Phone, Ticket, X, ChevronDown, ChevronUp, Gift, Truck } from 'lucide-react';
import { useCart } from '@/components/cart/CartContext';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/components/auth/AuthContext';
import { getLocalizedName } from '@/lib/utils';
import FreeProductSelector from '@/components/checkout/FreeProductSelector';

interface Settings {
  deliveryProvinces: string[];
  deliveryFee: number;
  excludedProvinces: string[];
}

interface Coupon {
  code: string;
  type: 'free_delivery' | 'percentage' | 'fixed' | 'free_product';
  value: number | string;
  description: { ar: string; en: string };
  isUsed: boolean;
  expiresAt?: string;
  freeProductChoice?: {
    type: 'admin' | 'user';
    productId?: string;
    categoryId?: string;
    maxValue?: number;
  };
}

interface AppliedCoupon extends Coupon {
  isUserCoupon: boolean;
  selectedProductId?: string;
  selectedProductName?: string;
  selectedProductPrice?: number;
}

export default function CheckoutPage() {
  const params = useParams();
  const locale = (Array.isArray(params.locale) ? params.locale[0] : params.locale) || 'ar';
  const router = useRouter();
  const t = useTranslations('checkout');
  const { items, total, clearCart } = useCart();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [phone, setPhone] = useState('');
  const [province, setProvince] = useState('');
  const [address, setAddress] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [discount, setDiscount] = useState(0);
  const [discountError, setDiscountError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [userCoupons, setUserCoupons] = useState<Coupon[]>([]);
  const [showCoupons, setShowCoupons] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => setSettings(data.settings || null))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (user?.phone) {
      setPhone(user.phone);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetch('/api/users/coupons')
        .then((r) => r.json())
        .then((data) => setUserCoupons(data.coupons || []))
        .catch(console.error);
    }
  }, [user]);

  const isProvinceExcluded = !!province && !!settings?.excludedProvinces?.includes(province);

  const currentDeliveryFee =
    !province || isProvinceExcluded
      ? 0
      : appliedCoupon?.type === 'free_delivery'
      ? 0
      : settings?.deliveryFee || 0;

  const applyDiscountCode = async () => {
    if (!discountCode.trim()) return;
    await applyCouponByCode(discountCode.trim());
  };

  const applyCouponByCode = async (code: string) => {
    try {
      const res = await fetch(`/api/discount-codes?code=${code.toUpperCase()}`);
      const data = await res.json();
      if (data.discount) {
        const d = data.discount;
        await applyDiscountObject(d);
        setDiscountCode('');
      } else {
        setDiscountError(data.error || 'Invalid code');
        setAppliedCoupon(null);
        setDiscount(0);
      }
    } catch {
      setDiscountError('Error applying code');
    }
  };

  const applyDiscountObject = async (d: any) => {
    setDiscountError('');

    if (d.type === 'free_product') {
      if (d.freeProductChoice?.type === 'user') {
        setAppliedCoupon({
          ...d,
          isUserCoupon: d.isUserCoupon || false,
          freeProductChoice: d.freeProductChoice,
        });
        setShowProductSelector(true);
        setDiscount(0);
        return;
      }

      const productRes = await fetch('/api/products');
      const productData = await productRes.json();
      const product = productData.products?.find((p: any) => p._id === d.value);
      if (product) {
        setAppliedCoupon({
          ...d,
          isUserCoupon: d.isUserCoupon || false,
          selectedProductId: product._id,
          selectedProductName: (product.name as any).ar,
          selectedProductPrice: product.price,
        });
        setDiscount(product.price);
      } else {
        setDiscountError(t('excludedProvince'));
      }
      return;
    }

    if (d.type === 'free_delivery') {
      setAppliedCoupon({ ...d, isUserCoupon: d.isUserCoupon || false });
      setDiscount(0);
      return;
    }

    const discountValue = d.type === 'percentage' ? Math.floor((total * d.value) / 100) : d.value;
    setAppliedCoupon({ ...d, isUserCoupon: d.isUserCoupon || false });
    setDiscount(discountValue);
  };

  const handleProductSelect = (productId: string) => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        const product = data.products?.find((p: any) => p._id === productId);
        if (product && appliedCoupon) {
          setAppliedCoupon({
            ...appliedCoupon,
            value: product._id,
            selectedProductId: product._id,
            selectedProductName: (product.name as any).ar,
            selectedProductPrice: product.price,
          });
          setDiscount(product.price);
          setShowProductSelector(false);
        }
      })
      .catch(console.error);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setDiscountError('');
  };

  const finalTotal = Math.max(0, total + currentDeliveryFee - discount);

  const submitOrder = async () => {
    if (!phone || !province || !address || isProvinceExcluded) return;
    setLoading(true);
    showToast('جاري إرسال الطلب...', 'success');

    let orderItems = items.map((i) => ({
      productId: i.productId,
      name: i.name,
      quantity: i.quantity,
      price: i.price,
      image: i.image,
      flavor: i.flavor,
    }));

    if (appliedCoupon?.type === 'free_product' && appliedCoupon.selectedProductId && appliedCoupon.selectedProductPrice) {
      orderItems = [
        ...orderItems,
        {
          productId: appliedCoupon.selectedProductId,
          name: appliedCoupon.selectedProductName || 'منتج مجاني',
          quantity: 1,
          price: appliedCoupon.selectedProductPrice,
          image: '',
          flavor: undefined,
        },
      ];
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || null,
          guestPhone: phone,
          items: orderItems,
          total,
          deliveryFee: currentDeliveryFee,
          discountCode: appliedCoupon?.code || discountCode || null,
          discountAmount: discount,
          finalTotal,
          phone,
          province,
          address,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (appliedCoupon?.isUserCoupon && appliedCoupon.code) {
          try {
            await fetch('/api/users/coupons', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                code: appliedCoupon.code,
                productId: appliedCoupon.selectedProductId,
              }),
            });
          } catch (e) {
            console.error('Failed to mark coupon used:', e);
          }
        }

        if (data.earnedCoupons && data.earnedCoupons.length > 0) {
          localStorage.setItem('falconpro-earned-rewards', JSON.stringify(data.earnedCoupons));
        }

        showToast('تم تأكيد الطلب بنجاح!', 'success');
        localStorage.setItem('falconpro-last-phone', phone);
        setSuccess(true);
        clearCart();
        setTimeout(() => router.push(`/${locale}/profile`), 3000);
      } else {
        showToast(data.error || 'حدث خطأ في إرسال الطلب', 'error');
      }
    } catch (error) {
      showToast('حدث خطأ في الاتصال بالسيرفر', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (items.length === 0 && !success) {
      router.push(`/${locale}/products`);
    }
  }, [items.length, success, locale, router]);

  if (items.length === 0 && !success) {
    return null;
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
          <Check className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-falcon-dark mb-2">{t('success')}</h2>
        <p className="text-gray-400">سيتم تحويلك لصفحة الطلبات...</p>
      </div>
    );
  }

  const activeUserCoupons = userCoupons.filter(
    (c) => !c.isUsed && (!c.expiresAt || new Date(c.expiresAt) > new Date())
  );

  return (
    <div className="py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-falcon-dark mb-8">{t('title')}</h1>

        <FreeProductSelector
          isOpen={showProductSelector}
          onClose={() => setShowProductSelector(false)}
          onSelect={handleProductSelect}
          categoryId={appliedCoupon?.freeProductChoice?.categoryId}
          maxValue={appliedCoupon?.freeProductChoice?.maxValue}
        />

        <div className="space-y-6">
          {/* Contact Info */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-falcon-dark mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-falcon-blue" />
              {t('contactInfo')}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-gray-600 text-sm mb-2 block">{t('phone')}</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field"
                  placeholder="07XX XXX XXXX"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 text-sm mb-2 block flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {t('province')}
                  </label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="input-field"
                  >
                    <option value="">{t('selectProvince')}</option>
                    {settings?.deliveryProvinces?.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  {isProvinceExcluded && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <X className="w-4 h-4" /> {t('excludedProvince')}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-gray-600 text-sm mb-2 block">{t('address')}</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="input-field"
                    placeholder={t('addressPlaceholder')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Coupon Section */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-falcon-dark mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-falcon-gold" />
              {t('discountCode')}
            </h2>

            {appliedCoupon ? (
              <div className="p-4 bg-falcon-bluePale/50 border border-falcon-blue/20 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-falcon-dark">{appliedCoupon.description?.ar || appliedCoupon.code}</p>
                    <p className="text-sm text-falcon-blue">
                      {appliedCoupon.type === 'percentage' && `خصم ${appliedCoupon.value}%`}
                      {appliedCoupon.type === 'fixed' && `خصم ${Number(appliedCoupon.value).toLocaleString()} د.ع`}
                      {appliedCoupon.type === 'free_delivery' && t('freeDelivery')}
                      {appliedCoupon.type === 'free_product' && appliedCoupon.selectedProductName
                        ? `${t('freeDelivery')}: ${appliedCoupon.selectedProductName}`
                        : appliedCoupon.type === 'free_product' && 'منتج مجاني'}
                    </p>
                  </div>
                  <button onClick={removeCoupon} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    placeholder={t('discountCode')}
                    className="input-field flex-1"
                  />
                  <button
                    onClick={applyDiscountCode}
                    className="px-6 py-3 bg-falcon-blue text-white font-bold rounded-xl hover:bg-falcon-blueDark transition-colors"
                  >
                    {t('apply')}
                  </button>
                </div>
                {discountError && <p className="text-red-500 text-sm mb-3">{discountError}</p>}

                {user && (
                  <div className="border-t border-gray-100 pt-4">
                    <button
                      onClick={() => setShowCoupons(!showCoupons)}
                      className="flex items-center justify-between w-full text-falcon-blue font-medium hover:text-falcon-blueDark transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Ticket className="w-5 h-5" />
                        {t('myCoupons')} ({activeUserCoupons.length})
                      </span>
                      {showCoupons ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>

                    {showCoupons && (
                      <div className="mt-3 space-y-2">
                        {activeUserCoupons.length === 0 ? (
                          <p className="text-gray-400 text-sm">{t('noActiveCoupons')}</p>
                        ) : (
                          activeUserCoupons.map((coupon) => (
                            <button
                              key={coupon.code}
                              onClick={() => applyCouponByCode(coupon.code)}
                              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-falcon-bluePale rounded-xl transition-colors text-right"
                            >
                              <div>
                                <p className="font-bold text-falcon-dark text-sm">{coupon.description?.ar || coupon.code}</p>
                                <p className="text-xs text-gray-500">
                                  {coupon.type === 'percentage' && `خصم ${coupon.value}%`}
                                  {coupon.type === 'fixed' && `خصم ${Number(coupon.value).toLocaleString()} د.ع`}
                                  {coupon.type === 'free_delivery' && t('freeDelivery')}
                                  {coupon.type === 'free_product' && 'منتج مجاني'}
                                </p>
                              </div>
                              <span className="px-2 py-1 bg-falcon-blue text-white text-xs font-bold rounded-lg">{coupon.code}</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-falcon-dark mb-4">{t('orderSummary')}</h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={`${item.productId}-${item.flavor?.name?.ar || 'default'}`} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {getLocalizedName(item.name, locale)} {item.flavor ? `(${item.flavor.name.ar})` : ''} × {item.quantity}
                  </span>
                  <span className="text-falcon-dark">{(item.price * item.quantity).toLocaleString()} د.ع</span>
                </div>
              ))}
              {appliedCoupon?.type === 'free_product' && appliedCoupon.selectedProductName && (
                <div className="flex justify-between text-sm">
                  <span className="text-falcon-gold flex items-center gap-1"><Gift className="w-4 h-4" /> {appliedCoupon.selectedProductName}</span>
                  <span className="text-emerald-600">مجاني</span>
                </div>
              )}
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('subtotal')}</span>
                <span className="text-falcon-dark">{total.toLocaleString()} د.ع</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-1">
                  <Truck className="w-4 h-4" />
                  {t('delivery')}
                </span>
                <span className={appliedCoupon?.type === 'free_delivery' ? 'text-emerald-600' : 'text-falcon-dark'}>
                  {appliedCoupon?.type === 'free_delivery' ? t('freeDelivery') : `${currentDeliveryFee.toLocaleString()} د.ع`}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('discount')}</span>
                  <span className="text-red-500">-{discount.toLocaleString()} د.ع</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold">
                <span className="text-falcon-dark">{t('finalTotal')}</span>
                <span className="text-falcon-blue">{finalTotal.toLocaleString()} د.ع</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={submitOrder}
            disabled={loading || !phone || !province || !address || isProvinceExcluded}
            className="w-full py-4 bg-falcon-blue text-white font-bold rounded-xl hover:bg-falcon-blueDark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {t('submit')}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
