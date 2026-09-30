'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/thunks/authThunks';

export function useAuth() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const isHydrated = useAppSelector((s) => s.auth.isHydrated);

  return {
    user,
    isAuthenticated,
    isHydrated,
    logout: () => dispatch(logoutUser()).unwrap(),
  };
}
