export type QueryType = 'matches' | 'like' | 'in' | 'range';

export interface DateRange {
  from?: string;
  to?: string;
}

export interface FilterOption {
  key: string;
  label: string;
  placeholder: string;
  queryType: QueryType;
}

export interface QueryFilter {
  key: string;
  type: string;
  value: any;
}

export interface SmartSuggestion {
  id: string;
  title: string;
  description: string;
  icon: string;
  filters: QueryFilter[];
}

export interface FilterPanelProps {
  currentFilters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
  onSearch: () => void;
  isLoading?: boolean;
} 