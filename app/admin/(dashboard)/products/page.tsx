'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit, X, Check, Star, Tag, ImageIcon, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ImageUploader from '@/components/ui/ImageUploader';

interface ProductFlavor {
  name: { ar: string; en: string };
  image: string;
  stock: number;
}

interface Product {
  _id: string;
  name: { ar: string; en: string };
  description?: { ar: string; en: string };
  price: number;
  stock: number;
  isActive: boolean;
  isOnSale: boolean;
  salePrice?: number;
  featured: boolean;
  category: string;
  subcategory?: string;
  images?: string[];
  flavors?: ProductFlavor[];
  isOutOfStock?: boolean;
}

interface Category {
  _id: string;
  name: { ar: string; en: string };
  type: string;
  parentCategory?: string;
}

export default function AdminProducts() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    nameAr: '',
    nameEn: '',
    descAr: '',
    descEn: '',
    price: '',
    stock: '100',
    category: '',
    subcategory: '',
    images: [] as string[],
    isOnSale: false,
    salePrice: '',
    featured: false,
    isOutOfStock: false,
    flavors: [] as ProductFlavor[],
  });
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [subcategorySearch, setSubcategorySearch] = useState('');
  const [showSubSuggestions, setShowSubSuggestions] = useState(false);
  const subInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    Promise.all([
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ])
      .then(([prods, cats]) => {
        setProducts(prods.products || []);
        setCategories(cats.categories || []);
        setLoading(false);
      })
      .catch(console.error);
  };

  const mainCategories = categories.filter((c) => c.type === 'main');
  const subCategories = categories.filter((c) => c.type === 'sub');

  const filteredSubCategories = subcategorySearch
    ? subCategories.filter((c) =>
        (c.name as any).ar.toLowerCase().includes(subcategorySearch.toLowerCase())
      )
    : subCategories;

  const createProduct = async () => {
    if (!form.nameAr.trim()) {
      showToast('أدخل اسم المنتج بالعربي', 'error');
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      showToast('أدخل سعر صحيح', 'error');
      return;
    }
    if (!form.category) {
      showToast('اختر القسم', 'error');
      return;
    }
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: { ar: form.nameAr, en: form.nameEn },
          description: { ar: form.descAr, en: form.descEn },
          price: Number(form.price),
          stock: Number(form.stock),
          category: form.category,
          subcategory: form.subcategory || '',
          images: form.images,
          isOnSale: form.isOnSale,
          salePrice: form.salePrice ? Number(form.salePrice) : null,
          featured: form.featured,
          isOutOfStock: form.isOutOfStock,
          flavors: form.flavors,
        }),
      });
      if (res.ok) {
        showToast('تم إضافة المنتج بنجاح', 'success');
        setShowForm(false);
        resetForm();
        loadData();
      } else {
        const data = await res.json();
        showToast(data.error || 'فشل إضافة المنتج', 'error');
      }
    } catch {
      showToast('حدث خطأ أثناء إضافة المنتج', 'error');
    }
  };

  const updateProduct = async () => {
    try {
      const res = await fetch('/api/products/manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _id: editingProduct._id,
          name: { ar: form.nameAr, en: form.nameEn },
          description: { ar: form.descAr, en: form.descEn },
          price: Number(form.price),
          stock: Number(form.stock),
          category: form.category,
          subcategory: form.subcategory || '',
          images: form.images,
          isOnSale: form.isOnSale,
          salePrice: form.salePrice ? Number(form.salePrice) : null,
          featured: form.featured,
          isOutOfStock: form.isOutOfStock,
          flavors: form.flavors,
        }),
      });
      if (res.ok) {
        showToast('تم تحديث المنتج بنجاح', 'success');
        setShowForm(false);
        setEditingProduct(null);
        resetForm();
        loadData();
      } else {
        const data = await res.json();
        showToast(data.error || 'فشل تحديث المنتج', 'error');
      }
    } catch {
      showToast('حدث خطأ أثناء تحديث المنتج', 'error');
    }
  };

  const toggleOutOfStock = async (product: Product) => {
    const res = await fetch('/api/products/manage', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _id: product._id,
        isOutOfStock: !product.isOutOfStock,
      }),
    });
    if (res.ok) {
      showToast(product.isOutOfStock ? 'تم تفعيل المنتج' : 'تم تعطيل المنتج (نفذت الكمية)', 'success');
      loadData();
    } else {
      showToast('فشل تحديث الحالة', 'error');
    }
  };

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const deleteProduct = async () => {
    if (!selectedProduct) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/products/manage?id=${selectedProduct._id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('تم حذف المنتج بنجاح', 'success');
        loadData();
      } else {
        showToast('فشل حذف المنتج', 'error');
      }
    } catch {
      showToast('فشل حذف المنتج', 'error');
    }
    setDeleteLoading(false);
    setDialogOpen(false);
    setSelectedProduct(null);
  };

  const editProduct = (product: any) => {
    setEditingProduct(product);
    setForm({
      nameAr: product.name.ar || '',
      nameEn: product.name.en || '',
      descAr: product.description?.ar || '',
      descEn: product.description?.en || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category || '',
      subcategory: product.subcategory || '',
      images: product.images || [],
      isOnSale: product.isOnSale || false,
      salePrice: product.salePrice ? product.salePrice.toString() : '',
      featured: product.featured || false,
      isOutOfStock: product.isOutOfStock || false,
      flavors: product.flavors || [],
    });
    setSubcategorySearch(product.subcategory ? subCategories.find(c => c._id === product.subcategory)?.name?.ar || '' : '');
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({
      nameAr: '', nameEn: '', descAr: '', descEn: '', price: '', stock: '100',
      category: '', subcategory: '', images: [], isOnSale: false, salePrice: '', featured: false,
      isOutOfStock: false, flavors: [],
    });
    setSubcategorySearch('');
  };

  const addFlavor = () => {
    setForm({
      ...form,
      flavors: [...form.flavors, { name: { ar: '', en: '' }, image: '', stock: 0 }],
    });
  };

  const updateFlavor = (index: number, field: string, value: any) => {
    const newFlavors = [...form.flavors];
    if (field === 'nameAr') newFlavors[index].name.ar = value;
    else if (field === 'nameEn') newFlavors[index].name.en = value;
    else if (field === 'stock') newFlavors[index].stock = Number(value) || 0;
    setForm({ ...form, flavors: newFlavors });
  };

  const updateFlavorImage = (index: number, images: string[]) => {
    const newFlavors = [...form.flavors];
    newFlavors[index].image = images[0] || '';
    setForm({ ...form, flavors: newFlavors });
  };

  const removeFlavor = (index: number) => {
    setForm({ ...form, flavors: form.flavors.filter((_, i) => i !== index) });
  };

  const salePercentage = form.isOnSale && form.price && form.salePrice
    ? Math.round(((Number(form.price) - Number(form.salePrice)) / Number(form.price)) * 100)
    : 0;

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="h-10 bg-gray-100 rounded w-40 animate-pulse" />
          <div className="h-12 bg-gray-100 rounded w-36 animate-pulse" />
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 animate-pulse">
          <div className="h-8 bg-gray-100 rounded w-full" />
          <div className="h-32 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={dialogOpen}
        onClose={() => { setDialogOpen(false); setSelectedProduct(null); }}
        onConfirm={deleteProduct}
        title="حذف المنتج"
        description={`هل أنت متأكد من حذف المنتج "${selectedProduct ? selectedProduct.name.ar : ''}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        isLoading={deleteLoading}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-falcon-dark">المنتجات</h1>
          <p className="text-gray-400 text-sm mt-1">{products.length} منتج</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); if (showForm) { setEditingProduct(null); resetForm(); } }}
          className="flex items-center gap-2 px-6 py-3 bg-falcon-blue text-white font-bold rounded-xl hover:bg-falcon-blueDark transition-all shadow-lg shadow-falcon-blue/25"
        >
          <Plus className="w-5 h-5" />
          {showForm ? 'إغلاق' : 'إضافة منتج'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="h-1 bg-gradient-to-r from-falcon-blue to-falcon-blueLight" />
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold text-falcon-dark">
              {editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input placeholder="اسم المنتج (عربي)" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} className="input-field" />
              <input placeholder="Product Name (English)" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className="input-field" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <textarea placeholder="الوصف (عربي)" value={form.descAr} onChange={(e) => setForm({ ...form, descAr: e.target.value })} rows={3} className="input-field resize-none" />
              <textarea placeholder="Description (English)" value={form.descEn} onChange={(e) => setForm({ ...form, descEn: e.target.value })} rows={3} className="input-field resize-none" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <input placeholder="السعر" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" />
              <input placeholder="الكمية" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input-field" />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                <option value="">اختر القسم الرئيسي</option>
                {mainCategories.map((c) => (<option key={c._id} value={c._id}>{(c.name as any).ar}</option>))}
              </select>
              <div className="relative">
                <input ref={subInputRef} placeholder="القسم الفرعي (اكتب للبحث)" value={subcategorySearch} onChange={(e) => { setSubcategorySearch(e.target.value); setShowSubSuggestions(true); }} onFocus={() => setShowSubSuggestions(true)} className="input-field w-full" />
                {showSubSuggestions && filteredSubCategories.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {filteredSubCategories.map((c) => (
                      <button key={c._id} onClick={() => { setForm({ ...form, subcategory: c._id }); setSubcategorySearch((c.name as any).ar); setShowSubSuggestions(false); }} className="w-full text-right px-4 py-2 hover:bg-falcon-bluePale text-sm text-falcon-dark">
                        {(c.name as any).ar}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <ImageUploader
              images={form.images}
              onChange={(images) => setForm({ ...form, images })}
              multiple
              label="صور المنتج"
            />

            <div className="flex flex-wrap gap-6 items-start">
              <label className="flex items-center gap-2 text-gray-600 text-sm cursor-pointer hover:text-falcon-blue transition-colors">
                <input type="checkbox" checked={form.isOnSale} onChange={(e) => setForm({ ...form, isOnSale: e.target.checked, salePrice: e.target.checked ? form.salePrice : '' })} className="w-5 h-5 rounded border-gray-300 text-falcon-blue focus:ring-falcon-blue" />
                <Tag className="w-5 h-5 text-red-500" />
                <span className="font-medium">تخفيض</span>
              </label>
              <label className="flex items-center gap-2 text-gray-600 text-sm cursor-pointer hover:text-falcon-blue transition-colors">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-5 h-5 rounded border-gray-300 text-falcon-blue focus:ring-falcon-blue" />
                <Star className="w-5 h-5 text-falcon-gold" />
                <span className="font-medium">مميز (يظهر في الصفحة الرئيسية)</span>
              </label>
              <label className="flex items-center gap-2 text-red-600 text-sm cursor-pointer hover:text-red-700 transition-colors">
                <input type="checkbox" checked={form.isOutOfStock} onChange={(e) => setForm({ ...form, isOutOfStock: e.target.checked })} className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">نفذت الكمية</span>
              </label>
            </div>

            {form.isOnSale && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-6 bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-2xl space-y-4">
                <h3 className="font-bold text-red-600">إعدادات التخفيض</h3>
                <div className="flex items-center gap-4">
                  <input placeholder="السعر بعد التخفيض" type="number" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} className="input-field w-48" />
                  {salePercentage > 0 && (
                    <span className="px-4 py-2 bg-red-500 text-white rounded-xl text-lg font-bold shadow-lg shadow-red-500/30">
                      خصم {salePercentage}%
                    </span>
                  )}
                </div>
                {form.price && form.salePrice && (
                  <p className="text-sm text-gray-600">
                    السعر الأصلي: <span className="line-through text-gray-400">{Number(form.price).toLocaleString()}</span> د.ع → 
                    السعر الجديد: <span className="text-red-600 font-bold text-lg">{Number(form.salePrice).toLocaleString()}</span> د.ع
                  </p>
                )}
              </motion.div>
            )}

            {/* Flavors Section */}
            <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-falcon-dark">النكهات / الأنواع</h3>
                <button
                  type="button"
                  onClick={addFlavor}
                  className="flex items-center gap-1 px-4 py-2 bg-falcon-blue text-white text-sm font-bold rounded-xl hover:bg-falcon-blueDark transition-all"
                >
                  <Plus className="w-4 h-4" />
                  إضافة نكهة
                </button>
              </div>

              {form.flavors.length === 0 && (
                <p className="text-sm text-gray-500">لا توجد نكهات. يمكنك إضافة نكهات مثل (شوكولاتة، فانيليا، فراولة...)</p>
              )}

              <div className="space-y-4">
                {form.flavors.map((flavor, index) => (
                  <div key={index} className="p-4 bg-white border border-gray-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-700">نكهة #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeFlavor(index)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        placeholder="اسم النكهة (عربي)"
                        value={flavor.name.ar}
                        onChange={(e) => updateFlavor(index, 'nameAr', e.target.value)}
                        className="input-field"
                      />
                      <input
                        placeholder="Flavor Name (English)"
                        value={flavor.name.en}
                        onChange={(e) => updateFlavor(index, 'nameEn', e.target.value)}
                        className="input-field"
                      />
                      <input
                        placeholder="الكمية"
                        type="number"
                        value={flavor.stock}
                        onChange={(e) => updateFlavor(index, 'stock', e.target.value)}
                        className="input-field"
                      />
                    </div>
                    <ImageUploader
                      images={flavor.image ? [flavor.image] : []}
                      onChange={(images) => updateFlavorImage(index, images)}
                      multiple={false}
                      label="صورة النكهة"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={editingProduct ? updateProduct : createProduct} className="btn-primary flex items-center gap-2">
                <Check className="w-5 h-5" />
                {editingProduct ? 'تحديث المنتج' : 'حفظ المنتج'}
              </button>
              <button onClick={() => { setShowForm(false); setEditingProduct(null); resetForm(); }} className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2">
                <X className="w-5 h-5" />إلغاء
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Products Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-falcon-bluePale/50 text-falcon-dark text-sm">
                <th className="text-right py-4 px-6 font-medium">المنتج</th>
                <th className="text-right py-4 px-6 font-medium">السعر</th>
                <th className="text-right py-4 px-6 font-medium">الكمية</th>
                <th className="text-right py-4 px-6 font-medium">الحالة</th>
                <th className="text-right py-4 px-6 font-medium">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <motion.tr 
                  key={product._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-50 hover:bg-falcon-bluePale/30 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-falcon-dark">{(product.name as any).ar}</span>
                      {product.featured && <Star className="w-5 h-5 text-falcon-gold fill-falcon-gold" />}
                      {product.isOutOfStock && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-lg">
                          نفذت الكمية
                        </span>
                      )}
                      {(product.flavors?.length || 0) > 0 && (
                        <span className="px-2 py-0.5 bg-falcon-blue text-white text-xs font-bold rounded-lg">
                          {product.flavors?.length} نكهة
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {product.isOnSale && product.salePrice ? (
                      <div className="flex items-center gap-3">
                        <span className="text-falcon-blue font-bold text-lg">{product.salePrice.toLocaleString()}</span>
                        <span className="text-gray-400 line-through text-sm">{product.price.toLocaleString()}</span>
                        <span className="px-2 py-1 bg-red-500 text-white rounded-lg text-xs font-bold shadow-md">
                          {Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                        </span>
                      </div>
                    ) : (
                      <span className="font-medium">{product.price.toLocaleString()} د.ع</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-gray-600">{product.stock}</td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => toggleOutOfStock(product)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        product.isOutOfStock
                          ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {product.isOutOfStock ? 'نفذت الكمية' : 'نشط'}
                    </button>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <button onClick={() => editProduct(product)} className="p-2 text-gray-400 hover:text-falcon-blue hover:bg-falcon-blue/10 rounded-xl transition-all">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={() => openDeleteDialog(product)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
