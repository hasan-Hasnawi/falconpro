import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import Settings from '@/models/Settings';
import Product from '@/models/Product';
import { mockOrders, addMockOrder, getMockOrders, mockUsers, mockProducts } from '@/lib/mock-data';
import { sendOrderNotification } from '@/lib/telegram';
import { processLoyaltyRewards, buildLoyaltyCoupon } from '@/lib/loyalty';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'falconpro-secret-key-2024';

function validateStock(product: any, item: any): { valid: boolean; message: string } {
  if (product.isOutOfStock) {
    return { valid: false, message: `المنتج ${product.name.ar} نافذ الكمية` };
  }

  if (item.flavor) {
    const flavor = product.flavors?.find((f: any) =>
      f.name.ar === item.flavor.name.ar && f.name.en === item.flavor.name.en
    );
    if (!flavor) {
      return { valid: false, message: `النكهة المختارة غير متوفرة للمنتج ${product.name.ar}` };
    }
    if (flavor.stock < item.quantity) {
      return { valid: false, message: `الكمية المطلوبة من نكهة ${flavor.name.ar} للمنتج ${product.name.ar} غير متوفرة` };
    }
  } else {
    if ((product.stock || 0) < item.quantity) {
      return { valid: false, message: `الكمية المطلوبة من ${product.name.ar} غير متوفرة` };
    }
  }

  return { valid: true, message: '' };
}

async function validateOrderStock(items: any[], useMock: boolean) {
  const errors: string[] = [];

  for (const item of items) {
    let product;
    if (useMock) {
      product = mockProducts.find((p) => p._id === item.productId);
    } else {
      product = await Product.findById(item.productId).lean();
    }

    if (!product) {
      errors.push(`المنتج ${item.productId} غير موجود`);
      continue;
    }

    const result = validateStock(product, item);
    if (!result.valid) {
      errors.push(result.message);
    }
  }

  return errors;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, guestPhone, items, total, deliveryFee, discountCode, discountAmount, finalTotal, phone, province, address } = body;

    let orderResult: any;
    let earnedCoupons: any[] = [];

    try {
      await dbConnect();

      const stockErrors = await validateOrderStock(items, false);
      if (stockErrors.length > 0) {
        return NextResponse.json({ error: stockErrors.join(' / ') }, { status: 400 });
      }

      const order = await Order.create({
        userId: userId || null,
        guestPhone: guestPhone || null,
        items,
        total,
        deliveryFee: deliveryFee || 0,
        discountCode: discountCode || null,
        discountAmount: discountAmount || 0,
        finalTotal,
        phone,
        province,
        address,
      });
      orderResult = order;

      // Increment orders count and process loyalty
      if (userId) {
        const user = await User.findById(userId);
        if (user) {
          user.ordersCount += 1;
          await user.save();

          const settings = await Settings.findOne();
          earnedCoupons = await processLoyaltyRewards({ userId, settings });
        }
      }

      try {
        await sendOrderNotification(order);
      } catch (notifyError) {
        console.error('Telegram notification error:', notifyError);
      }

      return NextResponse.json({ success: true, order, earnedCoupons });
    } catch (dbError) {
      // Mock fallback
      const stockErrors = await validateOrderStock(items, true);
      if (stockErrors.length > 0) {
        return NextResponse.json({ error: stockErrors.join(' / ') }, { status: 400 });
      }

      const newOrder = addMockOrder({
        userId: userId || null,
        guestPhone: guestPhone || null,
        items,
        total,
        deliveryFee: deliveryFee || 0,
        discountCode: discountCode || null,
        discountAmount: discountAmount || 0,
        finalTotal,
        phone,
        province,
        address,
        status: 'pending',
      });
      orderResult = newOrder;

      if (userId) {
        const user = mockUsers.find(u => u._id === userId);
        if (user) {
          user.ordersCount += 1;

          const { mockSettings } = await import('@/lib/mock-data');
          earnedCoupons = await processLoyaltyRewards({ userId, settings: mockSettings });
        }
      }

      try {
        await sendOrderNotification(newOrder);
      } catch (notifyError) {
        console.error('Telegram notification error:', notifyError);
      }

      return NextResponse.json({ success: true, order: newOrder, earnedCoupons });
    }
  } catch (error) {
    console.error('Order POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const adminToken = req.cookies.get('admin_token')?.value;
    if (!adminToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    jwt.verify(adminToken, JWT_SECRET);
    const body = await req.json();
    const { _id, status } = body;

    if (!_id || !status) {
      return NextResponse.json({ error: 'Missing _id or status' }, { status: 400 });
    }

    try {
      await dbConnect();
      const order = await Order.findByIdAndUpdate(_id, { status }, { new: true });
      return NextResponse.json({ success: true, order });
    } catch {
      // Mock fallback
      const orderIndex = mockOrders.findIndex(o => o._id === _id);
      if (orderIndex !== -1) {
        mockOrders[orderIndex].status = status;
        return NextResponse.json({ success: true, order: mockOrders[orderIndex] });
      }
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Order PUT error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const adminToken = req.cookies.get('admin_token')?.value;

    if (adminToken) {
      try {
        jwt.verify(adminToken, JWT_SECRET);
        try {
          await dbConnect();
          const orders = await Order.find().sort({ createdAt: -1 }).populate('userId', 'phone name');
          return NextResponse.json({ orders });
        } catch {
          return NextResponse.json({ orders: mockOrders });
        }
      } catch {
        // fall through
      }
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        try {
          await dbConnect();
          const orders = await Order.find({ userId: decoded.userId }).sort({ createdAt: -1 });
          return NextResponse.json({ orders });
        } catch {
          return NextResponse.json({ orders: getMockOrders(decoded.userId) });
        }
      } catch {
        // fall through to check guestPhone
      }
    }

    // Check for guest orders by phone
    const { searchParams } = new URL(req.url);
    const guestPhone = searchParams.get('phone');
    if (guestPhone) {
      try {
        await dbConnect();
        const orders = await Order.find({ guestPhone }).sort({ createdAt: -1 });
        return NextResponse.json({ orders });
      } catch {
        return NextResponse.json({ orders: mockOrders.filter(o => o.guestPhone === guestPhone) });
      }
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
