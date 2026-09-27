import { SortOrder } from 'mongoose';

export interface PaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
}

export const getPagination = (query: PaginationQuery) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder: SortOrder = query.sortOrder === 'asc' ? 1 : -1;

  return { page, limit, skip, sortBy, sortOrder };
};

export const buildFilters = (
  query: Record<string, unknown>,
  filterFields: string[]
): Record<string, unknown> => {
  const filter: Record<string, unknown> = {};

  for (const field of filterFields) {
    if (query[field] !== undefined && query[field] !== null && query[field] !== '') {
      filter[field] = query[field];
    }
  }

  return filter;
};
