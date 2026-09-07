import type { PaginationState } from '@/components/data-table/types';

export const DEFAULT_PAGE_SIZES = [5, 10, 20, 50];

export const DEFAULT_PAGINATION: PaginationState = { pageIndex: 0, pageSize: 10 };

/** Below this width a sticky column costs more room than it earns. */
export const PIN_BREAKPOINT = '(min-width: 640px)';

export const EXPANDER_COLUMN_KEY = '__expander__';
export const EXPANDER_WIDTH = 52;
export const FALLBACK_PINNED_WIDTH = 200;
