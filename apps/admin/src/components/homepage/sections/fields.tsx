'use client';

import { useId } from 'react';
import { ArrowDown, ArrowUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploader } from '@/components/products/image-uploader';
import type { HomeLink } from '@/types/homepage';

// Small controlled fields for the section editors. Optional text is stored as
// undefined (not '') so saved sections match the API shape exactly.

interface TextFieldProps {
  label: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  max: number;
  hint?: string;
  multiline?: boolean;
  required?: boolean;
  placeholder?: string;
}

export function TextField({ label, value, onChange, max, hint, multiline, required, placeholder }: TextFieldProps) {
  const id = useId();
  const length = value?.length ?? 0;
  const common = {
    id,
    value: value ?? '',
    maxLength: max,
    placeholder,
    'aria-describedby': hint ? `${id}-hint` : undefined,
    // Required text stays a string; optional text clears to undefined
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(required ? e.target.value : e.target.value === '' ? undefined : e.target.value),
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-destructive"> *</span>}
        </Label>
        {length > max * 0.8 && (
          <span className="text-xs tabular-nums text-muted-foreground">
            {length}/{max}
          </span>
        )}
      </div>
      {multiline ? <Textarea rows={3} {...common} /> : <Input {...common} />}
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}

interface LinkFieldProps {
  label: string;
  value: HomeLink | undefined;
  onChange: (value: HomeLink | undefined) => void;
  /** Cards always have a link; buttons elsewhere are optional */
  required?: boolean;
}

/** A button: label + link. Clearing both removes an optional button. */
export function LinkField({ label, value, onChange, required }: LinkFieldProps) {
  const id = useId();
  const set = (next: Partial<HomeLink>) => {
    const merged = { label: value?.label ?? '', href: value?.href ?? '', ...next };
    onChange(!required && !merged.label && !merged.href ? undefined : merged);
  };

  return (
    <fieldset className="space-y-1.5">
      <legend className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </legend>
      <div className="grid gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Input
          aria-label={`${label}: text`}
          id={`${id}-label`}
          placeholder="Button text"
          maxLength={40}
          value={value?.label ?? ''}
          onChange={(e) => set({ label: e.target.value })}
        />
        <Input
          aria-label={`${label}: link`}
          placeholder="/shop or https://…"
          maxLength={500}
          value={value?.href ?? ''}
          onChange={(e) => set({ href: e.target.value })}
        />
      </div>
      {!required && <p className="text-xs text-muted-foreground">Leave both empty for no button.</p>}
    </fieldset>
  );
}

interface ImageFieldProps {
  label: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  aspect?: 'square' | 'wide';
  hint?: string;
}

export function ImageField({ label, value, onChange, aspect = 'wide', hint }: ImageFieldProps) {
  return (
    <div className="space-y-1.5">
      <ImageUploader
        label={label}
        folder="hero"
        aspect={aspect}
        value={value ?? ''}
        onChange={(url) => onChange(url || undefined)}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

// ─── Lists ───

/** Immutable list helpers for the editors */
export const listOps = {
  move: <T,>(list: T[], from: number, to: number): T[] => {
    if (to < 0 || to >= list.length) return list;
    const next = [...list];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
  },
  remove: <T,>(list: T[], index: number): T[] => list.filter((_, i) => i !== index),
  replace: <T,>(list: T[], index: number, item: T): T[] => list.map((x, i) => (i === index ? item : x)),
};

interface ItemControlsProps {
  index: number;
  count: number;
  /** What the item is called in screen-reader labels, e.g. "tile 2" */
  name: string;
  onMove: (to: number) => void;
  onRemove?: () => void;
}

/** Up / down / remove buttons for one item in an editor list */
export function ItemControls({ index, count, name, onMove, onRemove }: ItemControlsProps) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => onMove(index - 1)}
        disabled={index === 0}
        aria-label={`Move ${name} up`}
      >
        <ArrowUp className="h-3.5 w-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => onMove(index + 1)}
        disabled={index === count - 1}
        aria-label={`Move ${name} down`}
      >
        <ArrowDown className="h-3.5 w-3.5" />
      </Button>
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
          aria-label={`Remove ${name}`}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
