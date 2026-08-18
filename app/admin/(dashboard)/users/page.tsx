'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserX, Phone, Shield, Calendar, ToggleLeft, ToggleRight, Search, TrendingUp } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  phone: string;
  isAdmin: boolean;
  isActive: boolean;
  ordersCount: number;
  createdAt: string;
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    const user = users.find(u => u._id === userId);
    if (user?.phone === '07701234567') {
      alert('لا يمكن حظر حساب الأدمن الرئيسي');
      return;
    }

    const res = await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: userId, isActive: !currentStatus }),
    });

    if (res.ok) {
      loadUsers();
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone?.includes(searchQuery)
  );

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const blockedUsers = users.filter(u => !u.isActive).length;

  const stats = [
    { 
      label: 'إجمالي المستخدمين', 
      value: totalUsers, 
      icon: <Users className="w-6 h-6" />, 
      gradient: 'from-falcon-blue to-falcon-blueLight',
      iconBg: 'bg-blue-100',
      iconColor: 'text-falcon-blue'
    },
    { 
      label: 'النشطين', 
      value: activeUsers, 
      icon: <UserCheck className="w-6 h-6" />, 
      gradient: 'from-emerald-400 to-emerald-500',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600'
    },
    { 
      label: 'المحظورين', 
      value: blockedUsers, 
      icon: <UserX className="w-6 h-6" />, 
      gradient: 'from-red-400 to-red-500',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-500'
    },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-falcon-dark">إدارة المستخدمين</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm animate-pulse">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 mb-4" />
              <div className="h-8 bg-gray-100 rounded w-16 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-24" />
            </div>
          ))}
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden animate-pulse h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-falcon-dark">إدارة المستخدمين</h1>
          <p className="text-gray-400 text-sm mt-1">{totalUsers} مستخدم</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg hover:shadow-falcon-blue/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div className={`h-1 bg-gradient-to-r ${stat.gradient}`} />
            <div className="p-6">
              <div className={`w-14 h-14 rounded-2xl ${stat.iconBg} ${stat.iconColor} flex items-center justify-center mb-4`}>
                {stat.icon}
              </div>
              <p className="text-3xl font-bold text-falcon-dark mb-1">{stat.value}</p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="بحث بالاسم أو رقم الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-falcon-dark placeholder-gray-400 focus:outline-none focus:border-falcon-blue focus:ring-2 focus:ring-falcon-blue/20 transition-all"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-falcon-bluePale/50 text-falcon-dark text-sm">
                <th className="text-right py-4 px-6 font-medium">الاسم</th>
                <th className="text-right py-4 px-6 font-medium">الهاتف</th>
                <th className="text-right py-4 px-6 font-medium">النوع</th>
                <th className="text-right py-4 px-6 font-medium">الطلبات</th>
                <th className="text-right py-4 px-6 font-medium">الحالة</th>
                <th className="text-right py-4 px-6 font-medium">تاريخ التسجيل</th>
                <th className="text-right py-4 px-6 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p>لا يوجد مستخدمين مطابقين للبحث</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-gray-50 hover:bg-falcon-bluePale/30 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-falcon-blue to-falcon-blueLight flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <span className="text-falcon-dark font-medium">{user.name || 'مستخدم'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {user.phone}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold ${
                        user.isAdmin 
                          ? 'bg-purple-50 text-purple-600 border border-purple-200' 
                          : 'bg-blue-50 text-falcon-blue border border-blue-200'
                      }`}>
                        <Shield className="w-3 h-3" />
                        {user.isAdmin ? 'أدمن' : 'عميل'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-falcon-dark font-bold">
                      {user.ordersCount || 0}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold ${
                        user.isActive 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                          : 'bg-red-50 text-red-500 border border-red-200'
                      }`}>
                        {user.isActive ? <TrendingUp className="w-3 h-3" /> : <div className="w-2 h-2 rounded-full bg-red-500" />}
                        {user.isActive ? 'نشط' : 'محظور'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-400 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(user.createdAt).toLocaleDateString('ar-IQ')}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => toggleUserStatus(user._id, user.isActive)}
                        className={`p-2 rounded-xl transition-all ${
                          user.isActive 
                            ? 'text-emerald-500 hover:bg-emerald-50 hover:shadow-md' 
                            : 'text-red-500 hover:bg-red-50 hover:shadow-md'
                        }`}
                        title={user.isActive ? 'حظر المستخدم' : 'تفعيل المستخدم'}
                      >
                        {user.isActive ? (
                          <ToggleRight className="w-6 h-6" />
                        ) : (
                          <ToggleLeft className="w-6 h-6" />
                        )}
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
