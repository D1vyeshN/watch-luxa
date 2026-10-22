import type { Metadata } from 'next';

// Client page: title here
export const metadata: Metadata = {
  title: 'Your Wishlist',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
