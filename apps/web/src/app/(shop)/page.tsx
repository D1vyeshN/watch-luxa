import { Container } from '@/components/shared/container';

export default function HomePage() {
  return (
    <Container className="py-20">
      <p className="label-luxe">Step 6 — Layout</p>
      <h1 className="heading-luxe mt-3 text-6xl">Layout is live.</h1>
      <p className="mt-6 max-w-lg text-ink-soft">
        Header, footer, mobile menu, and cart drawer are all wired up.
        Open the cart icon or resize to mobile to see it work.
      </p>
    </Container>
  );
}
