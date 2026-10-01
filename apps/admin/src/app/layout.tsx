import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import { App as AntdApp } from 'antd';
import { RefineProvider } from '@/components/refine-provider';
import { luxeAdminTheme } from '@/theme/antd-theme';

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
          <ConfigProvider theme={luxeAdminTheme}>
            <AntdApp>
              <RefineProvider>{children}</RefineProvider>
            </AntdApp>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
