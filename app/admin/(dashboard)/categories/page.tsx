'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Layers, Pencil } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ImageUploader from '@/components/ui/ImageUploader';

interface Category {
  _id: string;
  name: { ar: string; en: string };
  type: string;
  parentCategory?: string;
  sortOrder: number;
}

export default function AdminCategories() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState({
    nameAr: '',
    nameEn: '',
    type: 'main',
    parentCategory: '',
    sortOrder: '0',
    icon: '',
    image: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    fetch('/api/categories', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        setCategories(data.categories || []);
        setLoading(false);
      })
      .catch(console.error);
  };

  const resetForm = () => {
    setForm({ nameAr: '', nameEn: '', type: 'main', parentCategory: '', sortOrder: '0', icon: '', image: '' });
    setEditingCategory(null);
  };

  const openEditForm = (cat: Category) => {
    setEditingCategory(cat);
    setForm({
      nameAr: (cat.name as any).ar || '',
      nameEn: (cat.name as any).en || '',
      type: cat.type || 'main',
      parentCategory: cat.parentCategory || '',
      sortOrder: String(cat.sortOrder ?? 0),
      icon: (cat as any).icon || '',
      image: (cat as any).image || '',
    });
    setShowForm(true);
  };

  const createCategory = async () => {
    if (!form.nameAr.trim()) {
      showToast('أدخل اسم القسم بالعربي', 'error');
      return;
    }
    try {
      const isEditing = !!editingCategory;
      const res = await fetch('/api/categories', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify(
          isEditing
            ? {
                _id: editingCategory._id,
                name: { ar: form.nameAr, en: form.nameEn },
                type: form.type,
                parentCategory: form.parentCategory || null,
                sortOrder: Number(form.sortOrder),
                icon: form.icon,
                image: form.image,
              }
            : {
                name: { ar: form.nameAr, en: form.nameEn },
                type: form.type,
                parentCategory: form.parentCategory || null,
                sortOrder: Number(form.sortOrder),
                icon: form.icon,
                image: form.image,
              }
        ),
      });
      if (res.ok) {
        showToast(isEditing ? 'تم تعديل القسم بنجاح' : 'تم إضافة القسم بنجاح', 'success');
        setShowForm(false);
        resetForm();
        loadData();
      } else {
        const data = await res.json();
        showToast(data.error || 'فشل حفظ القسم', 'error');
      }
    } catch {
      showToast('حدث خطأ أثناء حفظ القسم', 'error');
    }
  };

  const openDeleteDialog = (cat: Category) => {
    setSelectedCategory(cat);
    setDialogOpen(true);
  };

  const deleteCategory = async () => {
    if (!selectedCategory) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/categories?id=${selectedCategory._id}`, { method: 'DELETE', cache: 'no-store' });
      if (res.ok) {
        showToast('تم حذف القسم بنجاح', 'success');
        loadData();
      } else {
        showToast('فشل حذف القسم', 'error');
      }
    } catch {
      showToast('فشل حذف القسم', 'error');
    }
    setDeleteLoading(false);
    setDialogOpen(false);
    setSelectedCategory(null);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-10 bg-gray-100 rounded w-40 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const mainCategories = categories.filter((c) => c.type === 'main');
  const subCategories = categories.filter((c) => c.type === 'sub');

  return (
    <div className="space-y-8">
      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={dialogOpen}
        onClose={() => { setDialogOpen(false); setSelectedCategory(null); }}
        onConfirm={deleteCategory}
        title="حذف القسم"
        description={`هل أنت متأكد من حذف القسم "${selectedCategory ? (selectedCategory.name as any).ar : ''}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        isLoading={deleteLoading}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-falcon-dark flex items-center gap-3">
            <Layers className="w-8 h-8 text-falcon-blue" />
            الأقسام
          </h1>
          <p className="text-gray-400 text-sm mt-1">{categories.length} قسم</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
          className="flex items-center gap-2 px-6 py-3 bg-falcon-blue text-white font-bold rounded-xl hover:bg-falcon-blueDark transition-all shadow-lg shadow-falcon-blue/25"
        >
          <Plus className="w-5 h-5" />
          إضافة قسم
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
            <h2 className="text-xl font-bold text-falcon-dark">{editingCategory ? 'تعديل القسم' : 'إضافة قسم جديد'}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input placeholder="اسم القسم (عربي)" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} className="input-field" />
              <input placeholder="Category Name (English)" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className="input-field" />
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
                <option value="main">رئيسي</option>
                <option value="sub">فرعي</option>
              </select>
              <input placeholder="الترتيب" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className="input-field" />
              <input placeholder="اسم الأيقونة (اختياري)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="input-field" />
              {form.type === 'sub' && (
                <select value={form.parentCategory} onChange={(e) => setForm({ ...form, parentCategory: e.target.value })} className="input-field sm:col-span-2">
                  <option value="">اختر القسم الرئيسي</option>
                  {mainCategories.map((c) => (
                    <option key={c._id} value={c._id}>{(c.name as any).ar}</option>
                  ))}
                </select>
              )}
            </div>
            <ImageUploader
              images={form.image ? [form.image] : []}
              onChange={(images) => setForm({ ...form, image: images[0] || '' })}
              multiple={false}
              label="صورة القسم (اختياري)"
            />
            <button onClick={createCategory} className="btn-primary">
              {editingCategory ? (
                <><Pencil className="w-5 h-5 inline-block ml-2" />حفظ التعديلات</>
              ) : (
                <><Plus className="w-5 h-5 inline-block ml-2" />حفظ القسم</>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Categories */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-falcon-dark">الأقسام الرئيسية</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mainCategories.map((cat, index) => (
            <motion.div 
              key={cat._id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg hover:border-falcon-blue/20 transition-all duration-300 p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-falcon-dark font-bold text-lg">{(cat.name as any).ar}</h3>
                  <p className="text-gray-400 text-sm mt-1">{(cat.name as any).en}</p>
                  <span className="inline-block mt-3 px-3 py-1 bg-falcon-bluePale text-falcon-blue text-xs font-bold rounded-lg">
                    رئيسي
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => openEditForm(cat)}
                    className="p-2 text-gray-400 hover:text-falcon-blue hover:bg-falcon-bluePale rounded-xl transition-all"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => openDeleteDialog(cat)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sub Categories */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-falcon-dark">الأقسام الفرعية</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subCategories.map((cat, index) => (
            <motion.div 
              key={cat._id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg hover:border-falcon-blue/20 transition-all duration-300 p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-falcon-dark font-bold text-lg">{(cat.name as any).ar}</h3>
                  <p className="text-gray-400 text-sm mt-1">{(cat.name as any).en}</p>
                  <span className="inline-block mt-3 px-3 py-1 bg-falcon-gold/20 text-falcon-gold text-xs font-bold rounded-lg">
                    فرعي
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => openEditForm(cat)}
                    className="p-2 text-gray-400 hover:text-falcon-blue hover:bg-falcon-bluePale rounded-xl transition-all"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => openDeleteDialog(cat)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
