'use client';

import { Refine } from '@refinedev/core';
import routerProvider from '@refinedev/nextjs-router';

import { dataProvider } from '@/providers/data-provider';
import { authProvider } from '@/providers/auth-provider';
import { accessControlProvider } from '@/providers/access-control';
import { RESOURCES } from '@/constants/resources';

export function RefineProvider({ children }: { children: React.ReactNode }) {
  return (
    <Refine
      routerProvider={routerProvider}
      dataProvider={dataProvider}
      authProvider={authProvider}
      accessControlProvider={accessControlProvider}
      resources={RESOURCES}
      options={{
        syncWithLocation: true,
        warnWhenUnsavedChanges: false,
        projectId: 'luxe-admin',
        disableTelemetry: true,
      }}
    >
      {children}
    </Refine>
  );
}
