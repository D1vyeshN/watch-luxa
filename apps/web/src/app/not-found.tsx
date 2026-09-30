import Link from 'next/link';
import { Container } from '@/components/shared/container';

export default function NotFound() {
  return (
    <Container>
      <div className="flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
        <p className="label-luxe">Error 404</p>

        <h1 className="heading-luxe mt-4 text-6xl md:text-8xl">
          Page not found
        </h1>

        <p className="mt-6 max-w-md text-sm text-ink-soft">
          The page you are looking for may have been moved, renamed, or no
          longer exists.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-sm bg-forest-900 px-6 py-3 text-xs uppercase tracking-[0.18em] text-cream-100 transition-colors hover:bg-forest-800"
          >
            Return home
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-sm border border-forest-900 px-6 py-3 text-xs uppercase tracking-[0.18em] text-forest-900 transition-colors hover:bg-forest-900 hover:text-cream-100"
          >
            Browse watches
          </Link>
        </div>
      </div>
    </Container>
  );
}
