'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Printer, Phone, MapPin, User, Calendar, 
  Package, Truck, CheckCircle, Clock, XCircle, CreditCard,
  TrendingUp
} from 'lucide-react';
import Image from 'next/image';
import { getLocalizedName } from '@/lib/utils';

interface Order {
  _id: string;
  phone: string;
  province: string;
  address: string;
  status: string;
  items: Array<{
    productId: string;
    name: any;
    price: number;
    quantity: number;
    image?: string;
  }>;
  total: number;
  deliveryFee: number;
  discountAmount: number;
  finalTotal: number;
  discountCode?: string;
  createdAt: string;
}

const statusConfig = {
  pending: { label: 'قيد الانتظار', color: 'bg-yellow-50 text-yellow-600 border-yellow-200', icon: <Clock className="w-5 h-5" /> },
  confirmed: { label: 'تم التأكيد', color: 'bg-blue-50 text-falcon-blue border-blue-200', icon: <CheckCircle className="w-5 h-5" /> },
  shipped: { label: 'تم الشحن', color: 'bg-indigo-50 text-indigo-600 border-indigo-200', icon: <Truck className="w-5 h-5" /> },
  delivered: { label: 'تم التوصيل', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: <Package className="w-5 h-5" /> },
  cancelled: { label: 'ملغى', color: 'bg-red-50 text-red-500 border-red-200', icon: <XCircle className="w-5 h-5" /> },
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      const found = data.orders?.find((o: any) => o._id === orderId);
      setOrder(found || null);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!order || updating) return;
    setUpdating(true);
    
    const res = await fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: order._id, status: newStatus }),
    });

    if (res.ok) {
      loadOrder();
    }
    setUpdating(false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-falcon-blue/30 border-t-falcon-blue rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Package className="w-16 h-16 text-gray-200 mb-4" />
        <h1 className="text-2xl font-bold text-falcon-dark mb-4">الطلب غير موجود</h1>
        <button 
          onClick={() => router.push('/admin/orders')}
          className="flex items-center gap-2 px-6 py-3 bg-falcon-blue text-white rounded-xl hover:bg-falcon-blueDark transition-all shadow-lg shadow-falcon-blue/25"
        >
          <ArrowRight className="w-5 h-5" />
          العودة للطلبات
        </button>
      </div>
    );
  }

  const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
  const orderDate = new Date(order.createdAt).toLocaleDateString('ar-IQ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/admin/orders')}
            className="flex items-center gap-2 text-gray-500 hover:text-falcon-blue transition-colors font-medium"
          >
            <ArrowRight className="w-5 h-5" />
            العودة
          </button>
          <h1 className="text-3xl font-bold text-falcon-dark">
            طلب #{order._id.slice(-6)}
          </h1>
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border ${status.color}`}>
            {status.icon}
            {status.label}
          </span>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-falcon-dark rounded-xl hover:bg-gray-200 transition-all font-medium"
        >
          <Printer className="w-5 h-5" />
          طباعة
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Products */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="h-1 bg-gradient-to-r from-falcon-blue to-falcon-blueLight" />
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-falcon-dark flex items-center gap-2">
                <Package className="w-6 h-6 text-falcon-blue" />
                المنتجات
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-falcon-bluePale/50 text-falcon-dark text-sm">
                    <th className="text-right py-4 px-6 font-medium">المنتج</th>
                    <th className="text-center py-4 px-6 font-medium">الكمية</th>
                    <th className="text-center py-4 px-6 font-medium">السعر</th>
                    <th className="text-left py-4 px-6 font-medium">المجموع</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <motion.tr 
                      key={index} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-50 hover:bg-falcon-bluePale/30 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100">
                            <Image 
                              src={item.image || 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=100&q=80'} 
                              alt={getLocalizedName(item.name)}
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          </div>
                          <span className="text-falcon-dark font-medium">{getLocalizedName(item.name)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center text-gray-600 font-bold">{item.quantity}</td>
                      <td className="py-4 px-6 text-center text-gray-600">{item.price.toLocaleString()} د.ع</td>
                      <td className="py-4 px-6 text-left text-falcon-dark font-bold">
                        {(item.price * item.quantity).toLocaleString()} د.ع
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Customer Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="h-1 bg-gradient-to-r from-falcon-gold to-falcon-goldLight" />
            <div className="p-6">
              <h2 className="text-xl font-bold text-falcon-dark mb-6 flex items-center gap-2">
                <User className="w-6 h-6 text-falcon-gold" />
                معلومات العميل
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-falcon-bluePale flex items-center justify-center">
                    <Phone className="w-6 h-6 text-falcon-blue" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">رقم الهاتف</p>
                    <p className="text-falcon-dark font-bold text-lg">{order.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-falcon-bluePale flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-falcon-blue" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">المحافظة</p>
                    <p className="text-falcon-dark font-bold text-lg">{order.province}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:col-span-2">
                  <div className="w-14 h-14 rounded-2xl bg-falcon-bluePale flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-falcon-blue" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">العنوان</p>
                    <p className="text-falcon-dark font-bold text-lg">{order.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Order Summary */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="h-1 bg-gradient-to-r from-falcon-blue to-falcon-blueLight" />
            <div className="p-6">
              <h2 className="text-xl font-bold text-falcon-dark mb-6 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-falcon-blue" />
                ملخص الطلب
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">المجموع الفرعي</span>
                  <span className="text-falcon-dark font-medium">{order.total.toLocaleString()} د.ع</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">خصم {order.discountCode && `(${order.discountCode})`}</span>
                    <span className="text-red-500 font-bold">-{order.discountAmount.toLocaleString()} د.ع</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">التوصيل</span>
                  <span className={order.deliveryFee > 0 ? 'text-falcon-dark font-medium' : 'text-emerald-600 font-bold'}>
                    {order.deliveryFee > 0 ? `${order.deliveryFee.toLocaleString()} د.ع` : 'مجاني'}
                  </span>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-falcon-dark font-bold text-lg">المجموع النهائي</span>
                    <span className="text-falcon-blue font-bold text-2xl">{order.finalTotal.toLocaleString()} <span className="text-sm">د.ع</span></span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Order Date */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="h-1 bg-gradient-to-r from-falcon-gold to-falcon-goldLight" />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-falcon-gold/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-falcon-gold" />
                </div>
                <div>
                  <h2 className="font-bold text-falcon-dark">تاريخ الطلب</h2>
                  <p className="text-gray-500 text-sm">{orderDate}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Status Update */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-500" />
            <div className="p-6">
              <h2 className="text-xl font-bold text-falcon-dark mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
                تحديث الحالة
              </h2>
              <select
                value={order.status}
                onChange={(e) => updateStatus(e.target.value)}
                disabled={updating}
                className="input-field w-full disabled:opacity-50"
              >
                <option value="pending">قيد الانتظار</option>
                <option value="confirmed">تم التأكيد</option>
                <option value="shipped">تم الشحن</option>
                <option value="delivered">تم التوصيل</option>
                <option value="cancelled">ملغى</option>
              </select>
              {updating && (
                <div className="flex items-center gap-2 mt-4 text-falcon-blue text-sm font-medium">
                  <div className="w-5 h-5 border-2 border-falcon-blue/30 border-t-falcon-blue rounded-full animate-spin" />
                  جاري التحديث...
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
