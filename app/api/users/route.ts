import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { mockUsers, updateMockUser } from '@/lib/mock-data';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'falconpro-secret-key-2024';

export async function GET(req: NextRequest) {
  try {
    const adminToken = req.cookies.get('admin_token')?.value;
    if (!adminToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    jwt.verify(adminToken, JWT_SECRET);

    try {
      await dbConnect();
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      return NextResponse.json({ users });
    } catch {
      // Mock fallback - exclude passwords
      const safeUsers = mockUsers.map(({ password, ...user }) => user);
      return NextResponse.json({ users: safeUsers });
    }
  } catch (error) {
    console.error('Users GET error:', error);
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
    const { _id, isActive } = body;

    if (!_id || typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'Missing _id or isActive' }, { status: 400 });
    }

    try {
      await dbConnect();
      const user = await User.findByIdAndUpdate(_id, { isActive }, { new: true }).select('-password');
      return NextResponse.json({ success: true, user });
    } catch {
      // Mock fallback
      const updated = updateMockUser(_id, { isActive });
      if (updated) {
        const { password, ...safeUser } = updated;
        return NextResponse.json({ success: true, user: safeUser });
      }
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Users PUT error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
