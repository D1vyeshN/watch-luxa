import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Container } from '@/components/shared/container';
import { PageHero } from '@/components/content';
import { JOURNAL_POSTS } from '@/lib/content/journal';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Stories, guides, and reflections on horology.',
};

export default function JournalPage() {
  const [featured, ...rest] = JOURNAL_POSTS;

  return (
    <>
      <PageHero
        overline="The Journal"
        title="Stories of Time"
        subtitle="Essays, guides, and reflections on horology, craftsmanship, and the pieces we carry."
      />

      <Container className="py-12 md:py-20">
        {/* Featured post */}
        <Link
          href={ROUTES.journalPost(featured.slug)}
          className="group grid items-center gap-8 border-b border-forest-900/10 pb-12 md:grid-cols-2 md:gap-12 md:pb-16"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-cream-200">
            <Image
              src={featured.image}
              alt={featured.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
            />
          </div>

          <div>
            <p className="label-luxe">{featured.category}</p>
            <h2 className="heading-luxe mt-3 text-3xl transition-colors group-hover:text-cream-700 md:text-4xl">
              {featured.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-soft">
              {featured.excerpt}
            </p>
            <p className="mt-6 text-xs uppercase tracking-[0.14em] text-ink-muted">
              {formatDate(featured.publishedAt)} · {featured.readTime} min read
            </p>
          </div>
        </Link>

        {/* Grid */}
        <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-12 lg:grid-cols-3">
          {rest.map((post) => (
            <Link
              key={post.slug}
              href={ROUTES.journalPost(post.slug)}
              className="group block"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-cream-200">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                />
              </div>

              <div className="mt-5">
                <p className="label-luxe">{post.category}</p>
                <h3 className="heading-luxe mt-2 text-xl transition-colors group-hover:text-cream-700">
                  {post.title}
                </h3>
                <p className="mt-3 line-clamp-2 text-sm text-ink-soft">
                  {post.excerpt}
                </p>
                <p className="mt-4 text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                  {formatDate(post.publishedAt)} · {post.readTime} min read
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </>
  );
}
