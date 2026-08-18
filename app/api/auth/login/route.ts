import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { mockUsers, findMockUserByPhone, addMockUser } from '@/lib/mock-data';

const JWT_SECRET = process.env.JWT_SECRET || 'falconpro-secret-key-2024';

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();

    let user;
    try {
      await dbConnect();
      user = await User.findOne({ phone });
    } catch {
      user = findMockUserByPhone(phone);
    }

    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    // Check mock users (plaintext) first, then bcrypt (MongoDB users)
    let isMatch = user.password === password;
    if (!isMatch) {
      try {
        isMatch = await bcrypt.compare(password, user.password);
      } catch {}
    }

    if (!isMatch) {
      return NextResponse.json({ error: 'كلمة المرور غير صحيحة' }, { status: 401 });
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
        ordersCount: user.ordersCount,
        loyaltyCycleCount: user.loyaltyCycleCount || 0,
        coupons: user.coupons || [],
      },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    if (user.isAdmin) {
      response.cookies.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
