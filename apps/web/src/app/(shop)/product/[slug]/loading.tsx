import { Container } from '@/components/shared/container';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <Container className="py-10 md:py-14">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Gallery skeleton */}
        <div className="flex flex-col gap-4 md:flex-row-reverse md:gap-6">
          <Skeleton className="aspect-square flex-1 rounded-none bg-cream-200" />
          <div className="flex gap-3 md:flex-col">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-20 w-20 rounded-none bg-cream-200"
              />
            ))}
          </div>
        </div>

        {/* Info skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-3 w-20 bg-cream-200" />
          <Skeleton className="h-10 w-3/4 bg-cream-200" />
          <Skeleton className="h-4 w-32 bg-cream-200" />
          <Skeleton className="h-8 w-40 bg-cream-200" />
          <Skeleton className="h-20 w-full bg-cream-200" />
          <Skeleton className="h-14 w-full bg-cream-200" />
        </div>
      </div>
    </Container>
  );
}
