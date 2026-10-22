'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  MAISON_MAX_PILLARS,
  type EditorialSection,
  type MaisonSection,
  type ServiceCard,
  type ServicesSection,
} from '@/types/homepage';
import { ImageField, ItemControls, LinkField, TextField, listOps } from './fields';

// ─── Story + pillars ───

export function MaisonEditor({
  section,
  onChange,
}: {
  section: MaisonSection;
  onChange: (section: MaisonSection) => void;
}) {
  const pillars = section.pillars;
  const setPillars = (next: MaisonSection['pillars']) => onChange({ ...section, pillars: next });

  return (
    <div className="space-y-5">
      <TextField label="Headline" required max={120} value={section.headline} onChange={(v) => onChange({ ...section, headline: v ?? '' })} />
      <TextField label="Story" required multiline max={600} value={section.body} onChange={(v) => onChange({ ...section, body: v ?? '' })} />

      <div className="grid gap-4 md:grid-cols-2">
        <ImageField
          label="Photo"
          aspect="square"
          value={section.imageUrl}
          onChange={(url) => onChange({ ...section, imageUrl: url ?? '' })}
          hint="Shown tall (4:5) beside the story."
        />
        <TextField
          label="Photo description"
          max={200}
          value={section.imageAlt}
          onChange={(v) => onChange({ ...section, imageAlt: v })}
          hint="For screen readers. Leave empty if the photo is purely atmospheric."
          multiline
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <Label>
            Pillars ({pillars.length}/{MAISON_MAX_PILLARS})
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pillars.length >= MAISON_MAX_PILLARS}
            onClick={() => setPillars([...pillars, { title: '', body: '' }])}
          >
            <Plus className="mr-2 h-3.5 w-3.5" />
            Add pillar
          </Button>
        </div>
        {pillars.map((p, i) => (
          <div key={i} className="flex gap-3 rounded-md border border-border p-3">
            <div className="grid flex-1 gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              <TextField label={`Pillar ${i + 1} title`} required max={60} value={p.title} onChange={(v) => setPillars(listOps.replace(pillars, i, { ...p, title: v ?? '' }))} />
              <TextField label="Text" required max={200} value={p.body} onChange={(v) => setPillars(listOps.replace(pillars, i, { ...p, body: v ?? '' }))} />
            </div>
            <ItemControls
              index={i}
              count={pillars.length}
              name={`pillar ${i + 1}`}
              onMove={(to) => setPillars(listOps.move(pillars, i, to))}
              onRemove={() => setPillars(listOps.remove(pillars, i))}
            />
          </div>
        ))}
      </div>

      <LinkField label="Button" value={section.cta} onChange={(v) => onChange({ ...section, cta: v })} />
    </div>
  );
}

// ─── Editorial banner ───

export function EditorialEditor({
  section,
  onChange,
}: {
  section: EditorialSection;
  onChange: (section: EditorialSection) => void;
}) {
  const split = section.variant === 'split';

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Layout</Label>
          <Select
            value={section.variant}
            onValueChange={(v) =>
              onChange({ ...section, variant: v as EditorialSection['variant'], reverse: v === 'split' ? section.reverse : undefined })
            }
          >
            <SelectTrigger className="w-full" aria-label="Layout">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immersive">Full-width photo, text over it</SelectItem>
              <SelectItem value="split">Photo beside text</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {split && (
          <label className="flex items-center gap-3 self-end rounded-md border border-border p-3 text-sm">
            <Checkbox
              checked={section.reverse ?? false}
              onCheckedChange={(c) => onChange({ ...section, reverse: c === true || undefined })}
            />
            Photo on the right
          </label>
        )}
      </div>

      <TextField label="Headline" required max={120} value={section.headline} onChange={(v) => onChange({ ...section, headline: v ?? '' })} />
      <TextField label="Text" required multiline max={600} value={section.body} onChange={(v) => onChange({ ...section, body: v ?? '' })} />

      <div className="grid gap-4 md:grid-cols-2">
        <ImageField
          label="Photo"
          aspect={split ? 'square' : 'wide'}
          value={section.imageUrl}
          onChange={(url) => onChange({ ...section, imageUrl: url ?? '' })}
          hint={split ? 'Shown square beside the text.' : 'Full width; keep the left side calm for the text.'}
        />
        <TextField
          label="Photo description"
          max={200}
          multiline
          value={section.imageAlt}
          onChange={(v) => onChange({ ...section, imageAlt: v })}
          hint="For screen readers. Leave empty if the photo is purely atmospheric."
        />
      </div>

      <LinkField label="Button" value={section.cta} onChange={(v) => onChange({ ...section, cta: v })} />
    </div>
  );
}

// ─── Service cards ───

const CARD_ROLES = ['Left card', 'Middle card (highlighted)', 'Right card'];

export function ServicesEditor({
  section,
  onChange,
}: {
  section: ServicesSection;
  onChange: (section: ServicesSection) => void;
}) {
  const setCard = (i: number, card: ServiceCard) =>
    onChange({ ...section, services: listOps.replace(section.services, i, card) as ServicesSection['services'] });

  return (
    <div className="space-y-5">
      <TextField label="Title" required max={120} value={section.title} onChange={(v) => onChange({ ...section, title: v ?? '' })} />
      <TextField label="Description" max={200} value={section.description} onChange={(v) => onChange({ ...section, description: v })} />
      <ImageField
        label="Background photo"
        value={section.backgroundImage}
        onChange={(url) => onChange({ ...section, backgroundImage: url })}
        hint="Optional. Shown faintly behind the cards under a cream wash."
      />

      <div className="grid gap-3 lg:grid-cols-3">
        {section.services.map((card, i) => (
          <fieldset key={i} className="space-y-3 rounded-md border border-border p-3">
            <legend className="px-1 text-xs text-muted-foreground">{CARD_ROLES[i]}</legend>
            <TextField label="Title" required max={60} value={card.title} onChange={(v) => setCard(i, { ...card, title: v ?? '' })} />
            <TextField label="Text" required multiline max={240} value={card.body} onChange={(v) => setCard(i, { ...card, body: v ?? '' })} />
            <LinkField label="Link" required value={card.link} onChange={(v) => setCard(i, { ...card, link: v ?? { label: '', href: '' } })} />
          </fieldset>
        ))}
      </div>
    </div>
  );
}
