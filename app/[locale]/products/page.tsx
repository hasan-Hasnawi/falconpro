'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';

interface Product {
  _id: string;
  name: { ar: string; en: string };
  price: number;
  images: string[];
  isOnSale: boolean;
  salePrice?: number;
  category: string;
  subcategory?: string;
}

interface Category {
  _id: string;
  name: { ar: string; en: string };
  type: string;
  parentCategory?: string;
}

function ProductsContent() {
  const router = useRouter();
  const params = useParams();
  const locale = (Array.isArray(params.locale) ? params.locale[0] : params.locale) || 'ar';
  const t = useTranslations('products');
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, selectedCategory]);

  useEffect(() => {
    let cancelled = false;
    
    const fetchWithTimeout = (url: string, timeout = 8000) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      return fetch(url, { signal: controller.signal })
        .then((r) => { clearTimeout(id); return r.ok ? r.json() : Promise.reject(); })
        .catch((err) => { clearTimeout(id); throw err; });
    };
    
    Promise.all([
      fetchWithTimeout('/api/categories'),
      fetchWithTimeout('/api/products'),
    ])
      .then(([catsData, prodsData]) => {
        if (cancelled) return;
        setCategories(catsData.categories || []);
        setProducts(prodsData.products || []);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (selectedCategory) {
      result = result.filter(
        (p) => p.category === selectedCategory || p.subcategory === selectedCategory
      );
    }
    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      result = result.filter(
        (p) =>
          (p.name.ar || '').toLowerCase().includes(q) ||
          (p.name.en || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, selectedCategory, debouncedQuery]);

  const mainCategories = useMemo(
    () => categories.filter((c) => c.type === 'main'),
    [categories]
  );
  const subCategories = useMemo(
    () =>
      categories.filter(
        (c) => c.type === 'sub' && c.parentCategory === selectedCategory
      ),
    [categories, selectedCategory]
  );

  if (loading) {
    return (
      <div className="py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse bg-gray-200 h-12 rounded-xl mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 rounded-2xl h-80" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 px-4 text-center">
        <p className="text-red-500 text-lg mb-4">حدث خطأ في تحميل المنتجات</p>
        <button 
          onClick={() => router.refresh()} 
          className="px-6 py-3 bg-falcon-blue text-white rounded-xl hover:bg-falcon-blueDark transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-falcon-dark mb-4">{t('products')}</h1>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <div className="mt-4 p-4 bg-white border border-gray-100 rounded-xl">
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
                  {(cat.name as any)[locale as string]}
                </button>
              ))}
            </div>
            {subCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                <span className="text-gray-400 text-sm py-2">الأقسام الفرعية:</span>
                {subCategories.map((sub) => (
                  <button
                    key={sub._id}
                    onClick={() => setSelectedCategory(sub._id)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      selectedCategory === sub._id ? 'bg-falcon-gold text-falcon-dark' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {(sub.name as any)[locale as string]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">{t('noProducts')}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts
                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                .map((product) => (
                  <ProductCard key={product._id} product={product} locale={locale} />
                ))}
            </div>
            
            {/* Pagination */}
            {filteredProducts.length > ITEMS_PER_PAGE && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  السابق
                </button>
                <span className="text-gray-600 text-sm">
                  صفحة {currentPage} من {Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredProducts.length / ITEMS_PER_PAGE), p + 1))}
                  disabled={currentPage === Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  التالي
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse bg-gray-200 h-12 rounded-xl mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-100 rounded-2xl h-80" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
