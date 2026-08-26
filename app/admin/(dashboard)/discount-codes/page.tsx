'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Tag, Percent, DollarSign } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface DiscountCode {
  _id: string;
  code: string;
  type: string;
  value: number;
  isActive: boolean;
  usageCount: number;
}

export default function AdminDiscountCodes() {
  const { showToast } = useToast();
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<DiscountCode | null>(null);
  const [form, setForm] = useState({
    code: '',
    type: 'percentage',
    value: '',
    minOrder: '0',
    usageLimit: '',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    fetch('/api/discount-codes')
      .then((r) => r.json())
      .then((data) => {
        setCodes(data.codes || []);
        setLoading(false);
      })
      .catch(console.error);
  };

  const createCode = async () => {
    if (!form.code.trim() || !form.value) {
      showToast('أدخل الكود والقيمة', 'error');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/discount-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code,
          type: form.type,
          value: Number(form.value),
          minOrder: Number(form.minOrder) || 0,
          usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
          isActive: true,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('تم إنشاء كود الخصم بنجاح', 'success');
        setShowForm(false);
        setForm({ code: '', type: 'percentage', value: '', minOrder: '0', usageLimit: '' });
        loadData();
      } else {
        showToast(data.error || 'فشل إنشاء الكود', 'error');
      }
    } catch {
      showToast('حدث خطأ في الاتصال', 'error');
    }
    setCreating(false);
  };

  const openDeleteDialog = (code: DiscountCode) => {
    setSelectedCode(code);
    setDialogOpen(true);
  };

  const deleteCode = async () => {
    if (!selectedCode) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/discount-codes?id=${selectedCode._id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('تم حذف كود الخصم بنجاح', 'success');
        loadData();
      } else {
        showToast('فشل حذف كود الخصم', 'error');
      }
    } catch {
      showToast('فشل حذف كود الخصم', 'error');
    }
    setDeleteLoading(false);
    setDialogOpen(false);
    setSelectedCode(null);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-10 bg-gray-100 rounded w-40 animate-pulse" />
        <div className="bg-white border border-gray-100 rounded-2xl h-64 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={dialogOpen}
        onClose={() => { setDialogOpen(false); setSelectedCode(null); }}
        onConfirm={deleteCode}
        title="حذف كود الخصم"
        description={`هل أنت متأكد من حذف كود الخصم "${selectedCode?.code || ''}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        isLoading={deleteLoading}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-falcon-dark flex items-center gap-3">
            <Tag className="w-8 h-8 text-falcon-gold" />
            أكواد الخصم
          </h1>
          <p className="text-gray-400 text-sm mt-1">{codes.length} كود</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-falcon-blue text-white font-bold rounded-xl hover:bg-falcon-blueDark transition-all shadow-lg shadow-falcon-blue/25"
        >
          <Plus className="w-5 h-5" />
          إضافة كود
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
            <h2 className="text-xl font-bold text-falcon-dark">إضافة كود خصم جديد</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <Tag className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input placeholder="الكود (مثال: FALCON10)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="input-field pr-12" />
              </div>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
                <option value="percentage">نسبة مئوية (%)</option>
                <option value="fixed">مبلغ ثابت (د.ع)</option>
              </select>
              <div className="relative">
                {form.type === 'percentage' ? <Percent className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /> : <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />}
                <input placeholder="القيمة" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="input-field pr-12" />
              </div>
              <input placeholder="الحد الأدنى للطلب (اختياري)" type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} className="input-field" />
              <input placeholder="حد الاستخدام (اختياري)" type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} className="input-field sm:col-span-2" />
            </div>
            <button onClick={createCode} disabled={creating} className="btn-primary disabled:opacity-50">
              {creating ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block ml-2" />
              ) : (
                <Plus className="w-5 h-5 inline-block ml-2" />
              )}
              حفظ الكود
            </button>
          </div>
        </motion.div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-falcon-bluePale/50 text-falcon-dark text-sm">
                <th className="text-right py-4 px-6 font-medium">الكود</th>
                <th className="text-right py-4 px-6 font-medium">النوع</th>
                <th className="text-right py-4 px-6 font-medium">القيمة</th>
                <th className="text-right py-4 px-6 font-medium">الاستخدام</th>
                <th className="text-right py-4 px-6 font-medium">الحالة</th>
                <th className="text-right py-4 px-6 font-medium">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((code, index) => (
                <motion.tr 
                  key={code._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-50 hover:bg-falcon-bluePale/30 transition-colors"
                >
                  <td className="py-4 px-6">
                    <span className="px-3 py-1.5 bg-falcon-blue text-white rounded-lg text-sm font-bold">
                      {code.code}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-600">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
                      code.type === 'percentage' ? 'bg-falcon-bluePale text-falcon-blue' : 'bg-falcon-gold/20 text-falcon-gold'
                    }`}>
                      {code.type === 'percentage' ? <Percent className="w-3 h-3" /> : <DollarSign className="w-3 h-3" />}
                      {code.type === 'percentage' ? 'نسبة' : 'ثابت'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-falcon-dark font-bold">{code.value}{code.type === 'percentage' ? '%' : ' د.ع'}</td>
                  <td className="py-4 px-6 text-gray-600">{code.usageCount} مرة</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold ${
                      code.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-500 border border-red-200'
                    }`}>
                      {code.isActive ? 'نشط' : 'معطل'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <button 
                      onClick={() => openDeleteDialog(code)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
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
