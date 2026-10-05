'use client';

import { useState } from 'react';
import { useCustom } from '@refinedev/core';
import { Loader2, DollarSign, ShoppingBag, Users, TrendingUp } from 'lucide-react';

import { StatCard } from '@/components/dashboard/stat-card';
import { SalesChart } from '@/components/dashboard/sales-chart';
import { OrderStatusChart } from '@/components/dashboard/order-status-chart';
import { TopProducts } from '@/components/dashboard/top-products';
import { RecentOrders } from '@/components/dashboard/recent-orders';
import { LowStockList } from '@/components/dashboard/low-stock-list';
import { OpsSummary } from '@/components/dashboard/ops-summary';
import { DateRangeSelector } from '@/components/dashboard/date-range-selector';

import { formatPrice, formatNumber } from '@/lib/format/currency';
import type {
  DashboardResponse,
  DateRangePreset,
  TopProduct,
  RecentOrder,
  LowStockVariant,
} from '@/types/analytics';

export default function DashboardPage() {
  const [preset, setPreset] = useState<DateRangePreset>('30d');

  // ─── Main dashboard data ───
  const {
    data: dashboardResponse,
    isLoading: isLoadingDashboard,
    isError: isDashboardError,
  } = useCustom<DashboardResponse>({
    url: `/admin/analytics/dashboard`,
    method: 'get',
    config: {
      query: { preset },
    },
    queryOptions: {
      staleTime: 60 * 1000,
    },
  }) as any;

  // ─── Top products ───
  const { data: topProductsResponse } = useCustom({
    url: `/admin/analytics/top-products`,
    method: 'get',
    config: { query: { preset, limit: 5 } },
    queryOptions: {
      staleTime: 60 * 1000,
    },
  }) as any;

  // ─── Recent orders ───
  const { data: recentOrdersResponse } = useCustom({
    url: `/admin/analytics/recent-orders`,
    method: 'get',
    config: { query: { limit: 5 } },
    queryOptions: {
      staleTime: 60 * 1000,
    },
  }) as any;

  // ─── Low stock ───
  const { data: lowStockResponse } = useCustom({
    url: `/admin/analytics/low-stock`,
    method: 'get',
    config: { query: { limit: 5 } },
    queryOptions: {
      staleTime: 60 * 1000,
    },
  }) as any;

  const dashboard = dashboardResponse?.data;
  const topProducts = topProductsResponse?.data ?? [];
  const recentOrders = recentOrdersResponse?.data ?? [];
  const lowStock = lowStockResponse?.data ?? [];

  const isInitialLoading = isLoadingDashboard && !dashboard;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Overview
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Business health at a glance.
          </p>
        </div>

        <DateRangeSelector value={preset} onChange={setPreset} />
      </div>

      {/* ─── Error ─── */}
      {isDashboardError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Failed to load dashboard data. Is the backend running?
        </div>
      )}

      {/* ─── Loading ─── */}
      {isInitialLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : dashboard ? (
        <>
          {/* ─── KPI Cards ─── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Revenue"
              value={formatPrice(dashboard.current.revenue)}
              comparison={dashboard.comparison.revenue}
              icon={<DollarSign className="h-4 w-4" />}
            />
            <StatCard
              label="Orders"
              value={formatNumber(dashboard.current.orders)}
              comparison={dashboard.comparison.orders}
              icon={<ShoppingBag className="h-4 w-4" />}
            />
            <StatCard
              label="Avg Order Value"
              value={formatPrice(dashboard.current.averageOrderValue)}
              comparison={dashboard.comparison.averageOrderValue}
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <StatCard
              label="Customers"
              value={formatNumber(dashboard.current.customers)}
              comparison={dashboard.comparison.customers}
              icon={<Users className="h-4 w-4" />}
            />
          </div>

          {/* ─── Operational counters ─── */}
          <OpsSummary data={dashboard.growth} />

          {/* ─── Charts row ─── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <SalesChart data={dashboard.salesTrend} />
            </div>
            <div>
              <OrderStatusChart data={dashboard.orderStatus.orderStatus} />
            </div>
          </div>

          {/* ─── Bottom row ─── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <TopProducts data={topProducts} />
            <RecentOrders data={recentOrders} />
            <LowStockList
              data={lowStock}
              totalLow={dashboard.growth.lowStockVariants}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
