import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import jwt from 'jsonwebtoken';
import { mockProducts } from '@/lib/mock-data';

const JWT_SECRET = process.env.JWT_SECRET || 'falconpro-secret-key-2024';

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    jwt.verify(token, JWT_SECRET);

    const body = await req.json();
    const { _id, ...updates } = body;

    if (!_id) return NextResponse.json({ error: 'Missing _id' }, { status: 400 });

    try {
      await dbConnect();
      const product = await Product.findByIdAndUpdate(_id, updates, { new: true });
      return NextResponse.json({ success: true, product });
    } catch {
      const index = mockProducts.findIndex(p => p._id === _id);
      if (index !== -1) {
        mockProducts[index] = { ...mockProducts[index], ...updates };
        return NextResponse.json({ success: true, product: mockProducts[index] });
      }
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    jwt.verify(token, JWT_SECRET);

    const { searchParams } = new URL(req.url);
    const _id = searchParams.get('id');
    if (!_id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    try {
      await dbConnect();
      await Product.findByIdAndDelete(_id);
      return NextResponse.json({ success: true });
    } catch {
      const index = mockProducts.findIndex(p => p._id === _id);
      if (index !== -1) {
        mockProducts.splice(index, 1);
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
