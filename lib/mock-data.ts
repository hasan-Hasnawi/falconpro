// Simple ID generator (no external deps)
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// Categories
export const mockCategories = [
  {
    _id: 'cat_001',
    name: { ar: 'مكملات غذائية', en: 'Supplements' },
    type: 'main',
    icon: 'Dumbbell',
    sortOrder: 1,
    isActive: true,
    image: '',
  },
  {
    _id: 'cat_002',
    name: { ar: 'منتجات صحية', en: 'Health Products' },
    type: 'main',
    icon: 'Heart',
    sortOrder: 2,
    isActive: true,
    image: '',
  },
  {
    _id: 'cat_003',
    name: { ar: 'عروض البكجات', en: 'Package Deals' },
    type: 'main',
    icon: 'Package',
    sortOrder: 3,
    isActive: true,
    image: '',
  },
  // Subcategories
  {
    _id: 'sub_001',
    name: { ar: 'بروتين', en: 'Protein' },
    type: 'sub',
    parentCategory: 'cat_001',
    sortOrder: 1,
    isActive: true,
  },
  {
    _id: 'sub_002',
    name: { ar: 'كرياتين', en: 'Creatine' },
    type: 'sub',
    parentCategory: 'cat_001',
    sortOrder: 2,
    isActive: true,
  },
  {
    _id: 'sub_003',
    name: { ar: 'أمينو أسيد', en: 'Amino Acids' },
    type: 'sub',
    parentCategory: 'cat_001',
    sortOrder: 3,
    isActive: true,
  },
  {
    _id: 'sub_004',
    name: { ar: 'فيتامينات', en: 'Vitamins' },
    type: 'sub',
    parentCategory: 'cat_001',
    sortOrder: 4,
    isActive: true,
  },
  {
    _id: 'sub_005',
    name: { ar: 'قبل التمرين', en: 'Pre-Workout' },
    type: 'sub',
    parentCategory: 'cat_001',
    sortOrder: 5,
    isActive: true,
  },
  {
    _id: 'sub_006',
    name: { ar: 'مكملات الطاقة', en: 'Energy Supplements' },
    type: 'sub',
    parentCategory: 'cat_002',
    sortOrder: 1,
    isActive: true,
  },
  {
    _id: 'sub_007',
    name: { ar: 'مكملات المناعة', en: 'Immunity' },
    type: 'sub',
    parentCategory: 'cat_002',
    sortOrder: 2,
    isActive: true,
  },
  {
    _id: 'sub_008',
    name: { ar: 'منتجات الدايت', en: 'Diet Products' },
    type: 'sub',
    parentCategory: 'cat_002',
    sortOrder: 3,
    isActive: true,
  },
  {
    _id: 'sub_009',
    name: { ar: 'بكج التنشيف', en: 'Cutting Package' },
    type: 'sub',
    parentCategory: 'cat_003',
    sortOrder: 1,
    isActive: true,
  },
  {
    _id: 'sub_010',
    name: { ar: 'بكج التضخيم', en: 'Bulking Package' },
    type: 'sub',
    parentCategory: 'cat_003',
    sortOrder: 2,
    isActive: true,
  },
  {
    _id: 'sub_011',
    name: { ar: 'بكج المبتدئين', en: 'Beginner Package' },
    type: 'sub',
    parentCategory: 'cat_003',
    sortOrder: 3,
    isActive: true,
  },
];

