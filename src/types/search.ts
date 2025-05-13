export interface SearchQuery {
  key: string;
  type: string;
  value: string;
}

export interface SearchParams {
  query: SearchQuery[];
  count: number;
  offset: number;
  projection: string[];
}

export interface SearchPagination {
  total: number;
  pageSize: number;
  currentOffset: number;
  nextOffset: number | null;
  previousOffset: number | null;
  hasMore: boolean;
  totalPages: number;
  currentPage: number;
}

export interface SearchResult {
  id: string;
  sourceSystem: string;
  contentType: string;
  filename: string;
  createdAt: string;
  fileType?: string;
  clientId?: string;
}

export interface SearchResponse {
  pagination: SearchPagination;
  results: SearchResult[];
}

export interface AdvancedSearchFileBrowserProps {
  initialQuery: SearchParams;
  onFileSelect?: (file: SearchResult) => void;
  onPageChange?: (offset: number) => void;
  className?: string;
  itemsPerPage?: number;
  showFilters?: boolean;
  enableMultiSelect?: boolean;
  customFileTypeIcons?: Record<string, React.ReactNode>;
  dateFormat?: string;
  loadingPlaceholderCount?: number;
}

export interface Column {
  id: string;
  label: string;
  accessor: (item: SearchResult) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  minWidth?: string;
}