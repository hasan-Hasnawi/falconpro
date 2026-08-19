import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'falconpro-secret-key-2024';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value || req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    jwt.verify(token, JWT_SECRET);

    const { phone, password } = await req.json();
    if (!phone?.trim() || !password?.trim()) {
      return NextResponse.json({ error: 'Phone and password required' }, { status: 400 });
    }

    await dbConnect();
    const hash = await bcrypt.hash(password, 10);
    const user = await User.findOneAndUpdate(
      { phone: phone.trim() },
      {
        $set: {
          phone: phone.trim(),
          password: hash,
          name: 'Admin',
          isAdmin: true,
          isActive: true,
        },
        $setOnInsert: {
          addresses: [],
          ordersCount: 0,
          loyaltyCycleCount: 0,
          coupons: [],
          createdAt: new Date(),
        },
      },
      { upsert: true, new: true }
    ).select('-password');

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Make admin error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}