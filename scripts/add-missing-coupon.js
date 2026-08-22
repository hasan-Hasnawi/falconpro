// One-time script to add missing loyalty coupon for user
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://asadalhsnawiaa_db_user:Asadullah2004@cluster0.joovbkg.mongodb.net/falconpro?retryWrites=true&w=majority';
const USER_ID = '6a84d74cd6b64770587f7ba7';

const UserSchema = new mongoose.Schema({
  phone: String,
  name: String,
  isAdmin: Boolean,
  ordersCount: { type: Number, default: 0 },
  loyaltyCycleCount: { type: Number, default: 0 },
  coupons: { type: [mongoose.Schema.Types.Mixed], default: [] },
}, { strict: false });

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const User = mongoose.models.User || mongoose.model('User', UserSchema);
  const user = await User.findById(USER_ID);

  if (!user) {
    console.log('User not found');
    process.exit(1);
  }

  console.log('Current ordersCount:', user.ordersCount);
  console.log('Current coupons count:', (user.coupons || []).length);

  // Generate loyalty coupon for stage 1 (orderNumber: 1)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'LOYALTY-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const coupon = {
    code: code,
    type: 'free_delivery',
    value: 0,
    description: { ar: 'توصيل مجاني', en: 'Free delivery' },
    freeProductChoice: { type: 'admin' },
    isUsed: false,
    usedAt: null,
    earnedAt: new Date(),
    expiresAt: null,
  };

  if (!user.coupons) {
    user.coupons = [];
  }

  user.coupons.push(coupon);
  await user.save();

  console.log('Coupon added:', coupon.code);
  console.log('Updated coupons count:', user.coupons.length);

  await mongoose.disconnect();
  console.log('Done');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
