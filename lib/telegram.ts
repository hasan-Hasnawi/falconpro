import Settings from '@/models/Settings';
import dbConnect from '@/lib/db';

function escapeHtml(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function sendOrderNotification(order: any) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!token || !chatId) {
    console.warn('Telegram bot token or chat ID is missing');
    return;
  }

  const orderId = order._id?.toString?.() || order._id;
  const orderUrl = `${appUrl}/admin/orders/${orderId}`;
  const isLocalhost = appUrl.includes('localhost') || appUrl.includes('127.0.0.1');

  const phone = order.phone?.replace(/^0/, '+964') || '';
  const shortOrderId = orderId.toString().slice(-6);

  const itemsText = order.items
    .map((item: any, i: number) => {
      const name = typeof item.name === 'object' ? (item.name.ar || item.name.en || '') : item.name;
      return `${i + 1}. ${escapeHtml(name)} x${item.quantity} = ${(item.price * item.quantity).toLocaleString()} د.ع`;
    })
    .join('\n');

  const discountText = order.discountAmount
    ? `\nالخصم: -${order.discountAmount.toLocaleString()} د.ع`
    : '';

  const deliveryText = order.deliveryFee
    ? `\nالتوصيل: ${order.deliveryFee.toLocaleString()} د.ع`
    : '';

  const confirmationItems = order.items.map((item: any) => {
    const name = typeof item.name === 'object' ? (item.name.ar || item.name.en || '') : item.name;
    return `${escapeHtml(name)} x${item.quantity} = ${(item.price * item.quantity).toLocaleString()} د.ع`;
  }).join('\n');

  let template = 'رقم الطلب: #{orderId}\n\nالهاتف: {phone}\nالمحافظة: {province}\nالعنوان: {address}\n\nالمنتجات:\n{items}\n\nالمجموع: {total} د.ع{discount}{delivery}\nالنهائي: {final} د.ع';
  try {
    await dbConnect();
    const settings = await Settings.findOne();
    if (settings?.whatsappTemplate) {
      template = settings.whatsappTemplate;
    }
  } catch {}

  const confirmationText = template
    .replace('{orderId}', shortOrderId)
    .replace('{phone}', escapeHtml(order.phone || ''))
    .replace('{province}', escapeHtml(order.province || ''))
    .replace('{address}', escapeHtml(order.address || ''))
    .replace('{items}', confirmationItems)
    .replace('{total}', order.total.toLocaleString())
    .replace('{discount}', order.discountAmount ? `\nالخصم: -${order.discountAmount.toLocaleString()} د.ع` : '')
    .replace('{delivery}', order.deliveryFee ? `\nالتوصيل: ${order.deliveryFee.toLocaleString()} د.ع` : '')
    .replace('{final}', order.finalTotal.toLocaleString());

  const message = [
    `🛒 طلب جديد في FalconPro!`,
    ``,
    `🆔 الطلب: #${shortOrderId}`,
    `📞 الهاتف: ${escapeHtml(order.phone || '')}`,
    `📍 المحافظة: ${escapeHtml(order.province || '')}`,
    `🏠 العنوان: ${escapeHtml(order.address || '')}`,
    ``,
    `📦 المنتجات:`,
    itemsText,
    ``,
    `💰 المجموع: ${order.total.toLocaleString()} د.ع`,
    discountText,
    deliveryText,
    `💵 النهائي: ${order.finalTotal.toLocaleString()} د.ع`,
    ``,
    `🔗 الطلب: ${orderUrl}`,
    ``,
    `📋 نسخ رسالة التأكيد:`,
    `<pre>${confirmationText}</pre>`,
    ``,
    `🕐 ${new Date(order.createdAt || Date.now()).toLocaleString('ar-IQ')}`,
  ].filter(Boolean).join('\n');

  const row: any[] = [];

  if (!isLocalhost) {
    row.push({
      text: '👁 عرض الطلب',
      url: orderUrl,
    });
  }

  if (phone) {
    row.push({
      text: '💬 تأكيد عبر واتساب',
      url: `https://wa.me/${phone}?text=`,
    });
  }

  try {
    const payload: any = {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    };

    if (row.length > 0) {
      payload.reply_markup = {
        inline_keyboard: [row],
      };
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!data.ok) {
      console.error('Telegram API error:', data.description);
    }
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
  }
}
