import mongoose from 'mongoose';

const FreeProductChoiceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['admin', 'user'],
    default: 'admin',
  },
  productId: { type: String, default: null },
  categoryId: { type: String, default: null },
  maxValue: { type: Number, default: null },
}, { _id: false });

const LoyaltyStageSchema = new mongoose.Schema({
  orderNumber: {
    type: Number,
    required: true,
  },
  rewardType: {
    type: String,
    enum: ['free_delivery', 'percentage_discount', 'fixed_discount', 'free_product'],
    required: true,
  },
  rewardValue: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  description: {
    ar: { type: String, default: '' },
    en: { type: String, default: '' },
  },
  expiresInDays: {
    type: Number,
    default: null,
  },
  freeProductChoice: {
    type: FreeProductChoiceSchema,
    default: {},
  },
}, { _id: false });

const SettingsSchema = new mongoose.Schema({
  loyaltyStages: {
    type: [LoyaltyStageSchema],
    default: [],
  },
  loyaltyCycleReset: {
    type: Number,
    default: null,
  },
  deliveryProvinces: [{
    type: String,
  }],
  deliveryFee: {
    type: Number,
    default: 5000,
  },
  deliveryFeesByProvince: {
    type: Map,
    of: Number,
    default: {},
  },
  excludedProvinces: [{
    type: String,
  }],
  maintenanceMode: {
    type: Boolean,
    default: false,
  },
  sitePhone: {
    type: String,
    default: '0776 666 1816',
  },
  siteInstagram: {
    type: String,
    default: '@199fal',
  },
  siteDescription: {
    type: String,
    default: 'أفضل المكملات الغذائية والبروتين للاعبي كمال الأجسام والرياضيين المحترفين في العراق',
  },
  heroTitleAr: { type: String, default: 'FalconPro' },
  heroTitleEn: { type: String, default: 'FalconPro' },
  heroSubtitleAr: { type: String, default: 'Event Title' },
  heroSubtitleEn: { type: String, default: 'Event Title' },
  heroDescriptionAr: { type: String, default: 'Best supplements and protein' },
  heroDescriptionEn: { type: String, default: 'Best supplements and protein' },
  heroCtaAr: { type: String, default: 'Shop Now' },
  heroCtaEn: { type: String, default: 'Shop Now' },
  heroImages: [{ type: String }],
  packagesTitleAr: { type: String, default: 'عروض البكجات' },
  packagesTitleEn: { type: String, default: 'Package Deals' },
  featuredTitleAr: { type: String, default: 'منتجات مميزة' },
  featuredTitleEn: { type: String, default: 'Featured Products' },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
