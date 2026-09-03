'use client';

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface HeroTexts {
  heroTitleAr: string;
  heroTitleEn: string;
  heroSubtitleAr: string;
  heroSubtitleEn: string;
  heroDescriptionAr: string;
  heroDescriptionEn: string;
  heroCtaAr: string;
  heroCtaEn: string;
  heroMotivation1Ar: string;
  heroMotivation1En: string;
  heroMotivation2Ar: string;
  heroMotivation2En: string;
  heroMotivation3Ar: string;
  heroMotivation3En: string;
}

const defaults: HeroTexts = {
  heroTitleAr: 'FalconPro',
  heroTitleEn: 'FalconPro',
  heroSubtitleAr: 'Event Title',
  heroSubtitleEn: 'Event Title',
  heroDescriptionAr: 'Best supplements and protein',
  heroDescriptionEn: 'Best supplements and protein',
  heroCtaAr: 'Shop Now',
  heroCtaEn: 'Shop Now',
  heroMotivation1Ar: 'لا حدود لقوتك',
  heroMotivation1En: 'No Limits to Your Power',
  heroMotivation2Ar: 'اصنع جسدك المثالي',
  heroMotivation2En: 'Build Your Perfect Body',
  heroMotivation3Ar: 'كل تدريب يقربك للقمة',
  heroMotivation3En: 'Every Training Brings You Closer to the Top',
};

export default function HeroTextEditor() {
  const { showToast } = useToast();
  const [texts, setTexts] = useState<HeroTexts>(defaults);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        const s = data.settings;
        if (s) {
          setTexts({
            heroTitleAr: s.heroTitleAr || defaults.heroTitleAr,
            heroTitleEn: s.heroTitleEn || defaults.heroTitleEn,
            heroSubtitleAr: s.heroSubtitleAr || defaults.heroSubtitleAr,
            heroSubtitleEn: s.heroSubtitleEn || defaults.heroSubtitleEn,
            heroDescriptionAr: s.heroDescriptionAr || defaults.heroDescriptionAr,
            heroDescriptionEn: s.heroDescriptionEn || defaults.heroDescriptionEn,
            heroCtaAr: s.heroCtaAr || defaults.heroCtaAr,
            heroCtaEn: s.heroCtaEn || defaults.heroCtaEn,
            heroMotivation1Ar: s.heroMotivation1Ar || defaults.heroMotivation1Ar,
            heroMotivation1En: s.heroMotivation1En || defaults.heroMotivation1En,
            heroMotivation2Ar: s.heroMotivation2Ar || defaults.heroMotivation2Ar,
            heroMotivation2En: s.heroMotivation2En || defaults.heroMotivation2En,
            heroMotivation3Ar: s.heroMotivation3Ar || defaults.heroMotivation3Ar,
            heroMotivation3En: s.heroMotivation3En || defaults.heroMotivation3En,
          });
        }
      })
      .catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(texts),
    });
    if (res.ok) {
      showToast('تم حفظ النصوص بنجاح', 'success');
    } else {
      showToast('حدث خطأ أثناء الحفظ', 'error');
    }
    setSaving(false);
  };

  const Field = ({ label, arKey, enKey }: { label: string; arKey: keyof HeroTexts; enKey: keyof HeroTexts }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label className="text-gray-500 text-xs mb-1 block">{label} (عربي)</label>
        <input
          type="text"
          value={texts[arKey]}
          onChange={(e) => setTexts({ ...texts, [arKey]: e.target.value })}
          className="input-field text-sm"
        />
      </div>
      <div>
        <label className="text-gray-500 text-xs mb-1 block">{label} (English)</label>
        <input
          type="text"
          value={texts[enKey]}
          onChange={(e) => setTexts({ ...texts, [enKey]: e.target.value })}
          className="input-field text-sm"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Field label="العنوان الرئيسي" arKey="heroTitleAr" enKey="heroTitleEn" />
      <Field label="العنوان الفرعي" arKey="heroSubtitleAr" enKey="heroSubtitleEn" />
      <Field label="الوصف" arKey="heroDescriptionAr" enKey="heroDescriptionEn" />
      <Field label="نص الزر" arKey="heroCtaAr" enKey="heroCtaEn" />
      <div className="border-t border-gray-100 pt-4 mt-4">
        <p className="text-sm font-bold text-gray-700 mb-3">نصوص التحفيز</p>
        <div className="space-y-3">
          <Field label="النص التحفيزي الأول" arKey="heroMotivation1Ar" enKey="heroMotivation1En" />
          <Field label="النص التحفيزي الثاني" arKey="heroMotivation2Ar" enKey="heroMotivation2En" />
          <Field label="النص التحفيزي الثالث" arKey="heroMotivation3Ar" enKey="heroMotivation3En" />
        </div>
      </div>
      <button
        onClick={save}
        disabled={saving}
        className="flex items-center gap-2 px-4 py-2 bg-falcon-blue text-white text-sm font-bold rounded-lg hover:bg-falcon-blueDark transition-colors disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        {saving ? 'جاري الحفظ...' : 'حفظ النصوص'}
      </button>
    </div>
  );
}
