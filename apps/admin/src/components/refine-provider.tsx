'use client';

import { Refine, Authenticated } from '@refinedev/core';
import { dataProvider } from '@/providers/data-provider';
import { authProvider } from '@/providers/auth-provider/auth-provider.client';
import { accessControlProvider } from '@/providers/access-control/access-control.client';
import routerProvider from '@refinedev/nextjs-router';

export function RefineProvider({ children }: { children: React.ReactNode }) {
  return (
    <Refine
      dataProvider={dataProvider}
      authProvider={authProvider}
      accessControlProvider={accessControlProvider}
      routerProvider={routerProvider}
      options={{
        syncWithLocation: true,
        warnWhenUnsavedChanges: true,
        projectId: 'luxe-admin',
      }}
      resources={[
        {
          name: 'products',
          list: '/',
        },
      ]}
    >
      <Authenticated fallback="/login" key="authenticated">
        {children}
      </Authenticated>
    </Refine>
  );
}
