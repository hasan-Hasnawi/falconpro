export function generateCouponCode(prefix = 'FALCON') {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${code}`;
}

export function buildLoyaltyCoupon(stage: any) {
  const code = generateCouponCode('LOYALTY');
  const expiresAt = stage.expiresInDays
    ? new Date(Date.now() + stage.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    : null;

  let couponType = 'percentage';
  if (stage.rewardType === 'free_delivery') couponType = 'free_delivery';
  else if (stage.rewardType === 'fixed_discount') couponType = 'fixed';
  else if (stage.rewardType === 'free_product') couponType = 'free_product';
  else if (stage.rewardType === 'percentage_discount') couponType = 'percentage';

  const coupon: any = {
    code,
    type: couponType,
    value: stage.rewardValue,
    description: stage.description || { ar: '', en: '' },
    freeProductChoice: stage.freeProductChoice || { type: 'admin' },
    isUsed: false,
    usedAt: null,
    earnedAt: new Date(),
    expiresAt,
  };

  return coupon;
}

export async function processLoyaltyRewards({ userId, guestPhone, settings }: { userId?: string; guestPhone?: string; settings: any }) {
  const earnedCoupons: any[] = [];

  if (!userId && !guestPhone) return earnedCoupons;

  const stages = settings?.loyaltyStages || [];
  if (!stages.length) return earnedCoupons;

  let user: any = null;

  if (userId) {
    const { default: User } = await import('@/models/User');
    const { default: dbConnect } = await import('@/lib/db');
    await dbConnect();
    user = await User.findById(userId);
  }

  if (!user) return earnedCoupons;

  const ordersCount = (user.ordersCount || 0);
  const cycleReset = settings?.loyaltyCycleReset;

  const matchedStage = stages.find((s: any) => s.orderNumber === ordersCount);
  if (matchedStage) {
    const coupon = buildLoyaltyCoupon(matchedStage);
    earnedCoupons.push({ coupon, stage: matchedStage });

    if (userId) {
      const { default: User } = await import('@/models/User');
      if (!user.coupons) {
        user.coupons = [];
      }
      if (!user.coupons.find((c: any) => c.code === coupon.code)) {
        user.coupons.push(coupon);
        await user.save();
      }
    }
  }

  const maxStageNumber = Math.max(...stages.map((s: any) => s.orderNumber));
  const resetAt = cycleReset || maxStageNumber + 1;
  if (ordersCount >= resetAt) {
    if (userId) {
      const { default: User } = await import('@/models/User');
      user.ordersCount = 0;
      user.loyaltyCycleCount = (user.loyaltyCycleCount || 0) + 1;
      await user.save();
    }
  }

  return earnedCoupons;
}
