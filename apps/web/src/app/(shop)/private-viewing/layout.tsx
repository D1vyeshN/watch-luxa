import type { Metadata } from 'next';
import { buildStaticPageMetadata } from '@/lib/seo/metadata';
import { ROUTES } from '@/constants/routes';

// The page is a client component, so its metadata lives here
export const metadata: Metadata = buildStaticPageMetadata(
  'Book a Private Viewing',
  'A one-on-one session with a LUXE specialist. See pieces up close, try them on, and ask anything.',
  ROUTES.privateViewing
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
