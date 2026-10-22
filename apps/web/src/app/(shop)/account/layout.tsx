import type { Metadata } from 'next';
import { env } from '@/config/env';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Container } from '@/components/shared/container';
import { AccountSidebar } from '@/components/account/account-sidebar';

// Default for /account; sub-pages set their own titles. Private throughout.
export const metadata: Metadata = {
  // A plain string title here would drop the root ' | LUXE' template for
  // everything below this segment, so pass the template on explicitly
  title: { default: 'Your Account', template: `%s | ${env.NEXT_PUBLIC_SITE_NAME}` },
  robots: { index: false, follow: false },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="border-b border-forest-900/10 bg-cream-100">
        <Container className="py-10 md:py-14">
          <p className="label-luxe">My Account</p>
          <h1 className="heading-luxe mt-3 text-3xl md:text-4xl">
            Account
          </h1>
        </Container>
      </div>

      <Container className="py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-14">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <AccountSidebar />
          </aside>

          <div className="min-w-0">{children}</div>
        </div>
      </Container>
    </ProtectedRoute>
  );
}
