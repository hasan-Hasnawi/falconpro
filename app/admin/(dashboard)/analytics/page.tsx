'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { ShoppingCart, DollarSign, TrendingUp, Users, Package, Truck, Tag, Download, Filter } from 'lucide-react';

interface AnalyticsData {
  period: { from: string; to: string; label: string };
  orders: {
    total: number;
    successful: number;
    cancelled: number;
    pending: number;
    averageValue: number;
    repeatRate: number;
    topProducts: { name: string; quantity: number; revenue: number }[];
    topFlavors: { name: string; quantity: number }[];
    ordersByStatus: { pending: number; confirmed: number; shipped: number; delivered: number; cancelled: number };
    ordersByMonth: { month: string; count: number; revenue: number; delivery: number; discounts: number }[];
  };
  revenue: {
    total: number;
    totalDelivery: number;
    totalDiscounts: number;
    averageOrderValue: number;
    byMonth: { month: string; revenue: number; delivery: number; discounts: number }[];
    topCategories: { name: string; revenue: number; quantity: number }[];
    discountCodeUsage: { code: string; count: number; totalSaved: number }[];
  };
  provinces: {
    topByOrders: { province: string; orders: number; revenue: number }[];
    topByRevenue: { province: string; revenue: number; orders: number }[];
  };
  customers: {
    total: number;
    newVsReturning: { new: number; returning: number };
    topByOrders: { phone: string; name: string; ordersCount: number; totalSpent: number }[];
    topByRevenue: { phone: string; name: string; totalSpent: number; ordersCount: number }[];
    guestOrders: number;
    registeredOrders: number;
  };
}

