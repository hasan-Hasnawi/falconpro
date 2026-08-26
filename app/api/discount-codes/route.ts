import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DiscountCode from '@/models/DiscountCode';
import User from '@/models/User';
import { mockDiscountCodes, deleteMockDiscountCode, findMockUserById } from '@/lib/mock-data';
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
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (code) {
      const upperCode = code.toUpperCase();

      // First check global discount codes
      try {
        await dbConnect();
        const discount = await DiscountCode.findOne({ code: upperCode, isActive: true });
        if (discount) {
          return NextResponse.json({ discount });
        }
      } catch {
        const discount = mockDiscountCodes.find(d => d.code === upperCode && d.isActive);
        if (discount) {
          return NextResponse.json({ discount });
        }
      }

      // Then check user-specific coupons
      const decoded = getUserFromToken(req);
      if (decoded) {
        try {
          await dbConnect();
          const user = await User.findById(decoded.userId);
          if (user && user.coupons) {
            const coupon = user.coupons.find((c: any) => c.code === upperCode && !c.isUsed);
            if (coupon) {
              if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
                return NextResponse.json({ error: 'Expired code' }, { status: 404 });
              }
              // Map coupon shape to discount shape expected by checkout
              return NextResponse.json({
                discount: {
                  code: coupon.code,
                  type: coupon.type === 'fixed' ? 'fixed' : coupon.type,
                  value: coupon.value,
                  isUserCoupon: true,
                  freeProductChoice: coupon.freeProductChoice,
                  description: coupon.description,
                },
              });
            }
          }
        } catch {
          const user = findMockUserById(decoded.userId);
          if (user && user.coupons) {
            const coupon = user.coupons.find((c: any) => c.code === upperCode && !c.isUsed);
            if (coupon) {
              if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
                return NextResponse.json({ error: 'Expired code' }, { status: 404 });
              }
              return NextResponse.json({
                discount: {
                  code: coupon.code,
                  type: coupon.type === 'fixed' ? 'fixed' : coupon.type,
                  value: coupon.value,
                  isUserCoupon: true,
                  freeProductChoice: coupon.freeProductChoice,
                  description: coupon.description,
                },
              });
            }
          }
        }
      }

      return NextResponse.json({ error: 'Invalid code' }, { status: 404 });
    }

    try {
      await dbConnect();
      const codes = await DiscountCode.find().sort({ createdAt: -1 });
      return NextResponse.json({ codes });
    } catch {
      return NextResponse.json({ codes: mockDiscountCodes });
    }
  } catch (error) {
    console.error('Discount codes GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, type, value, minOrder, usageLimit, isActive } = body;

    if (!code || !type || value === undefined || value === null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['percentage', 'fixed'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    await dbConnect();

    const existing = await DiscountCode.findOne({ code: code.toUpperCase() });
    if (existing) {
      return NextResponse.json({ error: 'هذا الكود موجود بالفعل' }, { status: 409 });
    }

    const discount = await DiscountCode.create({
      code: code.toUpperCase(),
      type,
      value: Number(value),
      minOrder: Number(minOrder) || 0,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      isActive: isActive !== false,
    });

    return NextResponse.json({ success: true, discount });
  } catch (error) {
    console.error('Discount codes POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    try {
      await dbConnect();
      await DiscountCode.findByIdAndDelete(id);
      return NextResponse.json({ success: true });
    } catch {
      deleteMockDiscountCode(id);
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
