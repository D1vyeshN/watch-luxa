'use client';

import { ArrowDown, ArrowUp, ChevronDown, Copy, Eye, EyeOff, LayoutGrid, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { SECTION_TYPE_LABELS, RAIL_SOURCE_LABELS, type HomeSection } from '@/types/homepage';
import { BentoEditor } from './bento-editor';
import { RailEditor } from './rail-editor';
import { EditorialEditor, MaisonEditor, ServicesEditor } from './content-editors';
import { FaqEditor } from './faq-editor';

/** What the admin recognises a section by in the collapsed list */
function summary(section: HomeSection): { heading: string; detail?: string; thumb?: string } {
  switch (section.type) {
    case 'categoryBento':
      return { heading: section.title, detail: `${section.tiles.length} tiles`, thumb: section.tiles[0]?.imageUrl };
    case 'productRail':
      return { heading: section.title, detail: `${RAIL_SOURCE_LABELS[section.source]} · ${section.limit} shown` };
    case 'maison':
      return { heading: section.headline, thumb: section.imageUrl };
    case 'editorial':
      return {
        heading: section.headline,
        detail: section.variant === 'immersive' ? 'Full width' : 'Photo beside text',
        thumb: section.imageUrl,
      };
    case 'services':
      return { heading: section.title, thumb: section.backgroundImage };
    case 'faq':
      return { heading: section.title, detail: `${section.questions.length} questions` };
  }
}

interface SectionCardProps {
  section: HomeSection;
  index: number;
  count: number;
  open: boolean;
  errors?: string[];
  onOpenChange: (open: boolean) => void;
  onChange: (section: HomeSection) => void;
  onMove: (to: number) => void;
  onDuplicate?: () => void; // undefined when the section limit is reached
  onRemove: () => void;
}

export function SectionCard({
  section,
  index,
  count,
  open,
  errors,
  onOpenChange,
  onChange,
  onMove,
  onDuplicate,
  onRemove,
}: SectionCardProps) {
  const { heading, detail, thumb } = summary(section);
  const type = SECTION_TYPE_LABELS[section.type].label;
  const n = index + 1;

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <Card className={cn(errors?.length && 'border-destructive/60', !section.enabled && 'opacity-70')}>
        <CardHeader className="flex flex-row items-center gap-3 space-y-0 p-4">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-3 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="relative flex h-10 w-16 shrink-0 items-center justify-center overflow-hidden rounded bg-muted">
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element -- tiny admin thumbnail, any host
                  <img src={thumb} alt="" className="h-full w-full object-cover" />
                ) : (
                  <LayoutGrid className="h-4 w-4 text-muted-foreground" aria-hidden />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {n}. {heading || 'Untitled'}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {type}
                  {detail && ` · ${detail}`}
                  {!section.enabled && ' · Hidden'}
                  {errors?.length ? <span className="text-destructive"> · Needs attention</span> : null}
                </p>
              </div>
              <ChevronDown
                className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
                aria-hidden
              />
            </button>
          </CollapsibleTrigger>

          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onChange({ ...section, enabled: !section.enabled })}
              aria-pressed={!section.enabled}
              aria-label={section.enabled ? `Hide section ${n}` : `Show section ${n}`}
              title={section.enabled ? 'Hide on the storefront' : 'Show on the storefront'}
            >
              {section.enabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => onMove(index - 1)} disabled={index === 0} aria-label={`Move section ${n} up`}>
              <ArrowUp className="h-3.5 w-3.5" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => onMove(index + 1)} disabled={index === count - 1} aria-label={`Move section ${n} down`}>
              <ArrowDown className="h-3.5 w-3.5" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onDuplicate} disabled={!onDuplicate} aria-label={`Duplicate section ${n}`}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={onRemove}
              aria-label={`Delete section ${n}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4 border-t border-border p-4">
            {errors?.length ? (
              <ul className="space-y-1 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                {[...new Set(errors)].map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            ) : null}

            {section.type === 'categoryBento' && <BentoEditor section={section} onChange={onChange} />}
            {section.type === 'productRail' && <RailEditor section={section} onChange={onChange} />}
            {section.type === 'maison' && <MaisonEditor section={section} onChange={onChange} />}
            {section.type === 'editorial' && <EditorialEditor section={section} onChange={onChange} />}
            {section.type === 'services' && <ServicesEditor section={section} onChange={onChange} />}
            {section.type === 'faq' && <FaqEditor section={section} onChange={onChange} />}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
