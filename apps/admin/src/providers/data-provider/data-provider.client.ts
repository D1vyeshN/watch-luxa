import type {
  DataProvider,
  GetListParams,
  GetListResponse,
} from '@refinedev/core';
import { CONFIG } from '@/constants/config';
import { apiRequest } from '@/lib/api/client';

// ─── API response shapes ───
interface ListResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface SingleResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ─── Filter operators → Express query params ───
type FilterValue = string | number | boolean | Array<string | number>;
type RefineFilter =
  | { field: string; operator: 'eq' | 'ne' | 'lt' | 'gt' | 'lte' | 'gte' | 'in' | 'nin' | 'contains' | 'ncontains' | 'between'; value: FilterValue }
  | { operator: 'or' | 'and'; value: RefineFilter[] };

function serializeFilter(filter: RefineFilter): Record<string, string> {
  const out: Record<string, string> = {};
  if (!('field' in filter)) return out;

  const { field, operator, value } = filter;
  if (value === undefined || value === null || value === '') return out;

  switch (operator) {
    case 'eq':
      out[field] = String(value);
      break;
    case 'ne':
      out[field] = `!${value}`;
      break;
    case 'in':
      if (Array.isArray(value)) out[field] = value.join(',');
      break;
    case 'gte':
      out[`min${capitalize(field)}`] = String(value);
      break;
    case 'lte':
      out[`max${capitalize(field)}`] = String(value);
      break;
    case 'contains':
      out[`search_${field}`] = String(value);
      break;
    case 'between':
      if (Array.isArray(value) && value.length === 2) {
        out[`min${capitalize(field)}`] = String(value[0]);
        out[`max${capitalize(field)}`] = String(value[1]);
      }
      break;
    default:
      out[field] = String(value);
  }

  return out;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Build query string from GetListParams ───
function buildListQuery(params: GetListParams): string {
  const { pagination, sorters, filters, meta } = params;
  const query: Record<string, string> = {};

  // Pagination
  const page = pagination?.currentPage ?? 1;
  const limit = pagination?.pageSize ?? CONFIG.defaultPageSize;
  query.page = String(page);
  query.limit = String(Math.min(limit, CONFIG.maxPageSize));

  // Sorters — Refine passes an array, Express expects one
  if (sorters && sorters.length > 0) {
    query.sortBy = sorters[0].field;
    query.sortOrder = sorters[0].order; // 'asc' | 'desc'
  }

  // Filters
  if (filters && filters.length > 0) {
    filters.forEach((f) => {
      const serialized = serializeFilter(f as RefineFilter);
      Object.assign(query, serialized);
    });
  }

  // Meta (custom params like search, status, etc.)
  if (meta && typeof meta === 'object') {
    Object.entries(meta).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query[key] = String(value);
      }
    });
  }

  const searchParams = new URLSearchParams(query);
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

// ─── Resource → endpoint mapping ───
// Most resources live under /admin/*, but a few are top-level
const RESOURCE_PATH_MAP: Record<string, string> = {
  products: '/admin/products',
  categories: '/admin/categories',
  brands: '/admin/brands',
  collections: '/admin/collections',
  inventory: '/admin/products/inventory',
  orders: '/admin/orders',
  customers: '/admin/customers',
  coupons: '/admin/coupons',
  returns: '/admin/returns',
  reviews: '/admin/reviews',
  uploads: '/admin/uploads',
  'csv-import': '/admin/csv',
  analytics: '/admin/analytics',
  settings: '/admin/settings',
  team: '/admin/users',
  'audit-logs': '/admin/audit-logs',
};

function getResourcePath(resource: string): string {
  return RESOURCE_PATH_MAP[resource] ?? `${CONFIG.adminPrefix}/${resource}`;
}

// ─── The dataProvider ───
export const dataProvider: DataProvider = {
  getApiUrl: () => CONFIG.apiUrl,

  // ─── LIST ───
  getList: async <TData>({
    resource,
    pagination,
    sorters,
    filters,
    meta,
  }: GetListParams): Promise<GetListResponse<TData>> => {
    const path = getResourcePath(resource);
    const query = buildListQuery({ pagination, sorters, filters, meta });

    const response = await apiRequest<ListResponse<TData>>(`${path}${query}`);

    return {
      data: response.data,
      total: response.pagination?.total ?? response.data.length,
    };
  },

  // ─── GET ONE ───
  getOne: async <TData>({ resource, id }) => {
    const path = getResourcePath(resource);
    const response = await apiRequest<SingleResponse<TData>>(`${path}/${id}`);
    return { data: response.data };
  },

  // ─── CREATE ───
  create: async <TData, TVariables>({ resource, variables }) => {
    const path = getResourcePath(resource);
    const response = await apiRequest<SingleResponse<TData>>(path, {
      method: 'POST',
      body: variables,
    });
    return { data: response.data };
  },

  // ─── UPDATE ───
  update: async <TData, TVariables>({ resource, id, variables }) => {
    const path = getResourcePath(resource);
    const response = await apiRequest<SingleResponse<TData>>(`${path}/${id}`, {
      method: 'PUT',
      body: variables,
    });
    return { data: response.data };
  },

  // ─── DELETE ───
  deleteOne: async <TData>({ resource, id, variables }) => {
    const path = getResourcePath(resource);
    const response = await apiRequest<SingleResponse<TData>>(`${path}/${id}`, {
      method: 'DELETE',
      body: variables,
    });
    return { data: response.data };
  },

  // ─── CUSTOM — for non-CRUD endpoints ───
  // Used for: stock adjustment, CSV import, order status updates, etc.
  custom: async <TData>({
    url,
    method = 'GET',
    payload,
    query,
    headers,
  }) => {
    const searchParams = query
      ? `?${new URLSearchParams(
          Object.entries(query).reduce<Record<string, string>>(
            (acc, [k, v]) => {
              if (v !== undefined && v !== null) acc[k] = String(v);
              return acc;
            },
            {}
          )
        ).toString()}`
      : '';

    const response = await apiRequest<SingleResponse<TData> | TData>(
      `${url}${searchParams}`,
      {
        method,
        body: payload,
        headers,
      }
    );

    // Handle both `{ success, data }` and raw responses
    const data =
      response && typeof response === 'object' && 'data' in response
        ? (response as SingleResponse<TData>).data
        : (response as TData);

    return { data };
  },
};
