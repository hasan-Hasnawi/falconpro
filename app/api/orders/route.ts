import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import Settings from '@/models/Settings';
import Product from '@/models/Product';
import { sendOrderNotification } from '@/lib/telegram';
import { processLoyaltyRewards } from '@/lib/loyalty';
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

async function validateOrderStock(items: any[]) {
  const errors: string[] = [];

  for (const item of items) {
    const product = await Product.findById(item.productId).lean();

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

    await dbConnect();

    const stockErrors = await validateOrderStock(items);
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

    // Increment orders count and process loyalty
    let earnedCoupons: any[] = [];
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

    await dbConnect();
    const order = await Order.findByIdAndUpdate(_id, { status }, { new: true });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, order });
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
        await dbConnect();
        const orders = await Order.find().sort({ createdAt: -1 }).populate('userId', 'phone name');
        return NextResponse.json({ orders });
      } catch {
        // fall through
      }
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        await dbConnect();
        const orders = await Order.find({ userId: decoded.userId }).sort({ createdAt: -1 });
        return NextResponse.json({ orders });
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
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
