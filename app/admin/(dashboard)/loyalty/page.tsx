'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Gift, Plus, Trash2, Truck, Percent, DollarSign, Package } from 'lucide-react';

interface Category {
  _id: string;
  name: { ar: string; en: string };
  type: 'main' | 'sub';
  parentCategory?: string;
}

interface Product {
  _id: string;
  name: { ar: string; en: string };
  price: number;
}

interface LoyaltyStage {
  orderNumber: number;
  rewardType: 'free_delivery' | 'percentage_discount' | 'fixed_discount' | 'free_product';
  rewardValue: number | string;
  description: { ar: string; en: string };
  expiresInDays: number | '';
  freeProductChoice: {
    type: 'admin' | 'user';
    productId?: string;
    categoryId?: string;
    maxValue?: number | '';
  };
}

const rewardTypeOptions = [
  { value: 'free_delivery', label: 'توصيل مجاني', icon: <Truck className="w-4 h-4" /> },
  { value: 'percentage_discount', label: 'خصم نسبة مئوية', icon: <Percent className="w-4 h-4" /> },
  { value: 'fixed_discount', label: 'خصم مبلغ ثابت', icon: <DollarSign className="w-4 h-4" /> },
  { value: 'free_product', label: 'منتج مجاني', icon: <Package className="w-4 h-4" /> },
];

