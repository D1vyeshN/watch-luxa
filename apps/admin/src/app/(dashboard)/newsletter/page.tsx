import { SubscribersTable } from '@/components/newsletter/subscribers-table';

export default function NewsletterPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Content
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Newsletter</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everyone who signed up on the storefront. Export the list for your mailing tool; unsubscribe
          anyone who asks by email.
        </p>
      </div>

      <SubscribersTable />
    </div>
  );
}
