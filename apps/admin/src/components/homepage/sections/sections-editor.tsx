'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCustom, useCustomMutation } from '@refinedev/core';
import { Loader2, Plus, Save } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDateTime } from '@/lib/format/currency';
import { sectionErrors } from '@/lib/validation/homepage-sections';
import {
  HOME_MAX_SECTIONS,
  SECTION_TYPE_LABELS,
  type HomeSection,
  type HomeSectionType,
  type HomepageContent,
} from '@/types/homepage';
import { SectionCard } from './section-card';
import { listOps } from './fields';

const ID_PREFIX: Record<HomeSectionType, string> = {
  categoryBento: 'category-grid',
  productRail: 'product-row',
  maison: 'story',
  editorial: 'editorial',
  services: 'services',
  faq: 'faq',
};

/** A short slug id not used by any other section ("product-row-2") */
function uniqueId(type: HomeSectionType, sections: HomeSection[]): string {
  const taken = new Set(sections.map((s) => s.id));
  const prefix = ID_PREFIX[type];
  if (!taken.has(prefix)) return prefix;
  for (let n = 2; ; n++) if (!taken.has(`${prefix}-${n}`)) return `${prefix}-${n}`;
}

/** A new section of each type: sensible defaults, text left for the admin to write */
function newSection(type: HomeSectionType, id: string): HomeSection {
  const base = { id, enabled: true };
  switch (type) {
    case 'categoryBento':
      return { ...base, type, title: 'Explore the Collection', tiles: [] };
    case 'productRail':
      return { ...base, type, title: '', source: 'featured', limit: 4 };
    case 'maison':
      return { ...base, type, headline: '', body: '', imageUrl: '', pillars: [] };
    case 'editorial':
      return { ...base, type, variant: 'immersive', headline: '', body: '', imageUrl: '' };
    case 'services': {
      const card = { title: '', body: '', link: { label: '', href: '' } };
      return { ...base, type, title: '', services: [{ ...card }, { ...card }, { ...card }] };
    }
    case 'faq':
      return { ...base, type, title: 'Questions, answered', questions: [] };
  }
}

const same = (a: HomeSection[], b: HomeSection[]) => JSON.stringify(a) === JSON.stringify(b);

export function SectionsEditor() {
  const { query } = useCustom<HomepageContent>({
    url: '/admin/homepage',
    method: 'get',
    queryOptions: { refetchOnWindowFocus: false },
  });
  const homepage = query.data?.data;

  const { mutate: save, mutation } = useCustomMutation<{ sections: HomeSection[] }>();
  const isSaving = mutation.isPending;

  // Unsaved edits; null means "showing what's saved"
  const [draft, setDraft] = useState<HomeSection[] | null>(null);
  const saved = homepage?.sections ?? [];
  const sections = draft ?? saved;
  const setSections = (next: HomeSection[]) => setDraft(next);
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  // Errors only show after a save attempt, so a half-written new section isn't red
  const [showErrors, setShowErrors] = useState(false);

  const dirty = draft !== null && !same(draft, saved);
  const errors = useMemo(() => sectionErrors(sections), [sections]);

  // Leaving with unsaved changes asks first
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const setOpen = (id: string, open: boolean) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });

  const add = (type: HomeSectionType) => {
    const section = newSection(type, uniqueId(type, sections));
    setSections([...sections, section]);
    setOpen(section.id, true);
  };

  const duplicate = (index: number) => {
    const copy = { ...structuredClone(sections[index]), id: uniqueId(sections[index].type, sections) };
    setSections([...sections.slice(0, index + 1), copy, ...sections.slice(index + 1)]);
    setOpen(copy.id, true);
  };

  const onSave = () => {
    setShowErrors(true);
    if (errors.size > 0) {
      // Open every section with a problem so the messages are visible
      setOpenIds((prev) => new Set([...prev, ...[...errors.keys()].map((i) => sections[i]?.id).filter(Boolean)]));
      toast.error('Fix the highlighted sections before saving');
      return;
    }

    save(
      { url: '/admin/homepage/sections', method: 'put', values: { sections }, errorNotification: false },
      {
        onSuccess: () => {
          setShowErrors(false);
          toast.success('Homepage saved — the storefront updates shortly');
          // Drop the draft only once the saved copy is back, so nothing flashes
          query.refetch().then(() => setDraft(null));
        },
        onError: (err) => toast.error(err.message || 'Failed to save the homepage'),
      }
    );
  };

  if (query.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (query.isError || !homepage) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Failed to load homepage content. Is the backend running?
      </div>
    );
  }

  const listError = errors.get(-1);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">
            Sections ({sections.length}/{HOME_MAX_SECTIONS})
          </h2>
          <p className="text-xs text-muted-foreground">
            Shown below the hero in this order. Empty sections (e.g. a product row with nothing to show) are
            skipped, and background tones alternate automatically.
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="sm" disabled={sections.length >= HOME_MAX_SECTIONS}>
              <Plus className="mr-2 h-3.5 w-3.5" />
              Add section
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            {(Object.keys(SECTION_TYPE_LABELS) as HomeSectionType[]).map((type) => (
              <DropdownMenuItem key={type} onSelect={() => add(type)} className="flex-col items-start gap-0.5">
                <span className="text-sm font-medium">{SECTION_TYPE_LABELS[type].label}</span>
                <span className="text-xs text-muted-foreground">{SECTION_TYPE_LABELS[type].hint}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {showErrors && listError && <p className="text-sm text-destructive">{listError.join(' ')}</p>}

      {sections.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No sections — only the hero shows on the homepage. Use “Add section” to build the page.
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section, i) => (
            <SectionCard
              key={section.id}
              section={section}
              index={i}
              count={sections.length}
              open={openIds.has(section.id)}
              errors={showErrors ? errors.get(i) : undefined}
              onOpenChange={(open) => setOpen(section.id, open)}
              onChange={(next) => setSections(listOps.replace(sections, i, next))}
              onMove={(to) => setSections(listOps.move(sections, i, to))}
              onDuplicate={sections.length < HOME_MAX_SECTIONS ? () => duplicate(i) : undefined}
              onRemove={() => setSections(listOps.remove(sections, i))}
            />
          ))}
        </div>
      )}

      <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-border bg-background/95 py-4 backdrop-blur">
        <p className="text-xs text-muted-foreground">
          {dirty ? 'Unsaved changes' : `Last saved ${formatDateTime(homepage.updatedAt)}`}
        </p>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setDraft(null);
              setShowErrors(false);
            }}
            disabled={isSaving || !dirty}
          >
            Discard changes
          </Button>
          <Button type="button" onClick={onSave} disabled={isSaving || !dirty}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Sections
          </Button>
        </div>
      </div>
    </div>
  );
}
