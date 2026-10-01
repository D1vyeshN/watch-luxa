import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import { luxeAdminTheme } from '@/theme/antd-theme';
import '@refinedev/antd/dist/reset.css';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'LUXE Admin',
    template: '%s | LUXE Admin',
  },
  description: 'LUXE operations cockpit',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body style={{ margin: 0 }}>
        <AntdRegistry>
          <ConfigProvider theme={luxeAdminTheme}>{children}</ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
