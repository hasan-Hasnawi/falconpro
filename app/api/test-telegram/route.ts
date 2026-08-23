import { NextRequest, NextResponse } from 'next/server';
import { sendOrderNotification } from '@/lib/telegram';

export async function GET(req: NextRequest) {
  const testOrder = {
    _id: 'test1234567890',
    phone: '07701234567',
    province: 'بغداد',
    address: 'شارع الرشيد',
    total: 100000,
    finalTotal: 105000,
    deliveryFee: 5000,
    discountAmount: 0,
    items: [
      { name: { ar: 'واي بروتين', en: 'Whey Protein' }, price: 50000, quantity: 2 },
    ],
    createdAt: new Date().toISOString(),
  };

  try {
    await sendOrderNotification(testOrder);
    return NextResponse.json({ success: true, message: 'Telegram notification sent' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
