'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Refine } from '@refinedev/core';
import routerProvider from '@refinedev/nextjs-router';
import { Toaster } from 'sonner';

import { dataProvider } from '@/providers/data-provider';
import { authProvider } from '@/providers/auth-provider';
import { accessControlProvider } from '@/providers/access-control';
import { notificationProvider } from '@/providers/notification-provider';
import { RESOURCES } from '@/constants/resources';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Refine
        routerProvider={routerProvider}
        dataProvider={dataProvider}
        authProvider={authProvider}
        accessControlProvider={accessControlProvider}
        notificationProvider={notificationProvider}
        resources={RESOURCES}
        options={{
          syncWithLocation: true,
          warnWhenUnsavedChanges: false,
          projectId: 'luxe-admin',
          disableTelemetry: true,
          title: {
            icon: <span className="text-xl">✦</span>,
            text: 'LUXE Admin',
          },
        }}
      >
        {children}
        <Toaster position="top-right" richColors closeButton />
      </Refine>
    </QueryClientProvider>
  );
}
