import { cn } from '@/lib/utils';

export function customerInitials(name?: string) {
  const initials = (name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return initials || 'G';
}

export function CustomerAvatar({
  name,
  className,
}: {
  name?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-forest-900 font-medium text-cream-100 dark:bg-cream-600 dark:text-forest-900',
        className
      )}
    >
      {customerInitials(name)}
    </div>
  );
}
