export interface CsvPreviewProduct {
  referenceNumber: string;
  name: string;
  brand: string;
  category: string;
  variantCount: number;
  priceRange: { min: number; max: number };
}

export interface CsvValidationError {
  /** CSV line number (header is row 1). 0 when the error isn't tied to a row. */
  row: number;
  field: string;
  message: string;
}

export interface CsvPreview {
  totalRows: number;
  totalProducts: number;
  totalVariants: number;
  products: CsvPreviewProduct[];
  errors: CsvValidationError[];
  warnings: string[];
}

export interface CsvImportResult extends CsvPreview {
  imported: number;
  importedVariants: number;
}
