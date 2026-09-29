import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { env } from '@/config/env';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: `${env.NEXT_PUBLIC_SITE_NAME} — Time, Refined`,
    template: `%s | ${env.NEXT_PUBLIC_SITE_NAME}`,
  },
  description:
    'A curated collection of exceptional timepieces. Discover luxury watches that define craftsmanship and precision.',
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  openGraph: {
    type: 'website',
    siteName: env.NEXT_PUBLIC_SITE_NAME,
    title: `${env.NEXT_PUBLIC_SITE_NAME} — Time, Refined`,
    description:
      'Discover luxury watches that define craftsmanship and precision.',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#0f2320',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
