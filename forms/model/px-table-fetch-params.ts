export interface PxTableFetchParams {
    // Index of the first record (0-based)
    first: number;
    // Number of rows per page
    rows: number;
    // Computed page index (first / rows)
    pageIndex: number;
    // Optional sort field id
    sortField?: string;
    // 1 for asc, -1 for desc
    sortOrder?: 1 | -1 | 0;
    // Global filter value if any
    globalFilter?: string;
    // Column filters in PrimeNG format or simplified key -> value(s)
    columnFilters?: Record<string, any>;
}
