'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  recentOrders: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/orders').then((r) => r.json()),
    ])
      .then(([products, orders]) => {
        const ordersList = orders.orders || [];
        const revenue = ordersList.reduce((sum: number, o: any) => sum + (o.finalTotal || 0), 0);
        setStats({
          totalProducts: (products.products || []).length,
          totalOrders: ordersList.length,
          totalUsers: (ordersList as any[]).map(o => o.phone).filter((v, i, a) => a.indexOf(v) === i).length,
          totalRevenue: revenue,
          recentOrders: ordersList.slice(0, 5),
        });
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const cards = [
    { 
      label: 'المنتجات', 
      value: stats?.totalProducts || 0, 
      icon: <Package className="w-6 h-6" />, 
      gradient: 'from-falcon-blue to-falcon-blueLight',
      iconBg: 'bg-blue-100',
      iconColor: 'text-falcon-blue',
      link: '/admin/products'
    },
    { 
      label: 'الطلبات', 
      value: stats?.totalOrders || 0, 
      icon: <ShoppingCart className="w-6 h-6" />, 
      gradient: 'from-falcon-gold to-falcon-goldLight',
      iconBg: 'bg-amber-100',
      iconColor: 'text-falcon-gold',
      link: '/admin/orders'
    },
    { 
      label: 'المستخدمين', 
      value: stats?.totalUsers || 0, 
      icon: <Users className="w-6 h-6" />, 
      gradient: 'from-emerald-400 to-emerald-500',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      link: '/admin/users'
    },
    { 
      label: 'الإيرادات', 
      value: `${(stats?.totalRevenue || 0).toLocaleString()} د.ع`, 
      icon: <DollarSign className="w-6 h-6" />, 
      gradient: 'from-purple-400 to-purple-500',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      link: '/admin/orders'
    },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-falcon-dark">لوحة التحكم</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gray-100" />
                <ArrowUpRight className="w-5 h-5 text-gray-200" />
              </div>
              <div className="h-10 bg-gray-100 rounded w-20 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-24" />
            </div>
          ))}
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="h-8 bg-gray-100 rounded w-40" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-50">
              <div className="h-4 bg-gray-100 rounded w-16" />
              <div className="h-4 bg-gray-100 rounded w-32" />
              <div className="h-4 bg-gray-100 rounded w-24" />
              <div className="h-4 bg-gray-100 rounded w-20 mr-auto" />
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
        <h1 className="text-3xl font-bold text-falcon-dark">لوحة التحكم</h1>
        <span className="text-gray-400 text-sm">{new Date().toLocaleDateString('ar-IQ')}</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.1 }}
            className="group relative bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg hover:shadow-falcon-blue/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            {/* Top gradient line */}
            <div className={`h-1 bg-gradient-to-r ${card.gradient}`} />
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl ${card.iconBg} ${card.iconColor} flex items-center justify-center`}>
                  {card.icon}
                </div>
                <Link href={card.link} className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-5 h-5 text-gray-400 hover:text-falcon-blue" />
                </Link>
              </div>
              <p className="text-3xl font-bold text-falcon-dark mb-1">{card.value}</p>
              <p className="text-gray-400 text-sm">{card.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.4 }}
        className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-falcon-dark">آخر الطلبات</h2>
          <Link href="/admin/orders" className="text-falcon-blue text-sm font-medium hover:underline flex items-center gap-1">
            عرض الكل
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-falcon-bluePale/50 text-falcon-dark text-sm">
                <th className="text-right py-4 px-6 font-medium">#</th>
                <th className="text-right py-4 px-6 font-medium">الهاتف</th>
                <th className="text-right py-4 px-6 font-medium">المحافظة</th>
                <th className="text-right py-4 px-6 font-medium">المجموع</th>
                <th className="text-right py-4 px-6 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders.map((order, index) => (
                <tr 
                  key={order._id} 
                  className="border-b border-gray-50 text-sm hover:bg-falcon-bluePale/30 transition-colors"
                >
                  <td className="py-4 px-6 text-gray-400 font-medium">#{order._id.slice(-6)}</td>
                  <td className="py-4 px-6 text-falcon-dark font-medium">{order.phone}</td>
                  <td className="py-4 px-6 text-gray-500">{order.province}</td>
                  <td className="py-4 px-6 text-falcon-blue font-bold">{order.finalTotal.toLocaleString()} د.ع</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${
                      order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' : 
                      order.status === 'pending' ? 'bg-yellow-50 text-yellow-600' : 
                      order.status === 'cancelled' ? 'bg-red-50 text-red-500' :
                      'bg-blue-50 text-falcon-blue'
                    }`}>
                      {order.status === 'delivered' && <TrendingUp className="w-3 h-3" />}
                      {order.status === 'pending' && <div className="w-2 h-2 rounded-full bg-yellow-500" />}
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
