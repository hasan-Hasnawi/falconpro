import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import jwt from 'jsonwebtoken';
import { mockCategories } from '@/lib/mock-data';

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
      { headers: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' } }
    );
  } catch (error) {
    console.error('Categories GET error:', error);
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const parent = searchParams.get('parent');

    let categories = [...mockCategories];
    if (type) categories = categories.filter(c => c.type === type);
    if (parent) categories = categories.filter(c => c.parentCategory === parent);

    return NextResponse.json(
      { categories },
      { headers: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' } }
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
  } catch (error) {
    console.error('Category POST error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
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

    await dbConnect();
    const category = await Category.findByIdAndUpdate(_id, updates, { new: true });
    if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Category PUT error:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    jwt.verify(token, JWT_SECRET);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    await dbConnect();
    await Category.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Category DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
