'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Package, Truck, CheckCircle, XCircle, Clock, Eye, Search, Calendar, Filter,
  ArrowUpRight, TrendingUp, ShoppingBag
} from 'lucide-react';

interface Order {
  _id: string;
  userId?: { phone: string; name: string };
  guestPhone?: string;
  items: { name: string; quantity: number; price: number }[];
  finalTotal: number;
  status: string;
  phone: string;
  province: string;
  address: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string; border: string; next?: string }> = {
  pending: { 
    label: 'قيد الانتظار', 
    icon: <Clock className="w-4 h-4" />, 
    color: 'text-yellow-600', 
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    next: 'confirmed' 
  },
  confirmed: { 
    label: 'تم التأكيد', 
    icon: <CheckCircle className="w-4 h-4" />, 
    color: 'text-blue-600', 
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    next: 'shipped' 
  },
  shipped: { 
    label: 'تم الشحن', 
    icon: <Truck className="w-4 h-4" />, 
    color: 'text-indigo-600', 
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    next: 'delivered' 
  },
  delivered: { 
    label: 'تم التوصيل', 
    icon: <Package className="w-4 h-4" />, 
    color: 'text-emerald-600', 
    bg: 'bg-emerald-50',
    border: 'border-emerald-200'
  },
  cancelled: { 
    label: 'ملغي', 
    icon: <XCircle className="w-4 h-4" />, 
    color: 'text-red-600', 
    bg: 'bg-red-50',
    border: 'border-red-200'
  },
};

const statusTabs = [
  { key: 'all', label: 'الكل', icon: <ShoppingBag className="w-4 h-4" /> },
  { key: 'pending', label: 'قيد الانتظار', icon: <Clock className="w-4 h-4" /> },
  { key: 'confirmed', label: 'تم التأكيد', icon: <CheckCircle className="w-4 h-4" /> },
  { key: 'shipped', label: 'تم الشحن', icon: <Truck className="w-4 h-4" /> },
  { key: 'delivered', label: 'تم التوصيل', icon: <Package className="w-4 h-4" /> },
  { key: 'cancelled', label: 'ملغي', icon: <XCircle className="w-4 h-4" /> },
];