export default function AdminLoyalty() {
  const [loyaltyStages, setLoyaltyStages] = useState<LoyaltyStage[]>([]);
  const [loyaltyCycleReset, setLoyaltyCycleReset] = useState<number | ''>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/settings').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/products').then((r) => r.json()),
    ])
      .then(([settingsData, catsData, prodsData]) => {
        const s = settingsData.settings;
        if (s) {
          setLoyaltyStages(s.loyaltyStages || []);
          setLoyaltyCycleReset(s.loyaltyCycleReset ?? '');
        }
        setCategories(catsData.categories || []);
        setProducts(prodsData.products || []);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const addStage = () => {
    const newStage: LoyaltyStage = {
      orderNumber: loyaltyStages.length > 0 ? Math.max(...loyaltyStages.map((st) => st.orderNumber)) + 1 : 1,
      rewardType: 'free_delivery',
      rewardValue: 0,
      description: { ar: '', en: '' },
      expiresInDays: '',
      freeProductChoice: { type: 'admin' },
    };
    setLoyaltyStages([...loyaltyStages, newStage]);
  };

  const removeStage = (index: number) => {
    setLoyaltyStages(loyaltyStages.filter((_, i) => i !== index));
  };

  const updateStage = (index: number, updates: Partial<LoyaltyStage>) => {
    const updated = [...loyaltyStages];
    updated[index] = { ...updated[index], ...updates };
    setLoyaltyStages(updated);
  };

  const updateStageChoice = (index: number, choice: any) => {
    const updated = [...loyaltyStages];
    updated[index].freeProductChoice = { ...updated[index].freeProductChoice, ...choice };
    setLoyaltyStages(updated);
  };

  const saveLoyalty = async () => {
    setSaving(true);
    setMessage('');
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loyaltyStages: loyaltyStages.map((st) => ({
          ...st,
          expiresInDays: st.expiresInDays === '' ? null : Number(st.expiresInDays),
          rewardValue: st.rewardType === 'free_product' ? String(st.rewardValue) : Number(st.rewardValue),
          freeProductChoice: {
            ...st.freeProductChoice,
            maxValue: st.freeProductChoice?.maxValue === '' ? null : Number(st.freeProductChoice?.maxValue),
          },
        })),
        loyaltyCycleReset: loyaltyCycleReset === '' ? null : Number(loyaltyCycleReset),
      }),
    });
    if (res.ok) {
      setMessage('تم حفظ إعدادات كرت الولاء بنجاح');
    } else {
      setMessage('حدث خطأ أثناء الحفظ');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-10 bg-gray-100 rounded w-48 animate-pulse" />
        <div className="bg-white border border-gray-100 rounded-2xl h-96 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-falcon-dark flex items-center gap-3">
          <Gift className="w-8 h-8 text-falcon-gold" />
          كرت الولاء
        </h1>
        <p className="text-gray-400 mt-2">إعداد مراحل كرت الولاء والمكافآت التي يحصل عليها العملاء عند إكمال الطلبات</p>
      </div>

      {/* Success Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-600 font-bold flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          {message}
        </motion.div>
      )}

      {/* Form */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-falcon-gold to-falcon-goldLight" />
        <div className="p-8 space-y-8">
          
          {/* Cycle Reset */}
          <div className="bg-falcon-bluePale/30 border border-falcon-blue/20 rounded-2xl p-4">
            <label className="text-falcon-dark font-medium text-sm mb-2 block">إعادة العد بعد طلب رقم (اتركه فارغاً للإعادة التلقائية بعد آخر مرحلة)</label>
            <input
              type="number"
              value={loyaltyCycleReset}
              onChange={(e) => setLoyaltyCycleReset(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="مثال: 7"
              className="input-field w-40"
            />
          </div>

          {/* Stages */}
          <div className="space-y-4">
            {loyaltyStages.map((stage, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-falcon-dark">المرحلة #{index + 1}</h3>
                  <button onClick={() => removeStage(index)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-gray-600 text-xs mb-1 block">رقم الطلب</label>
                    <input
                      type="number"
                      value={stage.orderNumber}
                      onChange={(e) => updateStage(index, { orderNumber: Number(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-gray-600 text-xs mb-1 block">نوع الجائزة</label>
                    <select
                      value={stage.rewardType}
                      onChange={(e) => updateStage(index, { rewardType: e.target.value as any, rewardValue: e.target.value === 'free_product' ? products[0]?._id || '' : 0 })}
                      className="input-field"
                    >
                      {rewardTypeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-600 text-xs mb-1 block">
                      {stage.rewardType === 'percentage_discount' ? 'نسبة الخصم (%)' :
                       stage.rewardType === 'fixed_discount' ? 'مبلغ الخصم (د.ع)' :
                       stage.rewardType === 'free_product' ? 'المنتج المجاني' : 'القيمة'}
                    </label>
                    {stage.rewardType === 'free_product' ? (
                      <>
                        <select
                          value={stage.freeProductChoice?.type || 'admin'}
                          onChange={(e) => updateStageChoice(index, { type: e.target.value, productId: '', categoryId: '', maxValue: '' })}
                          className="input-field mb-2"
                        >
                          <option value="admin">الأدمن يختار المنتج</option>
                          <option value="user">الزبون يختار المنتج</option>
                        </select>
                        {stage.freeProductChoice?.type === 'admin' ? (
                          <select
                            value={String(stage.rewardValue)}
                            onChange={(e) => updateStage(index, { rewardValue: e.target.value })}
                            className="input-field"
                          >
                            <option value="">اختر منتجاً</option>
                            {products.map((p) => (
                              <option key={p._id} value={p._id}>{(p.name as any).ar} - {p.price.toLocaleString()} د.ع</option>
                            ))}
                          </select>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={stage.freeProductChoice?.categoryId || ''}
                              onChange={(e) => updateStageChoice(index, { categoryId: e.target.value })}
                              className="input-field"
                            >
                              <option value="">اختر قسماً</option>
                              {categories.map((c) => (
                                <option key={c._id} value={c._id}>{(c.name as any).ar}</option>
                              ))}
                            </select>
                            <input
                              type="number"
                              value={stage.freeProductChoice?.maxValue ?? ''}
                              onChange={(e) => updateStageChoice(index, { maxValue: e.target.value === '' ? '' : Number(e.target.value) })}
                              placeholder="أقصى قيمة"
                              className="input-field"
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <input
                        type="number"
                        value={stage.rewardValue}
                        onChange={(e) => updateStage(index, { rewardValue: Number(e.target.value) })}
                        className="input-field"
                      />
                    )}
                  </div>
                  <div>
                    <label className="text-gray-600 text-xs mb-1 block">مدة الصلاحية (أيام، فارغ = لا تنتهي)</label>
                    <input
                      type="number"
                      value={stage.expiresInDays}
                      onChange={(e) => updateStage(index, { expiresInDays: e.target.value === '' ? '' : Number(e.target.value) })}
                      placeholder="مثال: 30"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={stage.description.ar}
                    onChange={(e) => updateStage(index, { description: { ...stage.description, ar: e.target.value } })}
                    placeholder="وصف الجائزة (عربي)"
                    className="input-field"
                  />
                  <input
                    type="text"
                    value={stage.description.en}
                    onChange={(e) => updateStage(index, { description: { ...stage.description, en: e.target.value } })}
                    placeholder="Reward Description (English)"
                    className="input-field"
                  />
                </div>
              </motion.div>
            ))}

            <button
              onClick={addStage}
              className="w-full py-3 border-2 border-dashed border-falcon-blue/30 text-falcon-blue font-bold rounded-xl hover:bg-falcon-bluePale transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              إضافة مرحلة جديدة
            </button>
          </div>

          {/* Save Button */}
          <button
            onClick={saveLoyalty}
            disabled={saving}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'جاري الحفظ...' : 'حفظ إعدادات كرت الولاء'}
          </button>
        </div>
      </div>
    </div>
  );
}
