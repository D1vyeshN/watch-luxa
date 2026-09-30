'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LoadingScreen } from '@/components/shared/loading-spinner';
import { ROUTES } from '@/constants/routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isHydrated } = useAuth();

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      const redirect = encodeURIComponent(pathname);
      router.replace(`${ROUTES.login}?redirect=${redirect}`);
    }
  }, [isHydrated, isAuthenticated, pathname, router]);

  // Loading state while hydrating
  if (!isHydrated) {
    return <LoadingScreen message="Verifying your session…" />;
  }

  // Not authenticated — will redirect, show blank to avoid flash
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
