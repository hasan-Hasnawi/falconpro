'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingCart, Check, Truck, Shield, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/components/cart/CartContext';

interface ProductFlavor {
  name: { ar: string; en: string };
  image: string;
  stock: number;
}

interface Product {
  _id: string;
  name: { ar: string; en: string };
  description: { ar: string; en: string };
  price: number;
  images: string[];
  isOnSale: boolean;
  salePrice?: number;
  stock: number;
  category: string;
  flavors?: ProductFlavor[];
  isOutOfStock?: boolean;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (Array.isArray(params.locale) ? params.locale[0] : params.locale) || 'ar';
  const productId = params.id as string;
  const { addItem, getItemQuantity } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [selectedFlavor, setSelectedFlavor] = useState<ProductFlavor | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetch('/api/products', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        const found = data.products?.find((p: any) => p._id === productId);
        setProduct(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-falcon-blue/30 border-t-falcon-blue rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold text-falcon-dark mb-4">المنتج غير موجود</h1>
        <button onClick={() => router.push(`/${locale}/products`)} className="px-6 py-3 bg-falcon-blue text-white rounded-xl hover:bg-falcon-blueDark transition-colors">
          العودة للمنتجات
        </button>
      </div>
    );
  }

  const name = (product.name as any)[locale] || product.name.en;
  const description = (product.description as any)[locale] || product.description.en;
  const displayPrice = product.isOnSale && product.salePrice ? product.salePrice : product.price;
  const hasFlavors = product.flavors && product.flavors.length > 0;
  const galleryImages = selectedFlavor
    ? [selectedFlavor.image]
    : product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&q=80'];
  const mainImage = galleryImages[selectedImageIndex] || galleryImages[0];

  const allFlavorsOutOfStock = hasFlavors && product.flavors!.every(f => f.stock <= 0);
  const isOutOfStock = product.isOutOfStock || (hasFlavors ? allFlavorsOutOfStock : product.stock <= 0);
  const mustSelectFlavor = hasFlavors && !selectedFlavor;
  const availableStock = selectedFlavor ? selectedFlavor.stock : product.stock;
  const cartQuantity = getItemQuantity(product._id, selectedFlavor?.name.ar);
  const canAddQuantity = Math.max(0, availableStock - cartQuantity);

  const handleAddToCart = () => {
    if (isOutOfStock || mustSelectFlavor || quantity > canAddQuantity) return;

    addItem({
      productId: product._id,
      name,
      price: displayPrice,
      quantity,
      image: mainImage,
      flavor: selectedFlavor || undefined,
    }, availableStock);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => router.push(`/${locale}/products`)}
          className="flex items-center gap-2 text-gray-500 hover:text-falcon-blue mb-6 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للمنتجات
        </motion.button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden">
              <Image
                key={mainImage}
                src={mainImage}
                alt={name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              {product.isOnSale && (
                <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white font-bold rounded-lg z-10">
                  SALE
                </div>
              )}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                  <div className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    نفذت الكمية
                  </div>
                </div>
              )}
              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex((selectedImageIndex - 1 + galleryImages.length) % galleryImages.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg z-10 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-falcon-dark" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex((selectedImageIndex + 1) % galleryImages.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg z-10 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-falcon-dark" />
                  </button>
                </>
              )}
            </div>
            {galleryImages.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      idx === selectedImageIndex
                        ? 'border-falcon-blue shadow-lg shadow-falcon-blue/20'
                        : 'border-gray-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col justify-center">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-falcon-dark mb-3 sm:mb-4">{name}</h1>
            
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <span className="text-2xl sm:text-3xl font-bold text-falcon-blue">
                {displayPrice.toLocaleString()} <span className="text-sm sm:text-lg">د.ع</span>
              </span>
              {product.isOnSale && product.salePrice && (
                <span className="text-xl text-gray-400 line-through">
                  {product.price.toLocaleString()} د.ع
                </span>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-6 sm:mb-8">{description}</p>

            {/* Flavors */}
            {product.flavors && product.flavors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-700 mb-3">اختر النكهة / النوع</h3>
                <div className="flex flex-wrap gap-2">
                  {product.flavors.map((flavor, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedFlavor(flavor);
                        setSelectedImageIndex(0);
                        setQuantity(1);
                      }}
                      className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                        selectedFlavor?.name.ar === flavor.name.ar
                          ? 'border-falcon-blue bg-falcon-blue text-white'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-falcon-blue/50'
                      } ${flavor.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={flavor.stock <= 0}
                    >
                      {(flavor.name as any)[locale] || flavor.name.ar}
                      {flavor.stock <= 0 && ' (نفذت)'}
                    </button>
                  ))}
                </div>
                {selectedFlavor && (
                  <p className="text-sm text-gray-500 mt-2">
                    الكمية المتاحة: <span className="font-bold text-falcon-dark">{selectedFlavor.stock}</span>
                  </p>
                )}
              </div>
            )}

            {/* Quantity */}
            {!isOutOfStock && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-bold text-gray-700">الكمية:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(canAddQuantity, quantity + 1))}
                    disabled={quantity >= canAddQuantity}
                    className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="flex items-center gap-2 text-gray-500">
                <Truck className="w-5 h-5 text-falcon-blue" />
                <span className="text-sm">توصيل سريع</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Shield className="w-5 h-5 text-falcon-blue" />
                <span className="text-sm">أصلي 100%</span>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              disabled={isOutOfStock || mustSelectFlavor || quantity > canAddQuantity}
              className={`flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-lg transition-all ${
                isOutOfStock
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : mustSelectFlavor
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : added
                  ? 'bg-emerald-500 text-white'
                  : 'bg-falcon-blue text-white hover:bg-falcon-blueDark'
              }`}
            >
              {isOutOfStock ? (
                <><AlertCircle className="w-6 h-6" />نفذت الكمية</>
              ) : mustSelectFlavor ? (
                <><AlertCircle className="w-6 h-6" />اختر النكهة أولاً</>
              ) : added ? (
                <><Check className="w-6 h-6" />تمت الإضافة للسلة</>
              ) : (
                <><ShoppingCart className="w-6 h-6" />أضف للسلة</>
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
