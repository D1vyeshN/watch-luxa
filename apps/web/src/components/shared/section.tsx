import { cn } from '@/lib/utils';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
  background?: 'default' | 'cream' | 'forest';
}

const spacings = {
  sm: 'py-8 md:py-12',
  md: 'py-12 md:py-20',
  lg: 'py-16 md:py-28',
};

const backgrounds = {
  default: 'bg-background',
  cream: 'bg-cream-200',
  forest: 'bg-forest-900 text-cream-100',
};

export function Section({
  children,
  className,
  spacing = 'md',
  background = 'default',
}: SectionProps) {
  return (
    <section
      className={cn(spacings[spacing], backgrounds[background], className)}
    >
      {children}
    </section>
  );
}
