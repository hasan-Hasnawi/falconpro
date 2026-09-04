'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ToastProvider } from '@/components/ui/Toast';
import {
  LayoutDashboard, Package, Layers, ShoppingCart, Tag, Settings, LogOut, Menu, X, Users, Gift, TrendingUp,
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'الرئيسية', icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: '/admin/orders', label: 'الطلبات', icon: <ShoppingCart className="w-5 h-5" /> },
  { href: '/admin/products', label: 'المنتجات', icon: <Package className="w-5 h-5" /> },
  { href: '/admin/categories', label: 'الأقسام', icon: <Layers className="w-5 h-5" /> },
  { href: '/admin/packages', label: 'البكجات', icon: <Gift className="w-5 h-5" /> },
  { href: '/admin/users', label: 'المستخدمين', icon: <Users className="w-5 h-5" /> },
  { href: '/admin/discount-codes', label: 'أكواد الخصم', icon: <Tag className="w-5 h-5" /> },
  { href: '/admin/loyalty', label: 'كرت الولاء', icon: <Gift className="w-5 h-5" /> },
  { href: '/admin/analytics', label: 'المحاسبة والإحصائيات', icon: <TrendingUp className="w-5 h-5" /> },
  { href: '/admin/settings', label: 'الإعدادات', icon: <Settings className="w-5 h-5" /> },
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true); // Assume admin initially, check in background

  useEffect(() => {
    fetch('/api/auth/verify')
      .then((r) => r.json())
      .then((data) => {
        if (!data.user?.isAdmin) {
          router.push('/admin/login');
        }
      })
      .catch(() => {
        // Silent fail - middleware will catch unauthorized access
      });
  }, [router]);

  const logout = () => {
    document.cookie = 'admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-falcon-bluePale via-white to-falcon-bluePale">
      {/* Desktop Sidebar */}
      <aside 
        className="hidden lg:flex flex-col bg-white border-l border-gray-200 shadow-lg fixed right-0 top-0 bottom-0 z-40"
        style={{ width: '256px' }}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative rounded-full bg-falcon-bluePale p-1 flex-shrink-0">
              <Image 
                src="/images/falconpro-logo.png" 
                alt="FalconPro" 
                width={32} 
                height={32}
                className="object-contain"
              />
            </div>
            <div>
              <span className="font-bold text-falcon-dark text-sm block">FalconPro</span>
              <span className="text-falcon-gold text-xs">Admin</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className="flex items-center gap-3 px-3 py-2.5 text-falcon-dark/70 hover:text-falcon-blue hover:bg-falcon-blue/10 rounded-xl transition-all text-sm"
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-100">
          <button 
            onClick={logout} 
            className="flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all w-full text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div 
        className="lg:hidden fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between h-14"
        style={{ background: 'linear-gradient(to right, #1E4DB8, #163A8C, #1E4DB8)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 relative rounded-full bg-white/20 p-0.5 flex-shrink-0">
            <Image 
              src="/images/falconpro-logo.png" 
              alt="FalconPro" 
              width={28} 
              height={28}
              className="object-contain"
            />
          </div>
          <span className="text-white font-bold text-sm">FalconPro <span style={{ color: '#D4A843' }} className="text-xs">Admin</span></span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white p-1">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed top-14 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-lg p-3 space-y-1">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              onClick={() => setMobileOpen(false)} 
              className="flex items-center gap-3 px-3 py-2.5 text-falcon-dark/70 hover:text-falcon-blue hover:bg-falcon-blue/10 rounded-xl transition-all text-sm"
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
          <button 
            onClick={() => { setMobileOpen(false); logout(); }} 
            className="flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all w-full text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">تسجيل الخروج</span>
          </button>
        </div>
      )}

      {/* Main Content */}
      <ToastProvider>
        <main 
          className="min-h-screen p-4 sm:p-6 pt-20 lg:pt-6"
          style={{ marginRight: '256px' }}
        >
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </ToastProvider>
    </div>
  );
}
