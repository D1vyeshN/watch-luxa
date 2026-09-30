import type { ProductSpecs } from '@/types/catalog';

interface SpecsTableProps {
  specs: ProductSpecs;
}

const LABELS: Array<{ key: keyof ProductSpecs; label: string; suffix?: string }> = [
  { key: 'referenceNumber', label: 'Reference' },
  { key: 'movementType', label: 'Movement Type' },
  { key: 'movementCaliber', label: 'Caliber' },
  { key: 'powerReserve', label: 'Power Reserve', suffix: ' hours' },
  { key: 'jewels', label: 'Jewels' },
  { key: 'caseDiameter', label: 'Case Diameter', suffix: ' mm' },
  { key: 'caseThickness', label: 'Case Thickness', suffix: ' mm' },
  { key: 'lugWidth', label: 'Lug Width', suffix: ' mm' },
  { key: 'caseMaterial', label: 'Case Material' },
  { key: 'bezelMaterial', label: 'Bezel' },
  { key: 'crystalType', label: 'Crystal' },
  { key: 'waterResistance', label: 'Water Resistance', suffix: ' m' },
  { key: 'indices', label: 'Indices' },
  { key: 'hands', label: 'Hands' },
  { key: 'warranty', label: 'Warranty' },
];

export function SpecsTable({ specs }: SpecsTableProps) {
  const rows = LABELS.filter((row) => {
    const value = specs[row.key];
    return value !== undefined && value !== null && value !== '';
  });

  return (
    <div className="border-t border-forest-900/10">
      {rows.map((row) => {
        const value = specs[row.key];
        const displayValue =
          typeof value === 'boolean'
            ? value
              ? 'Included'
              : 'Not included'
            : `${value}${row.suffix ?? ''}`;

        return (
          <div
            key={row.key}
            className="grid grid-cols-2 gap-4 border-b border-forest-900/10 py-4"
          >
            <dt className="text-xs uppercase tracking-[0.14em] text-ink-muted">
              {row.label}
            </dt>
            <dd className="text-sm text-forest-900">{displayValue}</dd>
          </div>
        );
      })}

      {specs.boxAndPapers && (
        <div className="grid grid-cols-2 gap-4 border-b border-forest-900/10 py-4">
          <dt className="text-xs uppercase tracking-[0.14em] text-ink-muted">
            Box & Papers
          </dt>
          <dd className="text-sm text-forest-900">Included</dd>
        </div>
      )}
    </div>
  );
}
