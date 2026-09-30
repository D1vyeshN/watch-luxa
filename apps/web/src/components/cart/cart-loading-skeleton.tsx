import { Skeleton } from '@/components/ui/skeleton';

export function CartLoadingSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-14">
      <div>
        <Skeleton className="mb-6 h-6 w-40 bg-cream-200" />

        <div className="space-y-0">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[120px_1fr] gap-6 border-b border-forest-900/10 py-6 md:grid-cols-[120px_1fr_auto]"
            >
              <Skeleton className="aspect-square bg-cream-200" />
              <div className="space-y-3">
                <Skeleton className="h-5 w-3/4 bg-cream-200" />
                <Skeleton className="h-3 w-1/3 bg-cream-200" />
                <Skeleton className="h-3 w-1/4 bg-cream-200" />
              </div>
              <div className="hidden flex-col items-end justify-between md:flex">
                <Skeleton className="h-9 w-32 bg-cream-200" />
                <Skeleton className="h-4 w-20 bg-cream-200" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Skeleton className="h-[500px] w-full bg-cream-200" />
      </div>
    </div>
  );
}
