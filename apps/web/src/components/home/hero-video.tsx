'use client';

import { useEffect, useRef, useState } from 'react';

interface HeroVideoProps {
  src: string;
  /** Inactive carousel slides stay paused and don't download the video yet */
  active?: boolean;
}

// Muted background video. The slide's poster image sits underneath it, so
// visitors who prefer reduced motion (or whose browser blocks autoplay) see that.
export function HeroVideo({ src, active = true }: HeroVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (active && !reducedMotion) {
      // Rejected when autoplay is blocked — the poster stays visible
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [active, reducedMotion]);

  if (reducedMotion) return null;

  return (
    <video
      ref={ref}
      src={src}
      className="absolute inset-0 h-full w-full object-cover"
      muted
      loop
      playsInline
      preload={active ? 'auto' : 'none'}
      aria-hidden
      tabIndex={-1}
    />
  );
}
