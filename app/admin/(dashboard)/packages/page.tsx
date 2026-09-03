'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, X, Check, Gift, Package, ArrowUpRight, TrendingUp, Search } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ImageUploader from '@/components/ui/ImageUploader';

interface PackageItem {
  _id: string;
  name: { ar: string; en: string };
  description?: { ar: string; en: string };
  images?: string[];
  products: { productId: string; name: { ar: string; en: string }; quantity: number; originalPrice: number; discount: number }[];
  totalOriginalPrice: number;
  finalPrice: number;
  isActive: boolean;
  featured: boolean;
}

interface Product {
  _id: string;
  name: { ar: string; en: string };
  price: number;
  category?: string;
  subcategory?: string;
}

interface Category {
  _id: string;
  name: { ar: string; en: string };
  type: 'main' | 'sub';
  parentCategory?: string;
}

export default function AdminPackages() {
  const { showToast } = useToast();
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null);
  const [form, setForm] = useState({
    nameAr: '',
    nameEn: '',
    descAr: '',
    descEn: '',
    images: [] as string[],
    featured: false,
    finalPrice: '',
    selectedProducts: [] as { productId: string; quantity: number; discount: number }[],
  });
  const [editingPackage, setEditingPackage] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    Promise.all([
      fetch('/api/packages').then((r) => r.json()),
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ])
      .then(([pkgs, prods, cats]) => {
        setPackages(pkgs.packages || []);
        setProducts(prods.products || []);
        setCategories(cats.categories || []);
        setLoading(false);
      })
      .catch(console.error);
  };

  const addProductToPackage = (productId: string) => {
    if (form.selectedProducts.find((p) => p.productId === productId)) return;
    setForm({
      ...form,
      selectedProducts: [...form.selectedProducts, { productId, quantity: 1, discount: 0 }],
    });
  };

  const removeProductFromPackage = (productId: string) => {
    setForm({
      ...form,
      selectedProducts: form.selectedProducts.filter((p) => p.productId !== productId),
    });
  };

  const calculatePrices = () => {
    let total = 0;
    form.selectedProducts.forEach((sp) => {
      const prod = products.find((p) => p._id === sp.productId);
      if (prod) {
        total += prod.price * sp.quantity;
      }
    });
    return Math.round(total);
  };

  const createPackage = async () => {
    const totalOriginalPrice = calculatePrices();
    const finalPrice = Number(form.finalPrice);
    
    if (finalPrice > totalOriginalPrice) {
      showToast('السعر النهائي يجب أن يكون أقل من أو يساوي السعر الأصلي', 'error');
      return;
    }

    const packageProducts = form.selectedProducts.map((sp) => {
      const prod = products.find((p) => p._id === sp.productId);
      return {
        productId: sp.productId,
        name: prod?.name || { ar: '', en: '' },
        quantity: sp.quantity,
        originalPrice: prod?.price || 0,
        discount: sp.discount,
      };
    });

    const res = await fetch('/api/packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: { ar: form.nameAr, en: form.nameEn },
        description: { ar: form.descAr, en: form.descEn },
        images: form.images,
        products: packageProducts,
        totalOriginalPrice,
        finalPrice,
        featured: form.featured,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setShowForm(false);
      resetForm();
      loadData();
    } else {
      alert(data.error || 'حدث خطأ');
    }
  };

  const openDeleteDialog = (pkg: PackageItem) => {
    setSelectedPackage(pkg);
    setDialogOpen(true);
  };

  const deletePackage = async () => {
    if (!selectedPackage) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/packages?id=${selectedPackage._id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('تم حذف البكج بنجاح', 'success');
        loadData();
      } else {
        showToast('فشل حذف البكج', 'error');
      }
    } catch {
      showToast('فشل حذف البكج', 'error');
    }
    setDeleteLoading(false);
    setDialogOpen(false);
    setSelectedPackage(null);
  };

  const resetForm = () => {
    setForm({ nameAr: '', nameEn: '', descAr: '', descEn: '', images: [], featured: false, finalPrice: '', selectedProducts: [] });
    setEditingPackage(null);
    setSearchQuery('');
    setSelectedCategory('');
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="h-10 bg-gray-100 rounded w-48 animate-pulse" />
          <div className="h-12 bg-gray-100 rounded w-36 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 animate-pulse h-48" />
          ))}
        </div>
      </div>
    );
  }

  const mainCategories = categories.filter((c) => c.type === 'main');
  const subCategories = categories.filter((c) => c.type === 'sub');

  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      searchQuery === '' ||
      (prod.name.ar || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.name.en || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === '' ||
      prod.category === selectedCategory ||
      prod.subcategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalOriginalPrice = calculatePrices();
  const finalPrice = Number(form.finalPrice) || 0;
  const savings = totalOriginalPrice - finalPrice;

  return (
    <div className="space-y-8">
      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={dialogOpen}
        onClose={() => { setDialogOpen(false); setSelectedPackage(null); }}
        onConfirm={deletePackage}
        title="حذف البكج"
        description={`هل أنت متأكد من حذف البكج "${selectedPackage ? selectedPackage.name.ar : ''}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        isLoading={deleteLoading}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-falcon-dark flex items-center gap-3">
            <Gift className="w-8 h-8 text-falcon-gold" />
            البكجات والعروض
          </h1>
          <p className="text-gray-400 text-sm mt-1">{packages.length} بكج</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
          className="flex items-center gap-2 px-6 py-3 bg-falcon-blue text-white font-bold rounded-xl hover:bg-falcon-blueDark transition-all shadow-lg shadow-falcon-blue/25"
        >
          <Plus className="w-5 h-5" />
          {showForm ? 'إغلاق' : 'إضافة بكج'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="h-1 bg-gradient-to-r from-falcon-gold to-falcon-goldLight" />
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold text-falcon-dark">
              {editingPackage ? 'تعديل بكج' : 'إضافة بكج جديد'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input placeholder="اسم البكج (عربي)" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} className="input-field" />
              <input placeholder="Package Name (English)" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className="input-field" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <textarea placeholder="الوصف (عربي)" value={form.descAr} onChange={(e) => setForm({ ...form, descAr: e.target.value })} rows={2} className="input-field resize-none" />
              <textarea placeholder="Description (English)" value={form.descEn} onChange={(e) => setForm({ ...form, descEn: e.target.value })} rows={2} className="input-field resize-none" />
            </div>
            <ImageUploader
              images={form.images}
              onChange={(images) => setForm({ ...form, images })}
              multiple
              label="صور البكج"
              width={1200}
              height={675}
            />

            <label className="flex items-center gap-2 text-gray-600 text-sm cursor-pointer hover:text-falcon-blue transition-colors">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-5 h-5 rounded border-gray-300 text-falcon-blue focus:ring-falcon-blue" />
              <span className="font-medium">مميز (يظهر في الصفحة الرئيسية)</span>
            </label>

            {/* Product Selection */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-4">
              <h3 className="font-bold text-falcon-dark">اختيار المنتجات</h3>

              {/* Search */}
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث عن منتج..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pr-12 w-full"
                />
              </div>

              {/* Categories */}
              <div className="bg-white border border-gray-100 rounded-xl p-3 space-y-3">
                {/* Main Categories */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      !selectedCategory ? 'bg-falcon-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    الكل
                  </button>
                  {mainCategories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => setSelectedCategory(cat._id)}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === cat._id ? 'bg-falcon-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {(cat.name as any).ar}
                    </button>
                  ))}
                </div>

                {/* Sub Categories */}
                {subCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                    <span className="text-gray-400 text-sm py-2">الأقسام الفرعية:</span>
                    {subCategories.map((sub) => (
                      <button
                        key={sub._id}
                        onClick={() => setSelectedCategory(sub._id)}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                          selectedCategory === sub._id ? 'bg-falcon-gold text-falcon-dark' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {(sub.name as any).ar}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Products List */}
              <div className="max-h-56 overflow-y-auto space-y-2">
                {filteredProducts.length === 0 ? (
                  <p className="text-center text-gray-400 py-6">لا توجد منتجات مطابقة</p>
                ) : (
                  filteredProducts.map((prod) => {
                    const selected = form.selectedProducts.find((p) => p.productId === prod._id);
                    return (
                      <div key={prod._id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => selected ? removeProductFromPackage(prod._id) : addProductToPackage(prod._id)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${selected ? 'bg-red-500 text-white shadow-md' : 'bg-falcon-blue text-white shadow-md'}`}
                          >
                            {selected ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                          </button>
                          <span className="text-sm font-medium text-falcon-dark">{(prod.name as any).ar}</span>
                          <span className="text-sm text-gray-500">{prod.price.toLocaleString()} د.ع</span>
                        </div>
                        {selected && (
                          <div className="flex items-center gap-2">
                            <input type="number" min={1} value={selected.quantity} onChange={(e) => {
                              const updated = form.selectedProducts.map((p) =>
                                p.productId === prod._id ? { ...p, quantity: Number(e.target.value) } : p
                              );
                              setForm({ ...form, selectedProducts: updated });
                            }} className="w-16 px-2 py-1 bg-white border border-gray-200 rounded-lg text-center text-sm" />
                            <input type="number" min={0} max={99} value={selected.discount} onChange={(e) => {
                              const updated = form.selectedProducts.map((p) =>
                                p.productId === prod._id ? { ...p, discount: Number(e.target.value) } : p
                              );
                              setForm({ ...form, selectedProducts: updated });
                            }} className="w-20 px-2 py-1 bg-white border border-gray-200 rounded-lg text-center text-sm" placeholder="خصم %" />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Price Summary */}
            {form.selectedProducts.length > 0 && (
              <div className="p-6 bg-gradient-to-r from-falcon-blue/10 to-falcon-gold/10 border border-falcon-blue/20 rounded-2xl space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">السعر الأصلي (مجموع المنتجات):</span>
                  <span className="font-bold text-falcon-dark">{totalOriginalPrice.toLocaleString()} د.ع</span>
                </div>
                <div className="border-t border-gray-200/50 pt-3">
                  <label className="text-falcon-dark font-bold text-sm mb-2 block">السعر النهائي للبكج</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={form.finalPrice}
                      onChange={(e) => setForm({ ...form, finalPrice: e.target.value })}
                      placeholder="أدخل السعر النهائي"
                      className="input-field flex-1"
                    />
                    <span className="text-gray-500 font-medium">د.ع</span>
                  </div>
                  {finalPrice > totalOriginalPrice && (
                    <p className="text-red-500 text-xs mt-2">السعر النهائي يجب أن يكون أقل من أو يساوي {totalOriginalPrice.toLocaleString()} د.ع</p>
                  )}
                </div>
                {savings > 0 && (
                  <div className="flex items-center justify-between text-sm bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                    <span className="text-emerald-600 font-medium">التوفير للعميل:</span>
                    <span className="text-emerald-600 font-bold">{savings.toLocaleString()} د.ع ({Math.round((savings / totalOriginalPrice) * 100)}%)</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={createPackage} disabled={form.selectedProducts.length === 0 || !form.nameAr || !form.finalPrice || Number(form.finalPrice) > totalOriginalPrice} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                <Check className="w-5 h-5" />حفظ البكج
              </button>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2">
                <X className="w-5 h-5" />إلغاء
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {packages.map((pkg, index) => (
          <motion.div 
            key={pkg._id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg hover:border-falcon-blue/20 transition-all duration-300 overflow-hidden"
          >
            <div className="h-1 bg-gradient-to-r from-falcon-gold to-falcon-goldLight" />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-falcon-dark text-lg flex items-center gap-2">
                    {(pkg.name as any).ar}
                    {pkg.featured && <span className="px-2 py-1 bg-falcon-gold text-falcon-dark text-xs font-bold rounded-lg">مميز</span>}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">{(pkg.description as any)?.ar}</p>
                </div>
                <button onClick={() => openDeleteDialog(pkg)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2 mb-4">
                {pkg.products?.map((p: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-sm py-2 border-b border-gray-50">
                    <span className="text-falcon-dark font-medium">{p.name?.ar} × {p.quantity}</span>
                    <span className="text-gray-500">{p.originalPrice.toLocaleString()} د.ع</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 line-through text-sm">{pkg.totalOriginalPrice?.toLocaleString()}</span>
                  <span className="text-falcon-blue font-bold text-xl">{pkg.finalPrice?.toLocaleString()} د.ع</span>
                </div>
                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg border border-emerald-200">
                  توفير {Math.round(((pkg.totalOriginalPrice - pkg.finalPrice) / pkg.totalOriginalPrice) * 100)}%
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
