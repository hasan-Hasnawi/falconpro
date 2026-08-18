import CheckoutContent from './CheckoutContent';

export async function generateStaticParams() {
  return [{ locale: 'ar' }, { locale: 'en' }];
}

export default function CheckoutPage() {
  return <CheckoutContent />;
}
