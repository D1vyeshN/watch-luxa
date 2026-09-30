'use client';

import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { ProductVariant } from '@/types/catalog';

interface ProductGalleryProps {
  images: string[];
  heroImage: string;
  productName: string;
  currentVariant?: ProductVariant | null;
}

export function ProductGallery({
  images,
  heroImage,
  productName,
  currentVariant,
}: ProductGalleryProps) {
  const allImages = useMemo(() => {
    const set = new Set<string>();
    if (heroImage) set.add(heroImage);
    const variantImages = currentVariant?.images ?? [];
    variantImages.forEach((img) => set.add(img));
    images.forEach((img) => set.add(img));
    return Array.from(set);
  }, [heroImage, images, currentVariant?.images]);

  const [activeIndex, setActiveIndex] = useState(0);

  // Reset to first image when variant changes
  useEffect(() => {
    setActiveIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVariant?.id]);

  const activeImage = allImages[activeIndex] ?? heroImage;

  return (
    <div className="flex flex-col gap-4 md:flex-row-reverse md:gap-6">
      {/* Main image */}
      <div className="relative flex-1">
        <div className="relative aspect-square overflow-hidden bg-cream-200">
          <Image
            src={activeImage}
            alt={productName}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-cover"
          />
        </div>
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto md:flex-col md:overflow-visible">
          {allImages.map((img, index) => (
            <button
              key={`${img}-${index}`}
              onClick={() => setActiveIndex(index)}
              className={cn(
                'relative h-20 w-20 shrink-0 overflow-hidden bg-cream-200 transition-all duration-300',
                'border',
                index === activeIndex
                  ? 'border-forest-900'
                  : 'border-transparent hover:border-forest-900/30'
              )}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={img}
                alt={`${productName} – view ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
