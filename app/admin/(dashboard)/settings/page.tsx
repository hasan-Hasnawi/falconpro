'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Settings, AlertTriangle, Truck } from 'lucide-react';

export default function AdminSettings() {
  const [deliveryFee, setDeliveryFee] = useState<number | ''>('');
  const [excludedProvinces, setExcludedProvinces] = useState<string[]>([]);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        const s = data.settings;
        if (s) {
          setDeliveryFee(s.deliveryFee ?? '');
          setExcludedProvinces(s.excludedProvinces || []);
          setMaintenanceMode(s.maintenanceMode || false);
        }
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    setMessage('');
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deliveryFee: deliveryFee === '' ? 0 : Number(deliveryFee),
        excludedProvinces,
        maintenanceMode,
      }),
    });
    if (res.ok) {
      setMessage('تم حفظ الإعدادات بنجاح');
    } else {
      setMessage('حدث خطأ');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-10 bg-gray-100 rounded w-40 animate-pulse" />
        <div className="bg-white border border-gray-100 rounded-2xl h-96 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-falcon-dark flex items-center gap-3">
          <Settings className="w-8 h-8 text-falcon-blue" />
          الإعدادات
        </h1>
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
        <div className="h-1 bg-gradient-to-r from-falcon-blue to-falcon-blueLight" />
        <div className="p-8 space-y-8">
          
          {/* Delivery Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-falcon-dark flex items-center gap-2">
              <Truck className="w-6 h-6 text-falcon-blue" />
              التوصيل
            </h2>
            <div>
              <label className="text-gray-600 text-sm mb-2 block font-medium">رسوم التوصيل الافتراضية (د.ع)</label>
              <input
                type="number"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value === '' ? '' : Number(e.target.value))}
                className="input-field w-40"
              />
            </div>
            <div>
              <label className="text-gray-600 text-sm mb-2 block font-medium">المحافظات بدون توصيل</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                {[
                  'بغداد', 'البصرة', 'نينوى', 'أربيل', 'السليمانية', 'الأنبار', 'بابل', 'كربلاء',
                  'النجف', 'واسط', 'صلاح الدين', 'ديالى', 'كركوك', 'دهوك', 'المثنى', 'القادسية',
                  'ذي قار', 'ميسان'
                ].map((prov) => (
                  <label key={prov} className="flex items-center gap-2 cursor-pointer hover:text-falcon-blue transition-colors">
                    <input
                      type="checkbox"
                      checked={excludedProvinces.includes(prov)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setExcludedProvinces([...excludedProvinces, prov]);
                        } else {
                          setExcludedProvinces(excludedProvinces.filter((p) => p !== prov));
                        }
                      }}
                      className="w-5 h-5 rounded border-gray-300 text-falcon-blue focus:ring-falcon-blue"
                    />
                    <span className="text-sm text-falcon-dark">{prov}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Maintenance Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-falcon-dark flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              وضع الصيانة
            </h2>
            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-6 h-6 rounded border-gray-300 text-falcon-blue focus:ring-falcon-blue"
              />
              <div>
                <span className="text-falcon-dark font-medium block">تفعيل وضع الصيانة</span>
                <span className="text-gray-400 text-sm">سيتم إخفاء الموقع عن الزوار وإظهار صفحة الصيانة</span>
              </div>
            </label>
          </div>

          {/* Save Button */}
          <button
            onClick={saveSettings}
            disabled={saving}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
        </div>
      </div>
    </div>
  );
}
