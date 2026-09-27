import { parse } from 'csv-parse/sync';
import { BadRequestError } from './AppError';

// ─────────────────────────────────────────────────────────────
// COLUMN DEFINITIONS
// ─────────────────────────────────────────────────────────────

export const CSV_COLUMNS = [
  // Product-level
  'productName',
  'brandSlug',
  'categorySlug',
  'gender',
  'shortDescription',
  'fullDescription',
  'story',
  'referenceNumber',
  'movementType',
  'movementCaliber',
  'powerReserve',
  'jewels',
  'caseDiameter',
  'caseThickness',
  'lugWidth',
  'crystalType',
  'waterResistance',
  'indices',
  'hands',
  'warranty',
  'boxAndPapers',
  'basePrice',
  'heroImage',
  'productImages',
  'video',
  'tags',
  'status',
  'featured',
  'isLimitedEdition',
  'limitedQuantity',
  // Variant-level
  'dialColor',
  'dialFinish',
  'caseMaterial',
  'caseSize',
  'bezelType',
  'indicesType',
  'strapType',
  'strapColor',
  'claspType',
  'movement',
  'complications',
  'price',
  'compareAtPrice',
  'stock',
  'lowStockThreshold',
  'weight',
  'sku',
  'variantImages',
] as const;

export type CsvColumn = (typeof CSV_COLUMNS)[number];

export const MAX_ROWS = 5000;

// ─────────────────────────────────────────────────────────────
// PARSER
// ─────────────────────────────────────────────────────────────

export interface ParsedCsvRow {
  rowNumber: number;
  data: Record<string, string>;
}

export interface CsvParseResult {
  rows: ParsedCsvRow[];
  headers: string[];
  missingColumns: string[];
  extraColumns: string[];
}

export const parseCsvBuffer = (buffer: Buffer): CsvParseResult => {
  let records: Record<string, string>[];

  try {
    records = parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
      relax_quotes: true,
      relax_column_count: true,
    });
  } catch (error: any) {
    throw new BadRequestError(`Invalid CSV format: ${error.message}`);
  }

  if (!records || records.length === 0) {
    throw new BadRequestError('CSV file is empty or has no data rows');
  }

  if (records.length > MAX_ROWS) {
    throw new BadRequestError(
      `Too many rows: ${records.length}. Maximum allowed: ${MAX_ROWS}`
    );
  }

  const headers = Object.keys(records[0]);
  const requiredColumns = [
    'productName',
    'brandSlug',
    'categorySlug',
    'referenceNumber',
    'caseDiameter',
    'crystalType',
    'waterResistance',
    'warranty',
    'basePrice',
    'heroImage',
    'dialColor',
    'caseMaterial',
    'caseSize',
    'strapType',
    'strapColor',
    'movement',
    'price',
  ];

  const missingColumns = requiredColumns.filter(
    (col) => !headers.includes(col)
  );

  if (missingColumns.length > 0) {
    throw new BadRequestError(
      `Missing required columns: ${missingColumns.join(', ')}`
    );
  }

  const extraColumns = headers.filter(
    (h) => !CSV_COLUMNS.includes(h as CsvColumn)
  );

  const rows: ParsedCsvRow[] = records.map((record, index) => ({
    rowNumber: index + 2, // +2 because row 1 is headers, data starts at row 2
    data: record,
  }));

  return { rows, headers, missingColumns, extraColumns };
};

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

export const parseBool = (value: string | undefined, defaultValue = false): boolean => {
  if (value === undefined || value === '') return defaultValue;
  const lower = value.toLowerCase().trim();
  return ['true', '1', 'yes', 'y'].includes(lower);
};

export const parseNumber = (
  value: string | undefined,
  field: string,
  rowNumber: number,
  required = false
): number | undefined => {
  if (value === undefined || value === '') {
    if (required) {
      throw new BadRequestError(`Row ${rowNumber}: "${field}" is required`);
    }
    return undefined;
  }
  const num = Number(value);
  if (Number.isNaN(num)) {
    throw new BadRequestError(`Row ${rowNumber}: "${field}" must be a number`);
  }
  return num;
};

export const parseInt_ = (
  value: string | undefined,
  field: string,
  rowNumber: number,
  required = false
): number | undefined => {
  const num = parseNumber(value, field, rowNumber, required);
  if (num === undefined) return undefined;
  if (!Number.isInteger(num)) {
    throw new BadRequestError(`Row ${rowNumber}: "${field}" must be an integer`);
  }
  return num;
};

export const parseList = (value: string | undefined): string[] => {
  if (!value || value.trim() === '') return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
};

export const parseUrl = (
  value: string | undefined,
  field: string,
  rowNumber: number,
  required = false
): string | undefined => {
  if (!value || value.trim() === '') {
    if (required) {
      throw new BadRequestError(`Row ${rowNumber}: "${field}" is required`);
    }
    return undefined;
  }
  try {
    new URL(value);
    return value.trim();
  } catch {
    throw new BadRequestError(`Row ${rowNumber}: "${field}" must be a valid URL`);
  }
};

// ─────────────────────────────────────────────────────────────
// TEMPLATE GENERATOR
// ─────────────────────────────────────────────────────────────

export const generateCsvTemplate = (): string => {
  const header = CSV_COLUMNS.join(',');

  const exampleRow = [
    'Submariner Date',
    'rolex',
    'dive-watches',
    'men',
    'The archetypal divers watch',
    'A legendary dive watch with exceptional water resistance.',
    '',
    '126610LN',
    'Automatic',
    'Cal. 3235',
    '70',
    '31',
    '41',
    '12.4',
    '21',
    'Sapphire',
    '300',
    'Baton',
    'Mercedes',
    '5 years international',
    'true',
    '850000',
    'https://example.com/hero.jpg',
    'https://example.com/img1.jpg|https://example.com/img2.jpg',
    '',
    'dive|luxury',
    'draft',
    'false',
    'false',
    '',
    'Black',
    'Sunray',
    'Oystersteel',
    '41',
    "Diver's",
    'Baton',
    'Oyster Bracelet',
    'Steel',
    'Oysterlock',
    'automatic',
    'Date',
    '850000',
    '900000',
    '5',
    '3',
    '155',
    '',
    'https://example.com/variant.jpg',
  ].join(',');

  return `${header}\n${exampleRow}\n`;
};
