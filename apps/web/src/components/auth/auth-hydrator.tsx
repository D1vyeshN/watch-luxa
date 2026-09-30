'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { markHydrated } from '@/store/slices/authSlice';
import { hydrateUser } from '@/store/thunks/authThunks';
import { tokenStorage } from '@/lib/storage/tokenStorage';

export function AuthHydrator({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const isHydrated = useAppSelector((s) => s.auth.isHydrated);
  const hasHydrated = useRef(false);

  useEffect(() => {
    if (hasHydrated.current || isHydrated) return;

    hasHydrated.current = true;

    const token = tokenStorage.getAccess();

    if (!token) {
      dispatch(markHydrated());
      return;
    }

    dispatch(hydrateUser());
  }, [isHydrated, dispatch]);

  return <>{children}</>;
}