const dateFilters = [
  { key: 'all', label: 'كل الأوقات' },
  { key: 'today', label: 'اليوم' },
  { key: 'week', label: 'هذا الأسبوع' },
  { key: 'month', label: 'هذا الشهر' },
];

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(console.error);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    const res = await fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: orderId, status: newStatus }),
    });
    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    }
  };

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (activeTab !== 'all') {
      result = result.filter((o) => o.status === activeTab);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      result = result.filter((o) => {
        const orderDate = new Date(o.createdAt);
        switch (dateFilter) {
          case 'today':
            return orderDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return orderDate >= weekAgo;
          case 'month':
            return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.phone.includes(q) ||
          o.province.toLowerCase().includes(q) ||
          o.items.some((i) => i.name.toLowerCase().includes(q))
      );
    }

    return result;
  }, [orders, activeTab, dateFilter, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      confirmed: orders.filter((o) => o.status === 'confirmed').length,
      shipped: orders.filter((o) => o.status === 'shipped').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
    };
  }, [orders]);

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-falcon-dark">الطلبات</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm animate-pulse">
              <div className="h-8 bg-gray-100 rounded w-16 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-24" />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 animate-pulse space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-6 bg-gray-100 rounded w-32" />
                <div className="h-8 bg-gray-100 rounded w-24" />
              </div>
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-falcon-dark">الطلبات</h1>
        <span className="text-gray-400 text-sm">{filteredOrders.length} طلب</span>
      </div>

      {/* Stats Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statusTabs.map((tab, index) => (
          <motion.button
            key={tab.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setActiveTab(tab.key)}
            className={`p-4 rounded-2xl text-center transition-all duration-200 border ${
              activeTab === tab.key 
                ? 'bg-falcon-blue text-white border-falcon-blue shadow-lg shadow-falcon-blue/25' 
                : 'bg-white text-gray-600 border-gray-100 hover:border-falcon-blue/30 hover:shadow-md'
            }`}
          >
            <div className={`flex items-center justify-center gap-2 mb-2 ${activeTab === tab.key ? 'text-white' : 'text-gray-400'}`}>
              {tab.icon}
              <span className="text-2xl font-bold">
                {tab.key === 'all' ? stats.total : stats[tab.key as keyof typeof stats] || 0}
              </span>
            </div>
            <span className="text-sm font-medium">{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="بحث برقم الهاتف، المحافظة، أو المنتج..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-falcon-dark placeholder-gray-400 focus:outline-none focus:border-falcon-blue focus:ring-2 focus:ring-falcon-blue/20 transition-all"
            />
          </div>
          
          {/* Date Filters */}
          <div className="flex gap-2 flex-wrap">
            {dateFilters.map((df) => (
              <button
                key={df.key}
                onClick={() => setDateFilter(df.key)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  dateFilter === df.key 
                    ? 'bg-falcon-gold text-falcon-dark shadow-md' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Calendar className="w-4 h-4 inline-block ml-1" />
                {df.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white border border-gray-100 rounded-2xl"
          >
            <Filter className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">لا توجد طلبات مطابقة للفلاتر</p>
          </motion.div>
        ) : (
          filteredOrders.map((order, i) => {
            const config = statusConfig[order.status] || statusConfig.pending;
            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-falcon-blue/20 transition-all duration-300 overflow-hidden"
              >
                {/* Status Bar */}
                <div className={`h-1 ${config.bg.replace('bg-', 'bg-gradient-to-r from-').replace('50', '400').replace('yellow-400', 'yellow-300')} to-white`} />
                
                <div className="p-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        onClick={() => router.push(`/admin/orders/${order._id}`)}
                        className="text-falcon-blue hover:text-falcon-blueDark font-bold flex items-center gap-1.5 text-lg hover:underline transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                        #{order._id.slice(-6)}
                      </button>
                      <span className="text-falcon-dark font-semibold">{order.phone}</span>
                      <span className="text-gray-500 text-sm bg-gray-100 px-2 py-1 rounded-lg">{order.province}</span>
                      <span className="text-gray-400 text-sm flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(order.createdAt).toLocaleDateString('ar-IQ')}
                      </span>
                    </div>
                    
                    <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border ${config.bg} ${config.color} ${config.border}`}>
                      {config.icon}
                      {config.label}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="space-y-2 mb-4 p-4 bg-gray-50 rounded-xl">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-falcon-dark font-medium">{item.name} × {item.quantity}</span>
                        <span className="text-gray-500">{(item.price * item.quantity).toLocaleString()} د.ع</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-gray-100 gap-4">
                    {/* Status Actions */}
                    <div className="flex gap-2 flex-wrap">
                      {config.next && (
                        <button
                          onClick={() => updateStatus(order._id, config.next!)}
                          className="px-4 py-2 bg-falcon-blue text-white text-sm font-bold rounded-xl hover:bg-falcon-blueDark transition-all shadow-md shadow-falcon-blue/20 flex items-center gap-1.5"
                        >
                          {statusConfig[config.next].icon}
                          تحديث لـ {statusConfig[config.next].label}
                        </button>
                      )}
                      {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <button
                          onClick={() => updateStatus(order._id, 'cancelled')}
                          className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-xl hover:bg-red-100 transition-all border border-red-200 flex items-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" />
                          إلغاء
                        </button>
                      )}
                      {(order.status === 'cancelled' || order.status === 'delivered') && (
                        <button
                          onClick={() => updateStatus(order._id, 'pending')}
                          className="px-4 py-2 bg-yellow-50 text-yellow-600 text-sm font-medium rounded-xl hover:bg-yellow-100 transition-all border border-yellow-200 flex items-center gap-1.5"
                        >
                          <Clock className="w-4 h-4" />
                          إعادة فتح
                        </button>
                      )}
                    </div>

                    {/* Total */}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">المجموع:</span>
                      <span className="text-falcon-blue font-bold text-2xl">{order.finalTotal.toLocaleString()} <span className="text-sm">د.ع</span></span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
