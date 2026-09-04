import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'falconpro-secret-key-2024';

function getDateRange(period: string, from?: string, to?: string) {
  const now = new Date();
  if (from && to) {
    return { start: new Date(from), end: new Date(to + 'T23:59:59.999Z') };
  }
  switch (period) {
    case 'monthly': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start, end: now };
    }
    case 'quarterly': {
      const quarter = Math.floor(now.getMonth() / 3);
      const start = new Date(now.getFullYear(), quarter * 3, 1);
      return { start, end: now };
    }
    case 'yearly': {
      const start = new Date(now.getFullYear(), 0, 1);
      return { start, end: now };
    }
    default:
      return { start: new Date(0), end: now };
  }
}

function getMonthLabel(date: Date) {
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    jwt.verify(token, JWT_SECRET);

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'all';
    const from = searchParams.get('from') || undefined;
    const to = searchParams.get('to') || undefined;

    const { start, end } = getDateRange(period, from, to);

    await dbConnect();

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
    }).sort({ createdAt: -1 }).populate('userId', 'phone name ordersCount');

    const allOrders = orders;

    // === ORDERS SECTION ===
    const successful = allOrders.filter(o => ['confirmed', 'shipped', 'delivered'].includes(o.status));
    const cancelled = allOrders.filter(o => o.status === 'cancelled');
    const pending = allOrders.filter(o => o.status === 'pending');

    const totalRevenue = successful.reduce((sum, o) => sum + (o.finalTotal || 0), 0);
    const totalDelivery = successful.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
    const totalDiscounts = successful.reduce((sum, o) => sum + (o.discountAmount || 0), 0);
    const averageOrderValue = successful.length > 0 ? Math.round(totalRevenue / successful.length) : 0;

    // Repeat customers
    const customerPhones = new Map<string, { phone: string; name: string; ordersCount: number }>();
    allOrders.forEach(o => {
      if (o.phone) {
        const existing = customerPhones.get(o.phone);
        if (!existing) {
          customerPhones.set(o.phone, {
            phone: o.phone,
            name: o.userId?.name || o.phone,
            ordersCount: o.userId?.ordersCount || 1,
          });
        }
      }
    });
    const totalCustomers = customerPhones.size;
    const returningCustomers = Array.from(customerPhones.values()).filter(c => c.ordersCount > 1).length;
    const repeatRate = totalCustomers > 0 ? Math.round((returningCustomers / totalCustomers) * 100) : 0;

    // Top products
    const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
    successful.forEach(order => {
      order.items?.forEach((item: any) => {
        const key = item.productId?.toString() || item.name?.ar || 'unknown';
        const name = typeof item.name === 'object' ? (item.name.ar || item.name.en || '') : item.name;
        const flavorName = item.flavor?.name?.ar ? ` (${item.flavor.name.ar})` : '';
        const fullName = `${name}${flavorName}`;
        const existing = productSales.get(key);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += (item.price || 0) * item.quantity;
        } else {
          productSales.set(key, { name: fullName, quantity: item.quantity, revenue: (item.price || 0) * item.quantity });
        }
      });
    });
    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Top flavors
    const flavorSales = new Map<string, { name: string; quantity: number }>();
    successful.forEach(order => {
      order.items?.forEach((item: any) => {
        if (item.flavor?.name?.ar) {
          const key = item.flavor.name.ar;
          const existing = flavorSales.get(key);
          if (existing) {
            existing.quantity += item.quantity;
          } else {
            flavorSales.set(key, { name: item.flavor.name.ar, quantity: item.quantity });
          }
        }
      });
    });
    const topFlavors = Array.from(flavorSales.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Orders by status
    const ordersByStatus = {
      pending: pending.length,
      confirmed: allOrders.filter(o => o.status === 'confirmed').length,
      shipped: allOrders.filter(o => o.status === 'shipped').length,
      delivered: allOrders.filter(o => o.status === 'delivered').length,
      cancelled: cancelled.length,
    };

    // Orders by month
    const monthMap = new Map<string, { month: string; count: number; revenue: number; delivery: number; discounts: number }>();
    allOrders.forEach(order => {
      const date = new Date(order.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = getMonthLabel(date);
      const existing = monthMap.get(key);
      if (existing) {
        existing.count++;
        if (['confirmed', 'shipped', 'delivered'].includes(order.status)) {
          existing.revenue += order.finalTotal || 0;
          existing.delivery += order.deliveryFee || 0;
          existing.discounts += order.discountAmount || 0;
        }
      } else {
        monthMap.set(key, {
          month: label,
          count: 1,
          revenue: ['confirmed', 'shipped', 'delivered'].includes(order.status) ? (order.finalTotal || 0) : 0,
          delivery: ['confirmed', 'shipped', 'delivered'].includes(order.status) ? (order.deliveryFee || 0) : 0,
          discounts: ['confirmed', 'shipped', 'delivered'].includes(order.status) ? (order.discountAmount || 0) : 0,
        });
      }
    });
    const ordersByMonth = Array.from(monthMap.values()).reverse();

    // === REVENUE SECTION ===
    // Top categories
    const categorySales = new Map<string, { name: string; revenue: number; quantity: number }>();
    const allProducts = await Product.find({});
    const productMap = new Map<string, any>();
    allProducts.forEach(p => productMap.set(p._id.toString(), p));

    successful.forEach(order => {
      order.items?.forEach((item: any) => {
        const product = productMap.get(item.productId?.toString());
        const catName = product?.category || 'غير محدد';
        const existing = categorySales.get(catName);
        if (existing) {
          existing.revenue += (item.price || 0) * item.quantity;
          existing.quantity += item.quantity;
        } else {
          categorySales.set(catName, { name: catName, revenue: (item.price || 0) * item.quantity, quantity: item.quantity });
        }
      });
    });
    const topCategories = Array.from(categorySales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Discount code usage
    const discountUsage = new Map<string, { code: string; count: number; totalSaved: number }>();
    successful.forEach(order => {
      if (order.discountCode) {
        const existing = discountUsage.get(order.discountCode);
        if (existing) {
          existing.count++;
          existing.totalSaved += order.discountAmount || 0;
        } else {
          discountUsage.set(order.discountCode, { code: order.discountCode, count: 1, totalSaved: order.discountAmount || 0 });
        }
      }
    });
    const discountCodeUsage = Array.from(discountUsage.values())
      .sort((a, b) => b.count - a.count);

    // === PROVINCES SECTION ===
    const provinceStats = new Map<string, { province: string; orders: number; revenue: number }>();
    successful.forEach(order => {
      if (order.province) {
        const existing = provinceStats.get(order.province);
        if (existing) {
          existing.orders++;
          existing.revenue += order.finalTotal || 0;
        } else {
          provinceStats.set(order.province, { province: order.province, orders: 1, revenue: order.finalTotal || 0 });
        }
      }
    });
    const provincesByOrders = Array.from(provinceStats.values())
      .sort((a, b) => b.orders - a.orders);
    const provincesByRevenue = Array.from(provinceStats.values())
      .sort((a, b) => b.revenue - a.revenue);

    // === CUSTOMERS SECTION ===
    const customerStats = new Map<string, { phone: string; name: string; ordersCount: number; totalSpent: number }>();
    successful.forEach(order => {
      if (order.phone) {
        const existing = customerStats.get(order.phone);
        if (existing) {
          existing.ordersCount++;
          existing.totalSpent += order.finalTotal || 0;
        } else {
          customerStats.set(order.phone, {
            phone: order.phone,
            name: order.userId?.name || order.phone,
            ordersCount: 1,
            totalSpent: order.finalTotal || 0,
          });
        }
      }
    });
    const topCustomersByOrders = Array.from(customerStats.values())
      .sort((a, b) => b.ordersCount - a.ordersCount)
      .slice(0, 10);
    const topCustomersByRevenue = Array.from(customerStats.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    const guestOrders = allOrders.filter(o => !o.userId).length;
    const registeredOrders = allOrders.filter(o => !!o.userId).length;
    const newCustomers = Array.from(customerPhones.values()).filter(c => c.ordersCount === 1).length;
    const returningCustomersCount = Array.from(customerPhones.values()).filter(c => c.ordersCount > 1).length;

    // Period label
    let periodLabel = 'كل الوقت';
    if (period === 'monthly') periodLabel = 'هذا الشهر';
    else if (period === 'quarterly') periodLabel = 'هذا الربع';
    else if (period === 'yearly') periodLabel = 'هذا العام';
    else if (from && to) periodLabel = `${from} — ${to}`;

    return NextResponse.json({
      period: { from: start.toISOString(), to: end.toISOString(), label: periodLabel },
      orders: {
        total: allOrders.length,
        successful: successful.length,
        cancelled: cancelled.length,
        pending: pending.length,
        averageValue: averageOrderValue,
        repeatRate,
        topProducts,
        topFlavors,
        ordersByStatus,
        ordersByMonth,
      },
      revenue: {
        total: totalRevenue,
        totalDelivery,
        totalDiscounts,
        averageOrderValue,
        byMonth: ordersByMonth,
        topCategories,
        discountCodeUsage,
      },
      provinces: {
        topByOrders: provincesByOrders.slice(0, 10),
        topByRevenue: provincesByRevenue.slice(0, 10),
        all: provincesByOrders,
      },
      customers: {
        total: totalCustomers,
        newVsReturning: { new: newCustomers, returning: returningCustomersCount },
        topByOrders: topCustomersByOrders,
        topByRevenue: topCustomersByRevenue,
        guestOrders,
        registeredOrders,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
