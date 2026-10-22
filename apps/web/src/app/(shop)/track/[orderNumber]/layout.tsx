import type { Metadata } from 'next';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ orderNumber: string }>;
}

// The page is a client component, so its title lives here
export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { orderNumber } = await params;
  return { title: `Track Order ${orderNumber}`, robots: { index: false, follow: false } };
}

export default function Layout({ children }: LayoutProps) {
  return children;
}
