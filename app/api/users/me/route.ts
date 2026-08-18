import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { mockUsers, findMockUserById } from '@/lib/mock-data';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'falconpro-secret-key-2024';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      try {
        await dbConnect();
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ user });
      } catch {
        // Mock fallback
        const user = findMockUserById(decoded.userId);
        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        const { password, ...safeUser } = user;
        return NextResponse.json({ user: safeUser });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Users me GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
