import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20 sm:pt-24">
        {children}
      </main>
      <Footer />
    </div>
  );
}
