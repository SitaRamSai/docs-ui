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
  icon?: React.ElementType;
}
 
export interface QueryFilter {
  key: string;
  type: string;
  value: any; // Can be string, string[], or object
  isCustom?: boolean;
}
 
export interface SmartSuggestion {
  id: string;
  title: string;
  description: string;
  icon: string;
  filters: QueryFilter[];
}

export interface SourceSystem {
  id: string;
  name: string;
}
 
export interface FilterPanelProps {
  currentFilters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
  onSearch: () => void;
  isLoading?: boolean;
  autoApplyFilters?: boolean;
  availableSourceSystems?: SourceSystem[];
} 