const COLORS = ['#1E40AF', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

const periods = [
  { value: 'all', label: 'كل الوقت' },
  { value: 'monthly', label: 'هذا الشهر' },
  { value: 'quarterly', label: 'هذا الربع' },
  { value: 'yearly', label: 'هذا العام' },
  { value: 'custom', label: 'فترة مخصصة' },
];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const loadData = (period: string, from?: string, to?: string) => {
    setLoading(true);
    let url = `/api/analytics?period=${period}`;
    if (period === 'custom' && from && to) {
      url = `/api/analytics?period=custom&from=${from}&to=${to}`;
    }
    fetch(url, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData(selectedPeriod, customFrom, customTo);
  }, [selectedPeriod]);

  useEffect(() => {
    if (selectedPeriod === 'custom' && customFrom && customTo) {
      loadData('custom', customFrom, customTo);
    }
  }, [customFrom, customTo]);

  const exportCSV = () => {
    if (!data) return;
    const headers = ['القسم', 'البيان', 'القيمة'];
    const rows: string[][] = [
      ['الطلبات', 'إجمالي الطلبات', String(data.orders.total)],
      ['الطلبات', 'طلبات ناجحة', String(data.orders.successful)],
      ['الطلبات', 'طلبات ملغية', String(data.orders.cancelled)],
      ['الطلبات', 'قيد الانتظار', String(data.orders.pending)],
      ['الطلبات', 'متوسط سعر الطلب', `${data.orders.averageValue.toLocaleString()} د.ع`],
      ['الأموال', 'إجمالي المبيعات', `${data.revenue.total.toLocaleString()} د.ع`],
      ['الأموال', 'إجمالي التوصيل', `${data.revenue.totalDelivery.toLocaleString()} د.ع`],
      ['الأموال', 'إجمالي الخصومات', `${data.revenue.totalDiscounts.toLocaleString()} د.ع`],
      ['الزبائن', 'إجمالي الزبائن', String(data.customers.total)],
      ['الزبائن', 'نسبة العائدين', `${data.customers.newVsReturning.returning}`],
    ];
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${data.period.label}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && !data) {
    return (
      <div className="space-y-8">
        <div className="h-10 bg-gray-100 rounded w-60 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="bg-white border border-gray-100 rounded-2xl h-28 animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-white border border-gray-100 rounded-2xl h-64 animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const StatCard = ({ icon: Icon, label, value, color, sub }: { icon: any; label: string; value: string; color: string; sub?: string }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-gray-500 text-sm">{label}</span>
      </div>
      <p className="text-2xl font-bold text-falcon-dark">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </motion.div>
  );

  const cancelRate = data.orders.total > 0 ? Math.round((data.orders.cancelled / data.orders.total) * 100) : 0;

  const statusData = [
    { name: 'قيد الانتظار', value: data.orders.ordersByStatus.pending },
    { name: 'مؤكد', value: data.orders.ordersByStatus.confirmed },
    { name: 'تم الشحن', value: data.orders.ordersByStatus.shipped },
    { name: 'تم التوصيل', value: data.orders.ordersByStatus.delivered },
    { name: 'ملغي', value: data.orders.ordersByStatus.cancelled },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-falcon-dark flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-falcon-gold" />
            المحاسبة والإحصائيات
          </h1>
          <p className="text-gray-400 text-sm mt-1">{data.period.label}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="input-field text-sm py-2 w-40"
            >
              {periods.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          {selectedPeriod === 'custom' && (
            <>
              <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="input-field text-sm py-2" />
              <span className="text-gray-400">—</span>
              <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="input-field text-sm py-2" />
            </>
          )}
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-falcon-blue text-white text-sm font-bold rounded-xl hover:bg-falcon-blueDark transition-colors">
            <Download className="w-4 h-4" />
            تصدير CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={ShoppingCart} label="إجمالي الطلبات" value={String(data.orders.total)} color="bg-falcon-blue" sub={`${data.orders.successful} ناجحة`} />
        <StatCard icon={DollarSign} label="إجمالي المبيعات" value={`${(data.revenue.total / 1000).toFixed(0)}K`} color="bg-emerald-500" sub={`${data.revenue.total.toLocaleString()} د.ع`} />
        <StatCard icon={TrendingUp} label="متوسط سعر الطلب" value={`${(data.orders.averageValue / 1000).toFixed(0)}K`} color="bg-falcon-gold" sub={`${data.orders.averageValue.toLocaleString()} د.ع`} />
        <StatCard icon={Tag} label="نسبة الإلغاء" value={`${cancelRate}%`} color="bg-red-500" sub={`${data.orders.cancelled} ملغية`} />
        <StatCard icon={Users} label="الزبائن" value={String(data.customers.total)} color="bg-purple-500" sub={`${data.customers.newVsReturning.new} جدد`} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-falcon-dark mb-4">المبيعات الشهرية</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.orders.ordersByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} interval={0} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => `${Number(v).toLocaleString()} د.ع`} />
                <Legend />
                <Bar dataKey="revenue" name="المبيعات" fill="#1E40AF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="delivery" name="التوصيل" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="discounts" name="الخصومات" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Order Status Donut */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-falcon-dark mb-4">حالة الطلبات</h3>
          <div className="h-72 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                  {statusData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => `${v} طلب`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 — Top Products + Provinces */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-falcon-dark mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-falcon-gold" />
            أكثر المنتجات طلباً
          </h3>
          <div className="space-y-3">
            {data.orders.topProducts.length === 0 && <p className="text-gray-400 text-sm">لا توجد بيانات بعد</p>}
            {data.orders.topProducts.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-falcon-bluePale text-falcon-blue text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-falcon-dark truncate">{p.name}</p>
                  <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                    <div className="bg-falcon-blue h-2 rounded-full" style={{ width: `${(p.quantity / (data.orders.topProducts[0]?.quantity || 1)) * 100}%` }} />
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-falcon-dark">{p.quantity}</p>
                  <p className="text-xs text-gray-400">{p.revenue.toLocaleString()} د.ع</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Provinces */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-falcon-dark mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-500" />
            أكثر المحافظات طلباً
          </h3>
          <div className="space-y-3">
            {data.provinces.topByOrders.length === 0 && <p className="text-gray-400 text-sm">لا توجد بيانات بعد</p>}
            {data.provinces.topByOrders.slice(0, 10).map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-falcon-dark">{p.province}</p>
                  <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(p.orders / (data.provinces.topByOrders[0]?.orders || 1)) * 100}%` }} />
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-falcon-dark">{p.orders} طلب</p>
                  <p className="text-xs text-gray-400">{p.revenue.toLocaleString()} د.ع</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Charts Row 3 — Customers + Discounts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-falcon-dark mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            أكثر الزبائن إنفاقاً
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-right py-2 font-medium text-gray-500">الزبون</th>
                  <th className="text-right py-2 font-medium text-gray-500">الطلبات</th>
                  <th className="text-right py-2 font-medium text-gray-500">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {data.customers.topByRevenue.length === 0 && (
                  <tr><td colSpan={3} className="text-gray-400 text-center py-4">لا توجد بيانات بعد</td></tr>
                )}
                {data.customers.topByRevenue.map((c, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                        <span className="font-bold text-falcon-dark">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-gray-600">{c.ordersCount}</td>
                    <td className="py-2.5 font-bold text-falcon-blue">{c.totalSpent.toLocaleString()} د.ع</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Discount Codes */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-falcon-dark mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-red-500" />
            تحليل الخصومات
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-red-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{data.revenue.totalDiscounts.toLocaleString()}</p>
                <p className="text-xs text-red-500">إجمالي الخصومات (د.ع)</p>
              </div>
              <div className="bg-falcon-bluePale rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-falcon-blue">{data.revenue.discountCodeUsage.length}</p>
                <p className="text-xs text-falcon-blue">أكواد الخصم المستخدمة</p>
              </div>
            </div>
            {data.revenue.discountCodeUsage.length === 0 && <p className="text-gray-400 text-sm text-center">لا توجد خصومات بعد</p>}
            {data.revenue.discountCodeUsage.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <span className="px-2 py-1 bg-falcon-blue text-white text-xs font-bold rounded-lg">{d.code}</span>
                  <span className="text-gray-500 text-xs mr-2">{d.count} استخدام</span>
                </div>
                <span className="text-sm font-bold text-red-500">-{d.totalSaved.toLocaleString()} د.ع</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top Categories */}
      {data.revenue.topCategories.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-falcon-dark mb-4">المبيعات حسب التصنيف</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {data.revenue.topCategories.map((cat, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 text-center hover:bg-falcon-bluePale/50 transition-colors">
                <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: COLORS[i % COLORS.length] + '20' }}>
                  <span className="text-lg font-bold" style={{ color: COLORS[i % COLORS.length] }}>{cat.quantity}</span>
                </div>
                <p className="text-sm font-bold text-falcon-dark truncate">{cat.name}</p>
                <p className="text-xs text-gray-400">{cat.revenue.toLocaleString()} د.ع</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
