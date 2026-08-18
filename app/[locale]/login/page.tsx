'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/components/ui/Toast';

export default function LoginPage() {
  const params = useParams();
  const locale = (Array.isArray(params.locale) ? params.locale[0] : params.locale) || 'ar';
  const router = useRouter();
  const t = useTranslations('auth');
  const { login, register } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 4) {
      setError('كلمة المرور يجب أن تكون 4 أحرف على الأقل');
      setLoading(false);
      return;
    }

    showToast(
      mode === 'login' ? 'جاري تسجيل الدخول...' : 'جاري إنشاء الحساب...',
      'success'
    );

    const result = mode === 'login' 
      ? await login(phone, password) 
      : await register(phone, password, name);
    
    if (result.success) {
      showToast(
        mode === 'login' ? 'تم تسجيل الدخول بنجاح!' : 'تم إنشاء الحساب وتسجيل الدخول بنجاح!',
        'success'
      );
      router.push(`/${locale}/profile`);
    } else {
      setError(result.error || 'حدث خطأ، يرجى المحاولة مرة أخرى');
      showToast(result.error || 'حدث خطأ، يرجى المحاولة مرة أخرى', 'error');
    }
    setLoading(false);
  };

  const switchToLogin = () => {
    setMode('login');
    setError('');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        {/* Tabs */}
        <div className="flex mb-6 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-3 text-sm font-medium rounded-lg transition-colors ${mode === 'login' ? 'bg-falcon-blue text-white' : 'text-gray-500 hover:text-falcon-dark'}`}
          >
            <LogIn className="w-4 h-4 inline-block mr-2" />{t('login')}
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-3 text-sm font-medium rounded-lg transition-colors ${mode === 'register' ? 'bg-falcon-blue text-white' : 'text-gray-500 hover:text-falcon-dark'}`}
          >
            <UserPlus className="w-4 h-4 inline-block mr-2" />{t('register')}
          </button>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-gray-600 text-sm mb-2 block">{t('name')}</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم (اختياري)" className="input-field" />
              </div>
            )}

            <div>
              <label className="text-gray-600 text-sm mb-2 block">{t('phone')}</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="07XX XXX XXXX" className="input-field" />
            </div>

            <div>
              <label className="text-gray-600 text-sm mb-2 block">{t('password')}</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={4} placeholder="****" className="input-field px-4 pe-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-gray-400 text-xs mt-1">{t('minPassword')}</p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                <p className="text-red-400 text-sm">{error}</p>
                {mode === 'register' && error === 'هذا الرقم مسجل مسبقاً' && (
                  <button
                    type="button"
                    onClick={switchToLogin}
                    className="text-falcon-blue text-sm font-medium hover:underline flex items-center gap-1"
                  >
                    <LogIn className="w-4 h-4" />
                    هل تريد تسجيل الدخول؟
                  </button>
                )}
              </motion.div>
            )}

            <button type="submit" disabled={loading} className="w-full py-3 bg-falcon-blue text-white font-bold rounded-xl hover:bg-falcon-blueDark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>{t('submit')}<ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <Link href={`/${locale}/products`} className="text-gray-400 hover:text-falcon-blue text-sm transition-colors">{t('skip')}</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
