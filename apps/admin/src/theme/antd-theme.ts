import type { ThemeConfig } from 'antd';

export const luxeAdminTheme: ThemeConfig = {
  token: {
    // ─── Brand ───
    colorPrimary: '#0f2320',
    colorSuccess: '#059669',
    colorWarning: '#d97706',
    colorError: '#dc2626',
    colorInfo: '#2563eb',

    // ─── Text ───
    colorText: '#111827',
    colorTextSecondary: '#6b7280',
    colorTextTertiary: '#9ca3af',

    // ─── Backgrounds ───
    colorBgBase: '#ffffff',
    colorBgLayout: '#f9fafb',
    colorBgContainer: '#ffffff',

    // ─── Border ───
    colorBorder: '#e5e7eb',
    colorBorderSecondary: '#f3f4f6',

    // ─── Radius ───
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,

    // ─── Typography ───
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 14,
  },
  components: {
    Layout: {
      siderBg: '#111827',
      headerBg: '#ffffff',
      bodyBg: '#f9fafb',
    },
    Menu: {
      darkItemBg: '#111827',
      darkItemColor: '#9ca3af',
      darkItemHoverBg: '#1f2937',
      darkItemHoverColor: '#ffffff',
      darkItemSelectedBg: '#0f2320',
      darkItemSelectedColor: '#f9f6ef',
    },
    Table: {
      headerBg: '#f9fafb',
      headerColor: '#6b7280',
      rowHoverBg: '#f9fafb',
      cellPaddingBlock: 12,
      cellPaddingInline: 16,
    },
    Button: {
      primaryShadow: 'none',
      defaultShadow: 'none',
      dangerShadow: 'none',
    },
  },
};