// Products
export const mockProducts = [
  {
    _id: 'prod_001',
    name: { ar: 'واي بروتين 5 باوند', en: 'Whey Protein 5lb' },
    description: { ar: 'بروتين مصل اللبن عالي الجودة بعدة نكهات', en: 'High-quality whey protein in multiple flavors' },
    price: 85000,
    images: ['https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=500&q=80'],
    category: 'cat_001',
    subcategory: 'sub_001',
    featured: true,
    stock: 50,
    isActive: true,
    isOnSale: false,
    salePrice: null,
    isOutOfStock: false,
    flavors: [
      { name: { ar: 'شوكولاتة', en: 'Chocolate' }, image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=500&q=80', stock: 20 },
      { name: { ar: 'فانيليا', en: 'Vanilla' }, image: 'https://images.unsplash.com/photo-1593095948071-1c5b05babc9c?w=500&q=80', stock: 15 },
      { name: { ar: 'فراولة', en: 'Strawberry' }, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80', stock: 15 },
    ],
  },
  {
    _id: 'prod_002',
    name: { ar: 'آيزوليت بروتين 2 كغ - فانيليا', en: 'Isolate Protein 2kg - Vanilla' },
    description: { ar: 'بروتين معزول نقي 100% مع نكهة الفانيليا', en: '100% pure isolate protein with vanilla flavor' },
    price: 95000,
    images: ['https://images.unsplash.com/photo-1593095948071-1c5b05babc9c?w=500&q=80'],
    category: 'cat_001',
    subcategory: 'sub_001',
    featured: true,
    stock: 40,
    isActive: true,
    isOnSale: false,
    salePrice: null,
    isOutOfStock: true,
    flavors: [],
  },
  {
    _id: 'prod_003',
    name: { ar: 'كرياتين مونوهيدرات 300غ', en: 'Creatine Monohydrate 300g' },
    description: { ar: 'كرياتين نقي لزيادة القوة والأداء', en: 'Pure creatine for increased strength and performance' },
    price: 25000,
    images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&q=80'],
    category: 'cat_001',
    subcategory: 'sub_002',
    featured: true,
    stock: 100,
    isActive: true,
    isOnSale: false,
    salePrice: null,
    isOutOfStock: false,
    flavors: [],
  },
  {
    _id: 'prod_004',
    name: { ar: 'BCAA 2:1:1 - 500 قرص', en: 'BCAA 2:1:1 - 500 Tablets' },
    description: { ar: 'أحماض أمينية متفرعة السلسلة لتعافي العضلات', en: 'Branched-chain amino acids for muscle recovery' },
    price: 35000,
    images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80'],
    category: 'cat_001',
    subcategory: 'sub_003',
    featured: false,
    stock: 60,
    isActive: true,
    isOnSale: false,
    salePrice: null,
    isOutOfStock: false,
    flavors: [],
  },
  {
    _id: 'prod_005',
    name: { ar: 'مالتي فيتامين للرياضيين', en: 'Multi-Vitamin for Athletes' },
    description: { ar: 'مجموعة فيتامينات ومعادن أساسية للرياضيين', en: 'Essential vitamins and minerals for athletes' },
    price: 18000,
    images: ['https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500&q=80'],
    category: 'cat_001',
    subcategory: 'sub_004',
    featured: false,
    stock: 80,
    isActive: true,
    isOnSale: false,
    salePrice: null,
    isOutOfStock: false,
    flavors: [],
  },
  {
    _id: 'prod_006',
    name: { ar: 'بري ووركاوت C4 - 30 حصة', en: 'Pre-Workout C4 - 30 Servings' },
    description: { ar: 'مكمل قبل التمرين لطاقة فائقة وتركيز', en: 'Pre-workout supplement for extreme energy and focus' },
    price: 42000,
    images: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80'],
    category: 'cat_001',
    subcategory: 'sub_005',
    featured: true,
    stock: 35,
    isActive: true,
    isOnSale: false,
    salePrice: null,
    isOutOfStock: false,
    flavors: [],
  },
  {
    _id: 'prod_007',
    name: { ar: 'أوميغا 3 - 100 كبسولة', en: 'Omega 3 - 100 Capsules' },
    description: { ar: 'أحماض دهنية أساسية لصحة القلب والمفاصل', en: 'Essential fatty acids for heart and joint health' },
    price: 22000,
    images: ['https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=500&q=80'],
    category: 'cat_002',
    subcategory: 'sub_007',
    featured: false,
    stock: 70,
    isActive: true,
    isOnSale: false,
    salePrice: null,
    isOutOfStock: false,
    flavors: [],
  },
  {
    _id: 'prod_008',
    name: { ar: 'كارنتين L-Carnitine - 60 كبسولة', en: 'L-Carnitine - 60 Capsules' },
    description: { ar: 'يساعد في حرق الدهون وإنتاج الطاقة', en: 'Helps burn fat and produce energy' },
    price: 28000,
    images: ['https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=80'],
    category: 'cat_002',
    subcategory: 'sub_008',
    featured: true,
    stock: 45,
    isActive: true,
    isOnSale: false,
    salePrice: null,
    isOutOfStock: false,
    flavors: [],
  },
  {
    _id: 'prod_009',
    name: { ar: 'بكج التنشيف الاحترافي', en: 'Professional Cutting Package' },
    description: { ar: 'بكج كامل يحتوي على بروتين + كارنتين + فيتامينات + شيكر', en: 'Complete package with protein + carnitine + vitamins + shaker' },
    price: 145000,
    images: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80'],
    category: 'cat_003',
    subcategory: 'sub_009',
    featured: true,
    stock: 20,
    isActive: true,
    isOnSale: true,
    salePrice: 125000,
    isOutOfStock: false,
    flavors: [],
  },
  {
    _id: 'prod_010',
    name: { ar: 'بكج التضخيم القصوي', en: 'Extreme Bulking Package' },
    description: { ar: 'بكج كامل للتضخيم: بروتين + كرياتين + كربوهيدرات + أمينو + شيكر', en: 'Complete bulking package: protein + creatine + carbs + amino + shaker' },
    price: 185000,
    images: ['https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=500&q=80'],
    category: 'cat_003',
    subcategory: 'sub_010',
    featured: true,
    stock: 15,
    isActive: true,
    isOnSale: true,
    salePrice: 165000,
    isOutOfStock: false,
    flavors: [],
  },
  {
    _id: 'prod_011',
    name: { ar: 'بكج المبتدئين الأساسي', en: 'Beginner Basic Package' },
    description: { ar: 'بكج اقتصادي للمبتدئين: بروتين + كرياتين + شيكر', en: 'Economical beginner package: protein + creatine + shaker' },
    price: 95000,
    images: ['https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?w=500&q=80'],
    category: 'cat_003',
    subcategory: 'sub_011',
    featured: true,
    stock: 30,
    isActive: true,
    isOnSale: false,
    salePrice: null,
    isOutOfStock: false,
    flavors: [],
  },
  {
    _id: 'prod_012',
    name: { ar: 'جلوتامين 500غ - نكهة ليمون', en: 'Glutamine 500g - Lemon' },
    description: { ar: 'جلوتامين نقي لاستشفاء العضلات والمناعة', en: 'Pure glutamine for muscle recovery and immunity' },
    price: 32000,
    images: ['https://images.unsplash.com/photo-1593095948071-1c5b05babc9c?w=500&q=80'],
    category: 'cat_001',
    subcategory: 'sub_003',
    featured: false,
    stock: 55,
    isActive: true,
    isOnSale: false,
    salePrice: null,
    isOutOfStock: false,
    flavors: [],
  },
  {
    _id: 'prod_013',
    name: { ar: 'زينك + ماغنيسيوم + B6', en: 'ZMA - Zinc + Magnesium + B6' },
    description: { ar: 'مكمل ZMA لجودة النوم واستشفاء العضلات', en: 'ZMA supplement for sleep quality and muscle recovery' },
    price: 15000,
    images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80'],
    category: 'cat_002',
    subcategory: 'sub_006',
    featured: false,
    stock: 90,
    isActive: true,
    isOnSale: false,
    salePrice: null,
    isOutOfStock: false,
    flavors: [],
  },
  {
    _id: 'prod_014',
    name: { ar: 'كازين بروتين 2 كغ - كوكيز', en: 'Casein Protein 2kg - Cookies' },
    description: { ar: 'بروتين كازين بطيء الامتصاص مثالي قبل النوم', en: 'Slow-absorbing casein protein ideal before sleep' },
    price: 78000,
    images: ['https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=500&q=80'],
    category: 'cat_001',
    subcategory: 'sub_001',
    featured: false,
    stock: 25,
    isActive: true,
    isOnSale: false,
    salePrice: null,
    isOutOfStock: false,
    flavors: [],
  },
];

// Settings
export let mockSettings = {
  _id: 'settings_001',
  loyaltyStages: [
    {
      orderNumber: 1,
      rewardType: 'free_delivery',
      rewardValue: 0,
      description: { ar: 'توصيل مجاني للطلب التالي', en: 'Free delivery on next order' },
      expiresInDays: 30,
      freeProductChoice: { type: 'admin' },
    },
    {
      orderNumber: 4,
      rewardType: 'percentage_discount',
      rewardValue: 20,
      description: { ar: 'خصم 20% على طلبك القادم', en: '20% off your next order' },
      expiresInDays: 30,
      freeProductChoice: { type: 'admin' },
    },
    {
      orderNumber: 5,
      rewardType: 'fixed_discount',
      rewardValue: 5000,
      description: { ar: 'خصم 5,000 د.ع على طلبك القادم', en: '5,000 IQD off your next order' },
      expiresInDays: null,
      freeProductChoice: { type: 'admin' },
    },
    {
      orderNumber: 6,
      rewardType: 'free_product',
      rewardValue: 'prod_001',
      description: { ar: 'هدية: بروتين مجاني', en: 'Free protein gift' },
      expiresInDays: null,
      freeProductChoice: { type: 'admin', productId: 'prod_001' },
    },
  ],
  loyaltyCycleReset: null,
  deliveryProvinces: [
    'بغداد', 'البصرة', 'نينوى', 'أربيل', 'السليمانية', 'الأنبار', 'بابل', 'كربلاء',
    'النجف', 'واسط', 'صلاح الدين', 'ديالى', 'كركوك', 'دهوك', 'المثنى', 'القادسية',
    'ذي قار', 'ميسان'
  ],
  deliveryFee: 5000,
  deliveryFeesByProvince: {},
  excludedProvinces: [],
  maintenanceMode: false,
};

// Discount Codes
export const mockDiscountCodes = [
  {
    _id: 'disc_001',
    code: 'FALCON10',
    type: 'percentage',
    value: 10,
    minOrder: 0,
    usageLimit: null,
    usageCount: 0,
    isActive: true,
    validUntil: null,
  },
];

// In-memory orders storage
export let mockOrders: any[] = [];

export function addMockOrder(order: any) {
  const newOrder = {
    _id: generateId(),
    ...order,
    createdAt: new Date().toISOString(),
  };
  mockOrders.push(newOrder);
  return newOrder;
}

export function getMockOrders(userId?: string, guestPhone?: string) {
  if (userId) {
    return mockOrders.filter((o) => o.userId === userId);
  }
  if (guestPhone) {
    return mockOrders.filter((o) => o.guestPhone === guestPhone);
  }
  return mockOrders;
}

// In-memory users storage
export let mockUsers: any[] = [
  {
    _id: 'user_admin',
    phone: '07701234567',
    password: '1234', // plaintext for mock
    name: 'Admin',
    isAdmin: true,
    isActive: true,
    ordersCount: 0,
    loyaltyCycleCount: 0,
    coupons: [],
    createdAt: new Date().toISOString(),
  },
];

export function addMockUser(user: any) {
  const newUser = {
    _id: generateId(),
    isActive: true,
    ordersCount: 0,
    loyaltyCycleCount: 0,
    coupons: [],
    ...user,
    createdAt: new Date().toISOString(),
  };
  mockUsers.push(newUser);
  return newUser;
}

export function findMockUserByPhone(phone: string) {
  return mockUsers.find((u) => u.phone === phone);
}

export function updateMockUser(id: string, updates: any) {
  const index = mockUsers.findIndex((u) => u._id === id);
  if (index !== -1) {
    mockUsers[index] = { ...mockUsers[index], ...updates };
    return mockUsers[index];
  }
  return null;
}

// Delete functions for mock data
export function deleteMockCategory(id: string) {
  const index = mockCategories.findIndex((c) => c._id === id);
  if (index !== -1) {
    mockCategories.splice(index, 1);
    return true;
  }
  return false;
}

export function deleteMockDiscountCode(id: string) {
  const index = mockDiscountCodes.findIndex((d) => d._id === id);
  if (index !== -1) {
    mockDiscountCodes.splice(index, 1);
    return true;
  }
  return false;
}

// Loyalty helpers
export function findMockUserById(id: string) {
  return mockUsers.find((u) => u._id === id);
}

export function addCouponToMockUser(userId: string, coupon: any) {
  const user = findMockUserById(userId);
  if (!user) return null;
  if (!user.coupons) user.coupons = [];
  user.coupons.push(coupon);
  return user;
}

export function markMockCouponUsed(userId: string, code: string) {
  const user = findMockUserById(userId);
  if (!user || !user.coupons) return null;
  const coupon = user.coupons.find((c: any) => c.code === code);
  if (coupon) {
    coupon.isUsed = true;
    coupon.usedAt = new Date().toISOString();
    return coupon;
  }
  return null;
}
