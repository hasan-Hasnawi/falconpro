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
      return `${i + 1}. ${name} x${item.quantity} = ${(item.price * item.quantity).toLocaleString()} IQD`;
    })
    .join('\n');

  const discountText = order.discountAmount
    ? `\nDiscount: -${order.discountAmount.toLocaleString()} IQD`
    : '';

  const deliveryText = order.deliveryFee
    ? `\nDelivery: ${order.deliveryFee.toLocaleString()} IQD`
    : '';

  const confirmationItems = order.items.map((item: any) => {
    const name = typeof item.name === 'object' ? (item.name.ar || item.name.en || '') : item.name;
    return `${name} x${item.quantity} = ${(item.price * item.quantity).toLocaleString()} IQD`;
  }).join('\n');

  const confirmationDiscount = order.discountAmount
    ? `\nDiscount: -${order.discountAmount.toLocaleString()} IQD`
    : '';

  const confirmationDelivery = order.deliveryFee
    ? `\nDelivery: ${order.deliveryFee.toLocaleString()} IQD`
    : '';

  const confirmationText = [
    `Order #${shortOrderId}`,
    ``,
    `Phone: ${order.phone}`,
    `Province: ${order.province}`,
    `Address: ${order.address}`,
    ``,
    `Products:`,
    confirmationItems,
    ``,
    `Total: ${order.total.toLocaleString()} IQD`,
    confirmationDiscount,
    confirmationDelivery,
    `Final: ${order.finalTotal.toLocaleString()} IQD`,
  ].filter(Boolean).join('\n');

  const message = [
    `🛒 New order in FalconPro!`,
    ``,
    `🆔 Order: #${shortOrderId}`,
    `📞 Phone: ${order.phone}`,
    `📍 Province: ${order.province}`,
    `🏠 Address: ${order.address}`,
    ``,
    `📦 Products:`,
    itemsText,
    ``,
    `💰 Total: ${order.total.toLocaleString()} IQD`,
    discountText,
    deliveryText,
    `💵 Final: ${order.finalTotal.toLocaleString()} IQD`,
    ``,
    `🔗 Order: ${orderUrl}`,
    ``,
    `📋 Copy confirmation message:`,
    `<pre>${confirmationText}</pre>`,
    ``,
    `🕐 ${new Date(order.createdAt || Date.now()).toLocaleString('ar-IQ')}`,
  ].filter(Boolean).join('\n');

  const row: any[] = [];

  if (!isLocalhost) {
    row.push({
      text: '👁 View Order',
      url: orderUrl,
    });
  }

  if (phone) {
    row.push({
      text: '💬 Confirm via WhatsApp',
      url: `https://wa.me/${phone}`,
    });
  }

  try {
    const payload: any = {
      chat_id: chatId,
      text: message,
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
