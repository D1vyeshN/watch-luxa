import type { Metadata } from 'next';
import { env } from '@/config/env';

// Client page: title here
export const metadata: Metadata = {
  // Has a child route (order detail): keep passing the ' | LUXE' template on
  title: { default: 'Your Orders', template: `%s | ${env.NEXT_PUBLIC_SITE_NAME}` },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
