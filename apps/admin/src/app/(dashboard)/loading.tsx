import { Loader2 } from 'lucide-react';

// Shown inside the dashboard shell while a route segment loads
export default function DashboardLoading() {
  return (
    <div role="status" className="flex h-64 items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
