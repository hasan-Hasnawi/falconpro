import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import jwt from 'jsonwebtoken';
import { mockProducts } from '@/lib/mock-data';

const JWT_SECRET = process.env.JWT_SECRET || 'falconpro-secret-key-2024';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');

    let query: any = { isActive: true };

    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (featured === 'true') query.featured = true;
    if (search) {
      query.$or = [
        { 'name.ar': { $regex: search, $options: 'i' } },
        { 'name.en': { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    return NextResponse.json(
      { products },
      { headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' } }
    );
  } catch (error) {
    // Return mock data if MongoDB is not available
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');

    let products = [...mockProducts];
    
    if (category) products = products.filter(p => p.category === category || p.subcategory === category);
    if (subcategory) products = products.filter(p => p.subcategory === subcategory);
    if (featured === 'true') products = products.filter(p => p.featured);
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p => 
        p.name.ar.toLowerCase().includes(q) || p.name.en.toLowerCase().includes(q)
      );
    }

    return NextResponse.json(
      { products },
      { headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' } }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    jwt.verify(token, JWT_SECRET);

    const body = await req.json();
    const { name, price, stock, category, subcategory, images, isOnSale, salePrice, featured, description, isOutOfStock, flavors } = body;

    if (!name?.ar || !price || !category) {
      return NextResponse.json({ error: 'Name (AR), price, and category are required' }, { status: 400 });
    }

    try {
      await dbConnect();
      const product = await Product.create({
        name: { ar: name.ar, en: name.en || name.ar },
        description: { ar: description?.ar || '', en: description?.en || '' },
        price: Number(price),
        stock: Number(stock) || 100,
        category,
        subcategory: subcategory || '',
        images: images || [],
        isOnSale: !!isOnSale,
        salePrice: isOnSale && salePrice ? Number(salePrice) : null,
        featured: !!featured,
        isOutOfStock: !!isOutOfStock,
        flavors: Array.isArray(flavors) ? flavors.map((f: any) => ({
          name: { ar: f.name?.ar || f.name, en: f.name?.en || f.name?.ar || f.name },
          image: f.image || '',
          stock: Number(f.stock) || 0,
        })) : [],
      });
      return NextResponse.json({ success: true, product });
    } catch {
      // Mock fallback
      const newProduct = {
        _id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        name: { ar: name.ar, en: name.en || name.ar },
        description: { ar: description?.ar || '', en: description?.en || '' },
        price: Number(price),
        stock: Number(stock) || 100,
        category,
        subcategory: subcategory || '',
        images: images || [],
        isActive: true,
        isOnSale: !!isOnSale,
        salePrice: isOnSale && salePrice ? Number(salePrice) : null,
        featured: !!featured,
        isOutOfStock: !!isOutOfStock,
        flavors: Array.isArray(flavors) ? flavors.map((f: any) => ({
          name: { ar: f.name?.ar || f.name, en: f.name?.en || f.name?.ar || f.name },
          image: f.image || '',
          stock: Number(f.stock) || 0,
        })) : [],
        createdAt: new Date().toISOString(),
      };
      mockProducts.push(newProduct as any);
      return NextResponse.json({ success: true, product: newProduct });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
