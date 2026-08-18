import mongoose from 'mongoose';

const PackageSchema = new mongoose.Schema({
  name: {
    ar: { type: String, required: true },
    en: { type: String, required: true },
  },
  description: {
    ar: { type: String, default: '' },
    en: { type: String, default: '' },
  },
  images: [{ type: String }],
  products: [{
    productId: { type: String, required: true },
    name: { ar: String, en: String },
    quantity: { type: Number, default: 1 },
    originalPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 }, // discount % for this item in package
  }],
  totalOriginalPrice: { type: Number, required: true },
  finalPrice: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Package || mongoose.model('Package', PackageSchema);
