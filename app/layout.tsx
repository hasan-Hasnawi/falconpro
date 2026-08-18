import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FalconPro - Supplements & Protein',
  description: 'FalconPro - Best supplements and protein store in Iraq',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-arabic antialiased">
        {children}
      </body>
    </html>
  );
}
