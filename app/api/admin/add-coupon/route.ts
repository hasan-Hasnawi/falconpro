import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'falconpro-secret-key-2024';

function generateCouponCode(prefix = 'FALCON') {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${code}`;
}

export async function POST(req: NextRequest) {
  try {
    const adminToken = req.cookies.get('admin_token')?.value;
    if (!adminToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    jwt.verify(adminToken, JWT_SECRET);

    const body = await req.json();
    const { userId, couponType, couponValue, couponDescription } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const code = generateCouponCode('LOYALTY');
    const coupon = {
      code,
      type: couponType || 'free_delivery',
      value: couponValue || 0,
      description: couponDescription || { ar: 'توصيل مجاني', en: 'Free delivery' },
      freeProductChoice: { type: 'admin' },
      isUsed: false,
      usedAt: null,
      earnedAt: new Date(),
      expiresAt: null,
    };

    if (!user.coupons) {
      user.coupons = [];
    }
    user.coupons.push(coupon);
    await user.save();

    return NextResponse.json({ success: true, coupon, couponsCount: user.coupons.length });
  } catch (error) {
    console.error('Add coupon error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
