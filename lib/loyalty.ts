import { mockSettings, mockUsers, findMockUserById, addCouponToMockUser, updateMockUser } from './mock-data';

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
    earnedAt: new Date().toISOString(),
    expiresAt,
  };

  return coupon;
}

export async function processLoyaltyRewards({ userId, guestPhone, settings }: { userId?: string; guestPhone?: string; settings: any }) {
  const earnedCoupons: any[] = [];

  try {
    if (!userId && !guestPhone) return earnedCoupons;

    const stages = settings?.loyaltyStages || [];
    if (!stages.length) return earnedCoupons;

    let user: any = null;
    let userIdentifier = '';

    // For simplicity, loyalty rewards only work for logged-in users in mock mode
    // Guest users are not tracked across orders without account
    if (userId) {
      try {
        // Try to use dynamic import to avoid issues during build
        const { default: User } = await import('@/models/User');
        const { default: dbConnect } = await import('@/lib/db');
        await dbConnect();
        user = await User.findById(userId);
      } catch {
        // Mock fallback
        user = findMockUserById(userId);
      }
      userIdentifier = userId;
    }

    if (!user) return earnedCoupons;

    const ordersCount = (user.ordersCount || 0);
    const cycleReset = settings?.loyaltyCycleReset;

    // Check if current order count matches any stage
    const matchedStage = stages.find((s: any) => s.orderNumber === ordersCount);
    if (matchedStage) {
      const coupon = buildLoyaltyCoupon(matchedStage);
      earnedCoupons.push({ coupon, stage: matchedStage });

      if (userId) {
        try {
          const { default: User } = await import('@/models/User');
          // Only push if not already added (Mongoose document)
          if (user.coupons && !user.coupons.find((c: any) => c.code === coupon.code)) {
            user.coupons.push(coupon);
            await user.save();
          }
        } catch {
          // Mock fallback - avoid double push if already added
          if (!user.coupons || !user.coupons.find((c: any) => c.code === coupon.code)) {
            addCouponToMockUser(userIdentifier, coupon);
          }
        }
      }
    }

    // Cycle reset
    const maxStageNumber = Math.max(...stages.map((s: any) => s.orderNumber));
    const resetAt = cycleReset || maxStageNumber + 1;
    if (ordersCount >= resetAt) {
      if (userId) {
        try {
          const { default: User } = await import('@/models/User');
          user.ordersCount = 0;
          user.loyaltyCycleCount = (user.loyaltyCycleCount || 0) + 1;
          await user.save();
        } catch {
          updateMockUser(userIdentifier, {
            ordersCount: 0,
            loyaltyCycleCount: (user.loyaltyCycleCount || 0) + 1,
          });
        }
      }
    }
  } catch (error) {
    console.error('Loyalty processing error:', error);
  }

  return earnedCoupons;
}
