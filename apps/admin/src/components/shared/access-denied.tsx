import { ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// <CanAccess fallback> for superadmin-only pages. The API enforces the same
// rule (authorize('superadmin')); this is just the UX.
export function AccessDenied({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-2xl pt-12">
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
          <ShieldAlert className="h-10 w-10 text-destructive" aria-hidden />
          <h1 className="text-lg font-semibold">Access denied</h1>
          <p className="text-sm text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}
