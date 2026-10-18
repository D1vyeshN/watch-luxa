'use client';

import { HeroForm } from '@/components/homepage/hero-form';

export default function HomepagePage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Content
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Homepage Hero</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The banner at the top of the storefront: images or video, text, buttons, and carousel.
        </p>
      </div>

      <HeroForm />
    </div>
  );
}
