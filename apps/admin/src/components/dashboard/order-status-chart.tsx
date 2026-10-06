'use client';

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { OrderStatusBreakdown } from '@/types/analytics';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  paid: '#0ea5e9',
  processing: '#8b5cf6',
  shipped: '#3b82f6',
  delivered: '#10b981',
  cancelled: '#ef4444',
  refunded: '#6b7280',
};

interface OrderStatusChartProps {
  data: OrderStatusBreakdown['orderStatus'];
}

export function OrderStatusChart({ data }: OrderStatusChartProps) {
  const chartData = Object.entries(data)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      name: status,
      value: count,
      color: STATUS_COLORS[status] ?? '#94a3b8',
    }));

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Order Status</CardTitle>
        <p className="text-xs text-muted-foreground">
          {total} {total === 1 ? 'order' : 'orders'} in period
        </p>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[280px] items-center justify-center text-xs text-muted-foreground">
            No orders in this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                stroke="var(--card)"
                strokeWidth={2}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  fontSize: 12,
                  color: 'var(--foreground)',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => (
                  <span className="text-xs capitalize">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
