import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import Product from '@/models/Product';
import User from '@/models/User';
import Settings from '@/models/Settings';
import DiscountCode from '@/models/DiscountCode';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    await Settings.deleteMany({});
    await DiscountCode.deleteMany({});

    // Create admin user
    const adminPassword = await bcrypt.hash('1234', 10);
    await User.create({
      phone: '07701234567',
      password: adminPassword,
      name: 'Admin',
      isAdmin: true,
    });

    // Create settings
    await Settings.create({
      loyaltyThreshold: 5,
      deliveryProvinces: [
        'بغداد', 'البصرة', 'نينوى', 'الأنبار', 'بابل', 'كربلاء',
        'النجف', 'واسط', 'صلاح الدين', 'ديالى', 'كركوك', 'المثنى', 'القادسية',
        'ذي قار', 'ميسان'
      ],
      deliveryFee: 5000,
    });

    // Create discount code
    await DiscountCode.create({
      code: 'FALCON10',
      type: 'percentage',
      value: 10,
      isActive: true,
    });

    // Create main categories
    const mainCategories = [
      { name: { ar: 'مكملات غذائية', en: 'Supplements' }, type: 'main', sortOrder: 1, icon: 'Dumbbell', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500' },
      { name: { ar: 'منتجات صحية', en: 'Health Products' }, type: 'main', sortOrder: 2, icon: 'Heart', image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=500' },
      { name: { ar: 'عروض البكجات', en: 'Package Deals' }, type: 'main', sortOrder: 3, icon: 'Package', image: 'https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?w=500' },
    ];
    await Category.insertMany(mainCategories);

    const supplements = await Category.findOne({ 'name.ar': 'مكملات غذائية' });
    const health = await Category.findOne({ 'name.ar': 'منتجات صحية' });
    const packages = await Category.findOne({ 'name.ar': 'عروض البكجات' });

    // Create subcategories
    const subCategories = [
      { name: { ar: 'بروتين', en: 'Protein' }, type: 'sub', parentCategory: supplements?._id.toString(), sortOrder: 1 },
      { name: { ar: 'كرياتين', en: 'Creatine' }, type: 'sub', parentCategory: supplements?._id.toString(), sortOrder: 2 },
      { name: { ar: 'أمينو أسيد', en: 'Amino Acids' }, type: 'sub', parentCategory: supplements?._id.toString(), sortOrder: 3 },
      { name: { ar: 'فيتامينات', en: 'Vitamins' }, type: 'sub', parentCategory: supplements?._id.toString(), sortOrder: 4 },
      { name: { ar: 'قبل التمرين', en: 'Pre-Workout' }, type: 'sub', parentCategory: supplements?._id.toString(), sortOrder: 5 },
      { name: { ar: 'مكملات الطاقة', en: 'Energy Supplements' }, type: 'sub', parentCategory: health?._id.toString(), sortOrder: 1 },
      { name: { ar: 'مكملات المناعة', en: 'Immunity' }, type: 'sub', parentCategory: health?._id.toString(), sortOrder: 2 },
      { name: { ar: 'منتجات الدايت', en: 'Diet Products' }, type: 'sub', parentCategory: health?._id.toString(), sortOrder: 3 },
      { name: { ar: 'بكج التنشيف', en: 'Cutting Package' }, type: 'sub', parentCategory: packages?._id.toString(), sortOrder: 1 },
      { name: { ar: 'بكج التضخيم', en: 'Bulking Package' }, type: 'sub', parentCategory: packages?._id.toString(), sortOrder: 2 },
      { name: { ar: 'بكج المبتدئين', en: 'Beginner Package' }, type: 'sub', parentCategory: packages?._id.toString(), sortOrder: 3 },
    ];
    await Category.insertMany(subCategories);

    // Create demo products
    const products = [
      {
        name: { ar: 'واي بروتين 5 باوند', en: 'Whey Protein 5lb' },
        description: { ar: 'بروتين مصل اللبن عالي الجودة بعدة نكهات', en: 'High-quality whey protein in multiple flavors' },
        price: 85000,
        images: ['https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=500'],
        category: supplements?._id.toString(),
        subcategory: (await Category.findOne({ 'name.ar': 'بروتين' }))?._id.toString(),
        featured: true,
        stock: 50,
        flavors: [
          { name: { ar: 'شوكولاتة', en: 'Chocolate' }, image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=500', stock: 20 },
          { name: { ar: 'فانيليا', en: 'Vanilla' }, image: 'https://images.unsplash.com/photo-1593095948071-1c5b05babc9c?w=500', stock: 15 },
          { name: { ar: 'فراولة', en: 'Strawberry' }, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', stock: 15 },
        ],
      },
      {
        name: { ar: 'آيزوليت بروتين 2 كغ - فانيليا', en: 'Isolate Protein 2kg - Vanilla' },
        description: { ar: 'بروتين معزول نقي 100% مع نكهة الفانيليا', en: '100% pure isolate protein with vanilla flavor' },
        price: 95000,
        images: ['https://images.unsplash.com/photo-1593095948071-1c5b05babc9c?w=500'],
        category: supplements?._id.toString(),
        subcategory: (await Category.findOne({ 'name.ar': 'بروتين' }))?._id.toString(),
        featured: true,
        stock: 40,
        isOutOfStock: true,
      },
      {
        name: { ar: 'كرياتين مونوهيدرات 300غ', en: 'Creatine Monohydrate 300g' },
        description: { ar: 'كرياتين نقي لزيادة القوة والأداء', en: 'Pure creatine for increased strength and performance' },
        price: 25000,
        images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500'],
        category: supplements?._id.toString(),
        subcategory: (await Category.findOne({ 'name.ar': 'كرياتين' }))?._id.toString(),
        featured: true,
        stock: 100,
      },
      {
        name: { ar: 'BCAA 2:1:1 - 500 قرص', en: 'BCAA 2:1:1 - 500 Tablets' },
        description: { ar: 'أحماض أمينية متفرعة السلسلة لتعافي العضلات', en: 'Branched-chain amino acids for muscle recovery' },
        price: 35000,
        images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500'],
        category: supplements?._id.toString(),
        subcategory: (await Category.findOne({ 'name.ar': 'أمينو أسيد' }))?._id.toString(),
        featured: false,
        stock: 60,
      },
      {
        name: { ar: 'مالتي فيتامين للرياضيين', en: 'Multi-Vitamin for Athletes' },
        description: { ar: 'مجموعة فيتامينات ومعادن أساسية للرياضيين', en: 'Essential vitamins and minerals for athletes' },
        price: 18000,
        images: ['https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500'],
        category: supplements?._id.toString(),
        subcategory: (await Category.findOne({ 'name.ar': 'فيتامينات' }))?._id.toString(),
        featured: false,
        stock: 80,
      },
      {
        name: { ar: 'بري ووركاوت C4 - 30 حصة', en: 'Pre-Workout C4 - 30 Servings' },
        description: { ar: 'مكمل قبل التمرين لطاقة فائقة وتركيز', en: 'Pre-workout supplement for extreme energy and focus' },
        price: 42000,
        images: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500'],
        category: supplements?._id.toString(),
        subcategory: (await Category.findOne({ 'name.ar': 'قبل التمرين' }))?._id.toString(),
        featured: true,
        stock: 35,
      },
      {
        name: { ar: 'أوميغا 3 - 100 كبسولة', en: 'Omega 3 - 100 Capsules' },
        description: { ar: 'أحماض دهنية أساسية لصحة القلب والمفاصل', en: 'Essential fatty acids for heart and joint health' },
        price: 22000,
        images: ['https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=500'],
        category: health?._id.toString(),
        subcategory: (await Category.findOne({ 'name.ar': 'مكملات المناعة' }))?._id.toString(),
        featured: false,
        stock: 70,
      },
      {
        name: { ar: 'كارنتين L-Carnitine - 60 كبسولة', en: 'L-Carnitine - 60 Capsules' },
        description: { ar: 'يساعد في حرق الدهون وإنتاج الطاقة', en: 'Helps burn fat and produce energy' },
        price: 28000,
        images: ['https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500'],
        category: health?._id.toString(),
        subcategory: (await Category.findOne({ 'name.ar': 'منتجات الدايت' }))?._id.toString(),
        featured: true,
        stock: 45,
      },
      {
        name: { ar: 'بكج التنشيف الاحترافي', en: 'Professional Cutting Package' },
        description: { ar: 'بكج كامل يحتوي على بروتين + كارنتين + فيتامينات + شيكر', en: 'Complete package with protein + carnitine + vitamins + shaker' },
        price: 145000,
        images: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500'],
        category: packages?._id.toString(),
        subcategory: (await Category.findOne({ 'name.ar': 'بكج التنشيف' }))?._id.toString(),
        isOnSale: true,
        salePrice: 125000,
        featured: true,
        stock: 20,
      },
      {
        name: { ar: 'بكج التضخيم القصوي', en: 'Extreme Bulking Package' },
        description: { ar: 'بكج كامل للتضخيم: بروتين + كرياتين + كربوهيدرات + أمينو + شيكر', en: 'Complete bulking package: protein + creatine + carbs + amino + shaker' },
        price: 185000,
        images: ['https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=500'],
        category: packages?._id.toString(),
        subcategory: (await Category.findOne({ 'name.ar': 'بكج التضخيم' }))?._id.toString(),
        isOnSale: true,
        salePrice: 165000,
        featured: true,
        stock: 15,
      },
      {
        name: { ar: 'بكج المبتدئين الأساسي', en: 'Beginner Basic Package' },
        description: { ar: 'بكج اقتصادي للمبتدئين: بروتين + كرياتين + شيكر', en: 'Economical beginner package: protein + creatine + shaker' },
        price: 95000,
        images: ['https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?w=500'],
        category: packages?._id.toString(),
        subcategory: (await Category.findOne({ 'name.ar': 'بكج المبتدئين' }))?._id.toString(),
        featured: true,
        stock: 30,
      },
      {
        name: { ar: 'جلوتامين 500غ - نكهة ليمون', en: 'Glutamine 500g - Lemon' },
        description: { ar: 'جلوتامين نقي لاستشفاء العضلات والمناعة', en: 'Pure glutamine for muscle recovery and immunity' },
        price: 32000,
        images: ['https://images.unsplash.com/photo-1593095948071-1c5b05babc9c?w=500'],
        category: supplements?._id.toString(),
        subcategory: (await Category.findOne({ 'name.ar': 'أمينو أسيد' }))?._id.toString(),
        featured: false,
        stock: 55,
      },
      {
        name: { ar: 'زينك + ماغنيسيوم + B6', en: 'ZMA - Zinc + Magnesium + B6' },
        description: { ar: 'مكمل ZMA لجودة النوم واستشفاء العضلات', en: 'ZMA supplement for sleep quality and muscle recovery' },
        price: 15000,
        images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500'],
        category: health?._id.toString(),
        subcategory: (await Category.findOne({ 'name.ar': 'مكملات الطاقة' }))?._id.toString(),
        featured: false,
        stock: 90,
      },
      {
        name: { ar: 'كازين بروتين 2 كغ - كوكيز', en: 'Casein Protein 2kg - Cookies' },
        description: { ar: 'بروتين كازين بطيء الامتصاص مثالي قبل النوم', en: 'Slow-absorbing casein protein ideal before sleep' },
        price: 78000,
        images: ['https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=500'],
        category: supplements?._id.toString(),
        subcategory: (await Category.findOne({ 'name.ar': 'بروتين' }))?._id.toString(),
        featured: false,
        stock: 25,
      },
    ];

    await Product.insertMany(products);

    return NextResponse.json({
      success: true,
      message: 'Database seeded with demo data',
      data: {
        categories: await Category.countDocuments(),
        products: await Product.countDocuments(),
        adminUser: '07701234567 / 1234',
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
