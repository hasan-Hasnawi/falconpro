import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    ar: { type: String, required: true },
    en: { type: String, required: true },
  },
  description: {
    ar: { type: String, default: '' },
    en: { type: String, default: '' },
  },
  price: {
    type: Number,
    required: true,
  },
  images: [{
    type: String,
  }],
  category: {
    type: String,
    required: true,
  },
  subcategory: {
    type: String,
    default: '',
  },
  stock: {
    type: Number,
    default: 100,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isOnSale: {
    type: Boolean,
    default: false,
  },
  salePrice: {
    type: Number,
    default: null,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  isOutOfStock: {
    type: Boolean,
    default: false,
  },
  flavors: [{
    name: {
      ar: { type: String, required: true },
      en: { type: String, required: true },
    },
    image: { type: String, required: true },
    stock: { type: Number, default: 0 },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
