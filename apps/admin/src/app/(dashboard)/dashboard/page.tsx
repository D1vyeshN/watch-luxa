'use client';

import { useGetIdentity, useLogout } from '@refinedev/core';

interface Identity {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'superadmin';
}

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const { data: user } = useGetIdentity<Identity>();
  const { mutate: logout } = useLogout();

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, marginBottom: 8 }}>
          Welcome back, {user?.name?.split(' ')[0] || 'Admin'}.
        </h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ color: '#666' }}>{user?.email}</span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: 12,
              backgroundColor: user?.role === 'superadmin' ? '#faad14' : '#1890ff',
              color: 'white',
            }}
          >
            {user?.role}
          </span>
        </div>
      </div>

      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: 24,
          backgroundColor: 'white',
        }}
      >
        <h2 style={{ marginTop: 0 }}>Step 2 — Auth Verification</h2>
        <p>You are signed in. The following are now working:</p>
        <ul style={{ paddingLeft: 20, lineHeight: 1.8 }}>
          <li>
            <strong>authProvider</strong> — login, logout, check, getIdentity,
            getPermissions
          </li>
          <li>
            <strong>accessControlProvider</strong> — role-based rules
          </li>
          <li>
            <strong>&lt;Authenticated&gt;</strong> — dashboard is protected
          </li>
          <li>
            <strong>Auto-refresh</strong> — 401 triggers token refresh
          </li>
          <li>
            <strong>Role check</strong> — only admin/superadmin can sign in
          </li>
        </ul>
        <p style={{ color: '#666', marginTop: 16, marginBottom: 0 }}>
          Sign out to test the auth redirect.
        </p>
        <button
          onClick={() => logout()}
          style={{
            marginTop: 16,
            padding: '8px 16px',
            backgroundColor: '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
