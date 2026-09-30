import { Container } from '@/components/shared/container';

export function NewsletterCTA() {
  return (
    <section className="border-t border-forest-900/10 bg-cream-100">
      <Container className="py-16 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="label-luxe">The LUXE Circle</p>
          <h2 className="heading-luxe mt-4 text-3xl md:text-4xl lg:text-5xl">
            Stories, private events, new arrivals.
          </h2>
          <p className="mt-4 text-sm text-ink-soft md:text-base">
            Join our newsletter and be the first to know when exceptional
            timepieces arrive.
          </p>

          {/* Subscribe form — wired in a later step */}
          <div className="mx-auto mt-8 flex max-w-md items-center border border-forest-900/20 bg-cream-50 p-1">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 bg-transparent px-4 py-3 text-sm text-forest-900 outline-none placeholder:text-ink-muted"
              aria-label="Email address"
            />
            <button
              className="bg-forest-900 px-6 py-3 text-[10px] font-medium uppercase tracking-[0.18em] text-cream-100 transition-colors hover:bg-forest-800"
              type="button"
            >
              Subscribe
            </button>
          </div>

          <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-ink-muted">
            Subscribe form coming in a future step
          </p>
        </div>
      </Container>
    </section>
  );
}
