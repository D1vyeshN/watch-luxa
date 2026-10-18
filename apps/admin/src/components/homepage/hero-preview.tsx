'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { HeroSlideFormSchema } from '@/lib/validation/homepage';
import { frameStyle } from './image-framer';

// A scaled-down approximation of apps/web/src/components/home/hero.tsx so
// admins can see a slide before saving. Brand colours are hardcoded here
// because the admin theme doesn't ship the storefront's forest/cream palette.
const FOREST = '15, 35, 32'; // forest-900 #0f2320

interface HeroPreviewProps {
  slide: HeroSlideFormSchema;
  mobile?: boolean;
}

export function HeroPreview({ slide, mobile = false }: HeroPreviewProps) {
  const image = (mobile && slide.mobileImageUrl) || slide.imageUrl;
  const frame = mobile ? slide.mobileImageFrame : slide.imageFrame;
  const alpha = slide.overlayOpacity / 100;
  const centered = slide.textAlign === 'center';

  // Left-aligned text fades the overlay out to the right, like the storefront
  const overlay = centered
    ? `rgba(${FOREST}, ${alpha})`
    : `linear-gradient(to right, rgba(${FOREST}, ${Math.min(alpha + 0.2, 0.95)}), rgba(${FOREST}, ${alpha}), rgba(${FOREST}, ${alpha * 0.4}))`;

  return (
    <div
      className={cn(
        'relative mx-auto w-full overflow-hidden rounded-md bg-[#0f2320]',
        mobile ? 'aspect-[9/16] max-w-[220px]' : 'aspect-[16/9]'
      )}
    >
      {slide.mediaType === 'video' && slide.videoUrl ? (
        <video
          key={slide.videoUrl}
          src={slide.videoUrl}
          poster={image || undefined}
          className="absolute inset-0 h-full w-full object-cover"
          muted
          loop
          autoPlay
          playsInline
        />
      ) : image ? (
        <Image src={image} alt="" fill sizes="600px" className="object-cover" style={frameStyle(frame)} />
      ) : null}

      <div className="absolute inset-0" style={{ background: overlay }} />

      <div
        className={cn(
          'relative z-10 flex h-full flex-col justify-center p-[6%]',
          centered ? 'items-center text-center' : 'items-start text-left'
        )}
      >
        {slide.tagline && (
          <p className="text-[9px] uppercase tracking-[0.2em] text-[#c9a961]">{slide.tagline}</p>
        )}
        <p
          className={cn(
            'mt-2 font-serif leading-[1.05] text-[#f9f6ef]',
            mobile ? 'text-2xl' : 'text-3xl md:text-4xl'
          )}
        >
          {slide.headline || 'Headline'}
        </p>
        {slide.subtext && (
          <p className="mt-3 max-w-[70%] text-[10px] leading-relaxed text-[#f9f6ef]/80">{slide.subtext}</p>
        )}
        {(slide.primaryLabel || slide.secondaryLabel) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {slide.primaryLabel && (
              <span className="bg-[#c9a961] px-3 py-1.5 text-[8px] font-medium uppercase tracking-[0.18em] text-[#0f2320]">
                {slide.primaryLabel}
              </span>
            )}
            {slide.secondaryLabel && (
              <span className="border border-[#f9f6ef]/40 px-3 py-1.5 text-[8px] font-medium uppercase tracking-[0.18em] text-[#f9f6ef]">
                {slide.secondaryLabel}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
