import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Container } from '@/components/shared/container';
import { PageHero } from '@/components/content';
import { JOURNAL_POSTS, getPostBySlug } from '@/lib/content/journal';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/lib/format';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return JOURNAL_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) return { title: 'Post not found' };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.image }],
      type: 'article',
      publishedTime: post.publishedAt,
    },
  };
}

export default async function JournalPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  return (
    <>
      <PageHero
        overline={post.category}
        title={post.title}
        backHref={ROUTES.journal}
        backLabel="All articles"
      />

      <Container className="py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.14em] text-ink-muted">
            <span>{post.author}</span>
            <span>·</span>
            <span>{formatDate(post.publishedAt)}</span>
            <span>·</span>
            <span>{post.readTime} min read</span>
          </div>

          {/* Hero image */}
          <div className="relative mt-10 aspect-[16/9] overflow-hidden bg-cream-200">
            <Image
              src={post.image}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover"
            />
          </div>

          {/* Body */}
          <article className="mt-12 space-y-6">
            {post.content.map((paragraph, i) => (
              <p
                key={i}
                className="text-lg leading-relaxed text-ink-soft md:text-xl md:leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
          </article>
        </div>
      </Container>
    </>
  );
}
