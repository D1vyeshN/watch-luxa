import { CustomersTable } from '@/components/customers/customers-table';

export default function CustomersPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Sales
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Customers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everyone with a paid order, sorted by total spend.
        </p>
      </div>

      <CustomersTable />
    </div>
  );
}
