import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['free_delivery', 'percentage', 'fixed', 'free_product'],
    required: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  description: {
    ar: { type: String, default: '' },
    en: { type: String, default: '' },
  },
  freeProductChoice: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  usedAt: {
    type: Date,
    default: null,
  },
  earnedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
}, { _id: true });

const UserSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    default: '',
  },
  addresses: [{
    province: String,
    address: String,
  }],
  ordersCount: {
    type: Number,
    default: 0,
  },
  loyaltyCycleCount: {
    type: Number,
    default: 0,
  },
  coupons: {
    type: [CouponSchema],
    default: [],
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
