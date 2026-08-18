import HeroSection from '@/components/home/HeroSection';
import dynamic from 'next/dynamic';

const CategoriesSection = dynamic(() => import('@/components/home/CategoriesSection'), {
  loading: () => (
    <section className="py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded-lg w-1/3 mx-auto" />
          <div className="h-1 bg-gray-200 rounded-full w-24 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    </section>
  ),
});

const PackagesSection = dynamic(() => import('@/components/home/PackagesSection'), {
  loading: () => (
    <section className="py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded-lg w-1/3 mx-auto" />
          <div className="h-1 bg-gray-200 rounded-full w-24 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    </section>
  ),
});

const FeaturedProducts = dynamic(() => import('@/components/home/FeaturedProducts'), {
  loading: () => (
    <section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-white to-falcon-bluePale/30">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded-lg w-1/3 mx-auto" />
          <div className="h-1 bg-gray-200 rounded-full w-24 mx-auto" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-12">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    </section>
  ),
});

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <PackagesSection />
      <FeaturedProducts />
    </>
  );
}
