import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/constants/routes';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: Image */}
      <div className="relative hidden bg-forest-900 lg:block">
        <Image
          src="/images/auth-hero.jpg"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-forest-950/85 via-forest-950/40 to-transparent" />

        {/* Brand overlay */}
        <div className="absolute inset-x-12 bottom-12">
          <Link
            href={ROUTES.home}
            className="font-serif text-2xl tracking-[0.25em] text-cream-100"
          >
            LUXE
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream-200/80">
            Timepieces for those who measure moments, not minutes.
          </p>
        </div>
      </div>

      {/* Right: Content */}
      <div className="flex flex-col bg-cream-100">
        {/* Top bar */}
        <div className="flex items-center justify-between p-6 lg:p-10">
          <Link
            href={ROUTES.home}
            className="font-serif text-xl tracking-[0.25em] text-forest-900 lg:invisible"
          >
            LUXE
          </Link>

          <Link
            href={ROUTES.home}
            className="text-[10px] uppercase tracking-[0.18em] text-ink-muted transition-colors hover:text-forest-900"
          >
            ← Back to store
          </Link>
        </div>

        {/* Form area */}
        <div className="flex flex-1 items-center justify-center px-6 pb-16 lg:px-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
