import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Container } from '@/components/shared/container';

interface Crumb {
  label: string;
  href?: string;
}

interface ListingHeaderProps {
  title: string;
  description?: string;
  /** Wayfinding back up the catalogue; the last crumb is the current page */
  breadcrumbs?: Crumb[];
  imageUrl?: string;
  /** Small facts under the description, e.g. a brand's country and founding year */
  facts?: string[];
  children?: React.ReactNode;
}

export function ListingHeader({
  title,
  description,
  breadcrumbs,
  imageUrl,
  facts,
  children,
}: ListingHeaderProps) {
  return (
    <div className="border-b border-forest-900/10 bg-cream-100">
      <Container className="py-8 md:py-12">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-6 md:mb-8">
            <ol className="flex flex-wrap items-center gap-x-2 text-sm text-ink-soft">
              {breadcrumbs.map((c, i) => {
                const last = i === breadcrumbs.length - 1;
                return (
                  <li key={c.label} className="flex items-center gap-2">
                    {c.href && !last ? (
                      <Link href={c.href} className="underline-offset-4 hover:text-forest-900 hover:underline">
                        {c.label}
                      </Link>
                    ) : (
                      <span aria-current={last ? 'page' : undefined} className={last ? 'text-forest-900' : undefined}>
                        {c.label}
                      </span>
                    )}
                    {!last && <span aria-hidden className="text-ink-light">/</span>}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        <div className={cn('grid gap-8', imageUrl && 'lg:grid-cols-12 lg:items-center lg:gap-12')}>
          <div className={cn(imageUrl && 'lg:col-span-6')}>
            <h1 className="heading-luxe text-4xl leading-tight md:text-5xl lg:text-6xl">{title}</h1>
            {description && (
              <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-soft md:text-lg">
                {description}
              </p>
            )}
            {facts && facts.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-forest-900">
                {facts.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            )}
            {children}
          </div>

          {imageUrl && (
            <div className="relative aspect-[2/1] overflow-hidden bg-cream-200 lg:col-span-6 lg:aspect-[21/9]">
              <Image
                src={imageUrl}
                alt=""
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
