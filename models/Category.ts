import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: {
    ar: { type: String, required: true },
    en: { type: String, required: true },
  },
  type: {
    type: String,
    enum: ['main', 'sub'],
    required: true,
  },
  parentCategory: {
    type: String,
    default: null,
  },
  icon: {
    type: String,
    default: '',
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  image: {
    type: String,
    default: '',
  },
});

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
