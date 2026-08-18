import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { mockUsers, findMockUserByPhone, addMockUser } from '@/lib/mock-data';

const JWT_SECRET = process.env.JWT_SECRET || 'falconpro-secret-key-2024';

export async function POST(req: NextRequest) {
  try {
    const { phone, password, name } = await req.json();

    if (!phone || !password || password.length < 4) {
      return NextResponse.json(
        { error: 'رقم الهاتف وكلمة المرور (4 أحرف على الأقل) مطلوبة' },
        { status: 400 }
      );
    }

    let existing;
    try {
      await dbConnect();
      existing = await User.findOne({ phone });
    } catch {
      existing = findMockUserByPhone(phone);
    }

    if (existing) {
      return NextResponse.json({ error: 'هذا الرقم مسجل مسبقاً' }, { status: 409 });
    }

    let user;
    try {
      await dbConnect();
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({
        phone,
        password: hashedPassword,
        name: name || '',
      });
    } catch {
      user = addMockUser({
        phone,
        password,
        name: name || '',
      });
    }

    const token = jwt.sign(
      { userId: user._id, phone: user.phone, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        isAdmin: user.isAdmin,
        ordersCount: 0,
        loyaltyCycleCount: 0,
        coupons: [],
      },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
