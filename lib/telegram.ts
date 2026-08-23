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

  const whatsappItems = order.items
    .map((item: any) => {
      const name = typeof item.name === 'object' ? (item.name.ar || item.name.en || '') : item.name;
      const itemTotal = (item.price * item.quantity).toLocaleString();
      return `\u2022 ${name} \u00D7 ${item.quantity} = ${itemTotal} د.ع`;
    })
    .join('%0A');

  const discountLine = order.discountAmount
    ? `%0A\uD83C\uDF9F\uFE0F الخصم: -${order.discountAmount.toLocaleString()} د.ع`
    : '';

  const deliveryLine = order.deliveryFee
    ? `%0A\uD83D\uDE9A رسوم التوصيل: ${order.deliveryFee.toLocaleString()} د.ع`
    : '';

  const whatsappMessage =
    `%F0%9F%9B%92 طلب جديد من FalconPro` +
    `%0A%0A` +
    `%F0%9F%86%94 رقم الطلب: %23${shortOrderId}` +
    `%0A%F0%9F%93%9E الهاتف: ${order.phone}` +
    `%0A%F0%9F%93%8D المحافظة: ${order.province}` +
    `%0A%F0%9F%8F%A0 العنوان: ${order.address}` +
    `%0A%0A` +
    `%F0%9F%93%A6 المنتجات:%0A${whatsappItems}` +
    `%0A%0A` +
    `%F0%9F%92%B0 المجموع: ${order.total.toLocaleString()} د.ع` +
    `${discountLine}` +
    `${deliveryLine}` +
    `%0A%F0%9F%92%B5 النهائي: ${order.finalTotal.toLocaleString()} د.ع` +
    `%0A%0A` +
    `هل تريد تاكيد الطلب؟`;

  const whatsappUrl = phone ? `https://wa.me/${phone}?text=${whatsappMessage}` : '';

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

💬 تاكيد الطلب عبر واتساب:
${whatsappUrl}

🔗 رابط الطلب:
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
