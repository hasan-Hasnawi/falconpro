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
  const whatsappUrl = phone ? `https://wa.me/${phone}` : '';

  const itemsText = order.items
    .map(
      (item: any, i: number) => {
        const name = typeof item.name === 'object' ? (item.name.ar || item.name.en || '') : item.name;
        return `${i + 1}. ${name} × ${item.quantity} = ${(item.price * item.quantity).toLocaleString()} د.ع`;
      }
    )
    .join('\n');

  const discountText = order.discountAmount
    ? `🏷️ الخصم: -${order.discountAmount.toLocaleString()} د.ع\n`
    : '';

  const whatsappText = whatsappUrl
    ? `💬 تاكيد الطلب عبر واتساب:\n${whatsappUrl}\n`
    : '';

  const message = `
🛒 *طلب جديد في FalconPro!*

🆔 رقم الطلب: #${orderId.toString().slice(-6)}
📞 الهاتف: ${order.phone}
📍 المحافظة: ${order.province}
🏠 العنوان: ${order.address}

📦 المنتجات:
${itemsText}

💰 المجموع: ${order.total.toLocaleString()} د.ع
${discountText}💵 النهائي: *${order.finalTotal.toLocaleString()} د.ع*

${whatsappText}🔗 رابط الطلب:
${orderUrl}

🕐 ${new Date(order.createdAt || Date.now()).toLocaleString('ar-IQ')}
  `.trim();

  try {
    const keyboard: any[][][] = [];

    const mainRow: any[] = [];
    if (!isLocalhost) {
      mainRow.push({
        text: '👁️ عرض الطلب',
        url: orderUrl,
      });
    }
    if (whatsappUrl) {
      mainRow.push({
        text: '💬 تاكيد عبر واتساب',
        url: whatsappUrl,
      });
    }
    if (mainRow.length > 0) {
      keyboard.push(mainRow);
    }

    const payload: any = {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
    };

    if (keyboard.length > 0) {
      payload.reply_markup = {
        inline_keyboard: keyboard,
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
