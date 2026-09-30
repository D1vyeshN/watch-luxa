import { Container } from '@/components/shared/container';
import { cn } from '@/lib/utils';

interface ProseSectionProps {
  children: React.ReactNode;
  size?: 'default' | 'narrow' | 'wide';
  className?: string;
}

const sizes = {
  narrow: 'max-w-2xl',
  default: 'max-w-3xl',
  wide: 'max-w-5xl',
};

export function ProseSection({
  children,
  size = 'default',
  className,
}: ProseSectionProps) {
  return (
    <Container className={cn('py-12 md:py-20', className)}>
      <div className={cn('mx-auto space-y-6', sizes[size])}>{children}</div>
    </Container>
  );
}

interface ProseHeadingProps {
  children: React.ReactNode;
  level?: 2 | 3;
}

export function ProseHeading({ children, level = 2 }: ProseHeadingProps) {
  const Tag = level === 2 ? 'h2' : 'h3';
  const size = level === 2 ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl';

  return (
    <Tag className={cn('heading-luxe mt-10 first:mt-0', size)}>{children}</Tag>
  );
}

export function ProseParagraph({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-base leading-relaxed text-ink-soft md:text-lg">
      {children}
    </p>
  );
}

export function ProseList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3 text-base leading-relaxed text-ink-soft md:text-lg">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="text-cream-600">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
