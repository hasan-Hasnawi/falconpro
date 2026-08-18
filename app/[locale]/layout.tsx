import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/lib/i18n/config';
import '../globals.css';
import RootLayoutClient from '@/components/layout/RootLayoutClient';
import ClientProviders from '@/components/layout/ClientProviders';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const messages = await getMessages({ locale });
  return {
    title: (messages as any).metadata?.title || 'FalconPro',
    description: (messages as any).metadata?.description || '',
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as any)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages({ locale });
  const isRTL = locale === 'ar';

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'}>
      <body className={isRTL ? 'font-arabic' : 'font-sans'}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ClientProviders>
            <RootLayoutClient>{children}</RootLayoutClient>
          </ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
