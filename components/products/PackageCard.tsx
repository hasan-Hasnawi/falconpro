'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingCart, Check, Gift, ChevronDown, ChevronUp } from 'lucide-react';
import { useCart } from '@/components/cart/CartContext';

interface PackageItem {
  _id: string;
  name: { ar: string; en: string };
  description?: { ar: string; en: string };
  images?: string[];
  products: { name: { ar: string; en: string }; quantity: number; originalPrice: number; discount: number }[];
  totalOriginalPrice: number;
  finalPrice: number;
}

interface PackageCardProps {
  packageItem: PackageItem;
  locale: string;
}

export default function PackageCard({ packageItem, locale }: PackageCardProps) {
  const [added, setAdded] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { addItem } = useCart();
  const name = (packageItem.name as any)[locale] || packageItem.name.en;
  const description = packageItem.description ? (packageItem.description as any)[locale] || packageItem.description.en : '';
  const savings = packageItem.totalOriginalPrice - packageItem.finalPrice;
  const savingsPercent = Math.round((savings / packageItem.totalOriginalPrice) * 100);

  const handleAddToCart = () => {
    addItem({
      productId: packageItem._id,
      name: `${name} (بكج)`,
      price: packageItem.finalPrice,
      quantity: 1,
      image: packageItem.images?.[0] || '',
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-falcon-blue/30 hover:shadow-lg transition-all"
    >
      <div className="relative aspect-video overflow-hidden bg-gray-50">
        <Image
          src={packageItem.images?.[0] || 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=500&q=80&fm=webp'}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute top-3 left-3 px-3 py-1 bg-falcon-gold text-falcon-dark font-bold text-sm rounded-lg flex items-center gap-1">
          <Gift className="w-4 h-4" />
          بكج
        </div>
        {savingsPercent > 0 && (
          <div className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white font-bold text-sm rounded-lg">
            وفر {savingsPercent}%
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-falcon-dark font-bold text-lg mb-2">{name}</h3>
        {description && <p className="text-gray-500 text-sm mb-3 line-clamp-2">{description}</p>}

        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-falcon-blue text-sm mb-3 hover:underline">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {expanded ? 'إخفاء المحتويات' : 'عرض محتويات البكج'}
        </button>

        {expanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2 mb-3 p-3 bg-gray-50 rounded-xl">
            {packageItem.products.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-falcon-dark">{p.name?.ar} × {p.quantity}</span>
                <div className="flex items-center gap-2">
                  {p.discount > 0 && <span className="text-gray-400 line-through">{(p.originalPrice * p.quantity).toLocaleString()}</span>}
                  <span className="text-falcon-blue font-medium">
                    {Math.round(p.originalPrice * p.quantity * (1 - p.discount / 100)).toLocaleString()} د.ع
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl font-bold text-falcon-blue">{packageItem.finalPrice.toLocaleString()} <span className="text-sm">د.ع</span></span>
          <span className="text-gray-400 line-through">{packageItem.totalOriginalPrice.toLocaleString()}</span>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleAddToCart}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
            added ? 'bg-emerald-500 text-white' : 'bg-falcon-blue text-white hover:bg-blue-600'
          }`}
        >
          {added ? (
            <><Check className="w-5 h-5" />تمت الإضافة للسلة</>
          ) : (
            <><ShoppingCart className="w-5 h-5" />شراء البكج</>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
