import type { ChangeEvent } from 'react';

// react-hook-form shows the default value again when a field becomes
// undefined, so a cleared <input type="number"> would snap back to it.
// Empty required numbers are NaN (zod's z.number() reports "required");
// empty optional ones are null.
export const requiredNumber = (e: ChangeEvent<HTMLInputElement>) =>
  e.target.value === '' ? Number.NaN : e.target.valueAsNumber;

export const optionalNumber = (e: ChangeEvent<HTMLInputElement>) =>
  e.target.value === '' ? null : e.target.valueAsNumber;

export const inputValue = (v: number | null | undefined) =>
  v == null || Number.isNaN(v) ? '' : v;
