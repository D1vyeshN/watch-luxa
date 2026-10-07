import { OrdersTable } from '@/components/orders/orders-table';

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Sales
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Find and fulfill customer orders.
        </p>
      </div>

      <OrdersTable />
    </div>
  );
}
