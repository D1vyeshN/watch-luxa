import type { Metadata } from 'next';
import { env } from '@/config/env';

// Client page: title here; private, so kept out of search
export const metadata: Metadata = {
  // A plain string title here would drop the root ' | LUXE' template for
  // everything below this segment, so pass the template on explicitly
  title: { default: 'Checkout', template: `%s | ${env.NEXT_PUBLIC_SITE_NAME}` },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
