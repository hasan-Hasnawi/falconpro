import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Package from '@/models/Package';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'falconpro-secret-key-2024';

let mockPackages: any[] = [];

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const packages = await Package.find({ isActive: true }).sort({ createdAt: -1 });
    return NextResponse.json({ packages });
  } catch {
    return NextResponse.json({ packages: mockPackages.filter((p) => p.isActive !== false) });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    jwt.verify(token, JWT_SECRET);

    const body = await req.json();
    const { name, description, images, products, totalOriginalPrice, finalPrice, featured } = body;

    if (!name?.ar || !products?.length) {
      return NextResponse.json({ error: 'Name and products are required' }, { status: 400 });
    }

    try {
      await dbConnect();
      const pkg = await Package.create({
        name,
        description,
        images,
        products,
        totalOriginalPrice,
        finalPrice,
        featured,
      });
      return NextResponse.json({ success: true, package: pkg });
    } catch {
      const newPkg = {
        _id: Math.random().toString(36).substring(2, 15),
        name,
        description,
        images,
        products,
        totalOriginalPrice,
        finalPrice,
        isActive: true,
        featured: !!featured,
        createdAt: new Date().toISOString(),
      };
      mockPackages.push(newPkg);
      return NextResponse.json({ success: true, package: newPkg });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    jwt.verify(token, JWT_SECRET);

    const body = await req.json();
    const { _id, ...updates } = body;

    try {
      await dbConnect();
      const pkg = await Package.findByIdAndUpdate(_id, updates, { new: true });
      return NextResponse.json({ success: true, package: pkg });
    } catch {
      const index = mockPackages.findIndex((p) => p._id === _id);
      if (index !== -1) {
        mockPackages[index] = { ...mockPackages[index], ...updates };
        return NextResponse.json({ success: true, package: mockPackages[index] });
      }
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
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

    try {
      await dbConnect();
      await Package.findByIdAndUpdate(_id, { isActive: false });
      return NextResponse.json({ success: true });
    } catch {
      const index = mockPackages.findIndex((p) => p._id === _id);
      if (index !== -1) {
        mockPackages[index].isActive = false;
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
