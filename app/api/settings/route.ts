import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';
import { mockSettings } from '@/lib/mock-data';

export async function GET(req: NextRequest) {
  try {
    try {
      await dbConnect();
      let settings = await Settings.findOne();
      if (!settings) {
        settings = await Settings.create(mockSettings);
      }
      return NextResponse.json(
        { settings },
        { headers: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' } }
      );
    } catch {
      return NextResponse.json(
        { settings: mockSettings },
        { headers: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' } }
      );
    }
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    try {
      await dbConnect();
      let settings = await Settings.findOne();
      if (!settings) {
        settings = await Settings.create(body);
      } else {
        for (const [key, value] of Object.entries(body)) {
          settings.set(key, value);
        }
        settings.updatedAt = new Date();
        await settings.save();
      }
      return NextResponse.json({ success: true, settings });
    } catch {
      Object.assign(mockSettings, body);
      return NextResponse.json({ success: true, settings: mockSettings });
    }
  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
