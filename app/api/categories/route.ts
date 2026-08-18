import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import jwt from 'jsonwebtoken';
import { mockCategories, deleteMockCategory } from '@/lib/mock-data';

const JWT_SECRET = process.env.JWT_SECRET || 'falconpro-secret-key-2024';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const parent = searchParams.get('parent');

    let query: any = { isActive: true };
    if (type) query.type = type;
    if (parent) query.parentCategory = parent;

    const categories = await Category.find(query).sort({ sortOrder: 1, createdAt: -1 });
    return NextResponse.json(
      { categories },
      { headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' } }
    );
  } catch (error) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const parent = searchParams.get('parent');

    let categories = [...mockCategories];
    if (type) categories = categories.filter(c => c.type === type);
    if (parent) categories = categories.filter(c => c.parentCategory === parent);

    return NextResponse.json(
      { categories },
      { headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' } }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    jwt.verify(token, JWT_SECRET);

    const body = await req.json();
    const { name, type, parentCategory, sortOrder, icon, image } = body;

    if (!name?.ar || !type) {
      return NextResponse.json({ error: 'Name (AR) and type are required' }, { status: 400 });
    }

    try {
      await dbConnect();
      const category = await Category.create({
        name: { ar: name.ar, en: name.en || name.ar },
        type,
        parentCategory: parentCategory || null,
        sortOrder: Number(sortOrder) || 0,
        icon: icon || '',
        image: image || '',
      });
      return NextResponse.json({ success: true, category });
    } catch {
      const newCategory = {
        _id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        name: { ar: name.ar, en: name.en || name.ar },
        type,
        parentCategory: parentCategory || null,
        sortOrder: Number(sortOrder) || 0,
        icon: icon || '',
        image: image || '',
        isActive: true,
      };
      mockCategories.push(newCategory);
      return NextResponse.json({ success: true, category: newCategory });
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
    if (!_id) return NextResponse.json({ error: 'Missing _id' }, { status: 400 });

    try {
      await dbConnect();
      const category = await Category.findByIdAndUpdate(_id, updates, { new: true });
      return NextResponse.json({ success: true, category });
    } catch {
      const index = mockCategories.findIndex(c => c._id === _id);
      if (index !== -1) {
        mockCategories[index] = { ...mockCategories[index], ...updates };
        return NextResponse.json({ success: true, category: mockCategories[index] });
      }
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
  } catch (error) {
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
      await Category.findByIdAndDelete(id);
      return NextResponse.json({ success: true });
    } catch {
      deleteMockCategory(id);
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
