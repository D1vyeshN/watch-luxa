'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FAQ_MAX_QUESTIONS, FAQ_QUESTION_OPTIONS, type FaqSection } from '@/types/homepage';
import { ItemControls, TextField, listOps } from './fields';

const KNOWN = new Set(FAQ_QUESTION_OPTIONS.flatMap((g) => g.questions));

export function FaqEditor({
  section,
  onChange,
}: {
  section: FaqSection;
  onChange: (section: FaqSection) => void;
}) {
  const picked = section.questions;
  const setPicked = (questions: string[]) => onChange({ ...section, questions });
  const full = picked.length >= FAQ_MAX_QUESTIONS;

  return (
    <div className="space-y-5">
      <TextField label="Title" required max={120} value={section.title} onChange={(v) => onChange({ ...section, title: v ?? '' })} />
      <TextField label="Description" max={200} value={section.description} onChange={(v) => onChange({ ...section, description: v })} />

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-2">
          <Label>
            Shown on the homepage ({picked.length}/{FAQ_MAX_QUESTIONS})
          </Label>
          {picked.length === 0 && (
            <p className="text-sm text-muted-foreground">Tick questions on the right to add them.</p>
          )}
          <ol className="space-y-1.5">
            {picked.map((q, i) => (
              <li key={q} className="flex items-center gap-2 rounded-md border border-border py-1 pl-3 pr-1 text-sm">
                <span className="min-w-0 flex-1">
                  {i + 1}. {q}
                  {!KNOWN.has(q) && (
                    <span className="block text-xs text-destructive">
                      No longer on the FAQ page — it won’t be shown
                    </span>
                  )}
                </span>
                <ItemControls
                  index={i}
                  count={picked.length}
                  name={`question ${i + 1}`}
                  onMove={(to) => setPicked(listOps.move(picked, i, to))}
                  onRemove={() => setPicked(listOps.remove(picked, i))}
                />
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-3">
          <Label>FAQ page questions</Label>
          {FAQ_QUESTION_OPTIONS.map((group) => (
            <fieldset key={group.group} className="space-y-1.5">
              <legend className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{group.group}</legend>
              {group.questions.map((q) => {
                const checked = picked.includes(q);
                return (
                  <label key={q} className="flex cursor-pointer items-start gap-2 text-sm">
                    <Checkbox
                      className="mt-0.5"
                      checked={checked}
                      disabled={!checked && full}
                      onCheckedChange={(c) => setPicked(c === true ? [...picked, q] : picked.filter((x) => x !== q))}
                    />
                    {q}
                  </label>
                );
              })}
            </fieldset>
          ))}
        </div>
      </div>
    </div>
  );
}
