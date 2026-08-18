import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { mockUsers, findMockUserById, markMockCouponUsed } from '@/lib/mock-data';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'falconpro-secret-key-2024';

function getUserFromToken(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      await dbConnect();
      const user = await User.findById(decoded.userId).select('coupons');
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ coupons: user.coupons || [] });
    } catch {
      const user = findMockUserById(decoded.userId);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ coupons: user.coupons || [] });
    }
  } catch (error) {
    console.error('User coupons GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { code, productId } = body;
    if (!code) {
      return NextResponse.json({ error: 'Missing coupon code' }, { status: 400 });
    }

    try {
      await dbConnect();
      const user = await User.findById(decoded.userId);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const coupon = user.coupons.find((c: any) => c.code === code);
      if (!coupon) {
        return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
      }
      if (coupon.isUsed) {
        return NextResponse.json({ error: 'Coupon already used' }, { status: 400 });
      }
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return NextResponse.json({ error: 'Coupon expired' }, { status: 400 });
      }

      // If user-choice free product, set the selected productId
      if (coupon.type === 'free_product' && coupon.freeProductChoice?.type === 'user' && productId) {
        coupon.freeProductChoice.productId = productId;
      }

      coupon.isUsed = true;
      coupon.usedAt = new Date();
      await user.save();

      return NextResponse.json({ success: true, coupon });
    } catch {
      const user = findMockUserById(decoded.userId);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const coupon = user.coupons.find((c: any) => c.code === code);
      if (!coupon) {
        return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
      }
      if (coupon.isUsed) {
        return NextResponse.json({ error: 'Coupon already used' }, { status: 400 });
      }
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return NextResponse.json({ error: 'Coupon expired' }, { status: 400 });
      }

      if (coupon.type === 'free_product' && coupon.freeProductChoice?.type === 'user' && productId) {
        coupon.freeProductChoice.productId = productId;
      }

      markMockCouponUsed(decoded.userId, code);
      return NextResponse.json({ success: true, coupon });
    }
  } catch (error) {
    console.error('User coupons POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
