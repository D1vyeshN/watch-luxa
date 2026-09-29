'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  openCartDrawer,
  closeCartDrawer,
  toggleCartDrawer,
} from '@/store/slices/uiSlice';
import { setUser, logout } from '@/store/slices/authSlice';

export default function Step2TestPage() {
  const dispatch = useAppDispatch();

  const isCartOpen = useAppSelector((s) => s.ui.isCartDrawerOpen);
  const user = useAppSelector((s) => s.auth.user);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const handleMockLogin = () => {
    dispatch(
      setUser({
        _id: '123',
        email: 'test@luxe.com',
        name: 'Test User',
        role: 'user',
        isActive: true,
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
      })
    );
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="container-luxe py-20">
      <p className="label-luxe">Step 2 — Redux Store</p>
      <h1 className="heading-luxe mt-4 text-5xl">Store is alive.</h1>

      <div className="mt-10 space-y-6 max-w-xl">
        {/* UI Slice */}
        <div className="rounded-sm border border-forest-900/10 bg-white p-6">
          <h2 className="heading-luxe text-xl">UI Slice</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Cart drawer is{' '}
            <span className="font-medium text-forest-900">
              {isCartOpen ? 'OPEN' : 'CLOSED'}
            </span>
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => dispatch(openCartDrawer())}
              className="rounded-sm bg-forest-900 px-4 py-2 text-xs uppercase tracking-widest text-cream-100"
            >
              Open Cart
            </button>
            <button
              onClick={() => dispatch(closeCartDrawer())}
              className="rounded-sm border border-forest-900/20 px-4 py-2 text-xs uppercase tracking-widest text-forest-900"
            >
              Close Cart
            </button>
            <button
              onClick={() => dispatch(toggleCartDrawer())}
              className="rounded-sm border border-forest-900/20 px-4 py-2 text-xs uppercase tracking-widest text-forest-900"
            >
              Toggle
            </button>
          </div>
        </div>

        {/* Auth Slice */}
        <div className="rounded-sm border border-forest-900/10 bg-white p-6">
          <h2 className="heading-luxe text-xl">Auth Slice</h2>
          <p className="mt-2 text-sm text-ink-soft">
            {isAuthenticated ? (
              <>
                Signed in as{' '}
                <span className="font-medium text-forest-900">
                  {user?.name} ({user?.email})
                </span>
              </>
            ) : (
              'Not signed in'
            )}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={handleMockLogin}
              className="rounded-sm bg-forest-900 px-4 py-2 text-xs uppercase tracking-widest text-cream-100"
            >
              Mock Login
            </button>
            <button
              onClick={handleLogout}
              className="rounded-sm border border-forest-900/20 px-4 py-2 text-xs uppercase tracking-widest text-forest-900"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
