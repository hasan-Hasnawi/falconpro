import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { mockUsers, findMockUserByPhone } from '@/lib/mock-data';

const JWT_SECRET = process.env.JWT_SECRET || 'falconpro-secret-key-2024';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    let user;
    try {
      await dbConnect();
      user = await User.findById(decoded.userId).select('-password');
    } catch {
      user = mockUsers.find(u => u._id === decoded.userId);
    }

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        isAdmin: user.isAdmin,
        ordersCount: user.ordersCount,
        loyaltyCycleCount: user.loyaltyCycleCount || 0,
        coupons: user.coupons || [],
      },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
