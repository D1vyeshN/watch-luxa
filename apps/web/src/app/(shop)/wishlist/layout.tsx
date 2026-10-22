import type { Metadata } from 'next';

// Client page: title here; per-visitor, so kept out of search
export const metadata: Metadata = {
  title: 'Wishlist',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
