import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/constants/routes';
import { isOptimizable } from '@/lib/images';
import type { Collection } from '@/types/catalog';

interface CollectionCardProps {
  collection: Collection;
  priority?: boolean;
}

// Photo card when the collection has artwork; otherwise a typographic forest
// card, so a directory of new, image-less collections still looks intentional.
export function CollectionCard({ collection, priority = false }: CollectionCardProps) {
  const { name, slug, description, image, productCount } = collection;

  return (
    <Link
      href={ROUTES.collection(slug)}
      className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden bg-forest-900 p-6 text-cream-100 md:p-8"
    >
      {image ? (
        <>
          <Image
            src={image}
            alt=""
            fill
            priority={priority}
            unoptimized={!isOptimizable(image)}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-900/85 via-forest-900/20 to-transparent" />
        </>
      ) : (
        // Hairline frame stands in for a photo
        <div aria-hidden className="absolute inset-4 border border-cream-600/30 transition-colors duration-500 group-hover:border-cream-600/60" />
      )}

      <div className="relative">
        {productCount > 0 && (
          <p className="text-sm text-cream-200/75">
            {productCount} {productCount === 1 ? 'piece' : 'pieces'}
          </p>
        )}
        <h2 className="mt-2 font-serif text-3xl leading-tight underline-offset-[6px] decoration-1 group-hover:underline md:text-4xl">
          {name}
        </h2>
        {description && (
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-cream-200/80">{description}</p>
        )}
      </div>
    </Link>
  );
}
