import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'FalconPro - Admin Dashboard',
  description: 'FalconPro Admin Dashboard',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
