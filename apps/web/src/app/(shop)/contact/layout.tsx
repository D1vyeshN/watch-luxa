import type { Metadata } from 'next';
import { buildStaticPageMetadata } from '@/lib/seo/metadata';
import { ROUTES } from '@/constants/routes';

// The page is a client component, so its metadata lives here
export const metadata: Metadata = buildStaticPageMetadata(
  'Contact',
  'Questions about a piece, an order, or a private viewing? Write to the LUXE team.',
  ROUTES.contact
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
