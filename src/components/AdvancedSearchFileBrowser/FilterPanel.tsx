import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, ChevronDown, ChevronUp, Plus, Filter, Check, Sliders, ArrowRight, Lightbulb, AlertCircle, Tag, Edit, Database, FileText, File, User, Calendar, Clock, Mail } from 'lucide-react';
import { FilterPanelProps, FilterOption, QueryType, QueryFilter, SmartSuggestion, DateRange } from '../../types/filterTypes';
import { formatKey, classNames, isFilterApplied, getAppliedFilter } from '../../utils/filterUtils';
 
// Filter option categories aligned with API's searchable fields
const filterOptions: FilterOption[] = [
  { key: 'sourceSystem', label: 'Source System', placeholder: 'e.g., genius', queryType: 'matches' as QueryType, icon: Database },
  { key: 'filename', label: 'Filename', placeholder: 'e.g., report.pdf', queryType: 'like' as QueryType, icon: FileText },
  { key: 'contentType', label: 'Content Type', placeholder: 'Select content types', queryType: 'in' as QueryType, icon: File },
  { key: 'fileType', label: 'File Type', placeholder: 'Select file types', queryType: 'in' as QueryType, icon: Tag },
  { key: 'clientId', label: 'Client ID', placeholder: 'e.g., 12345', queryType: 'matches' as QueryType, icon: User },
  { key: 'createdAt', label: 'Created Date', placeholder: 'Select date range', queryType: 'range' as QueryType, icon: Calendar }
];
 
// Map of query types to UI behaviors
const queryTypeConfig: Record<QueryType, { component: string; inputType: string; description: string }> = {
  'matches': { 
    component: 'input',
    inputType: 'text',
    description: 'Exact match' 
  },
  'like': { 
    component: 'input',
    inputType: 'text',
    description: 'Contains text' 
  },
  'in': { 
    component: 'input',
    inputType: 'text',
    description: 'Multiple values allowed' 
  },
  'range': { 
    component: 'dateRange',
    inputType: 'date',
    description: 'Date range' 
  }
};
 
// Common content types with friendly names
const commonContentTypes = [
  { value: 'application/pdf', label: 'PDF' },
  { value: 'image/jpeg', label: 'JPEG' },
  { value: 'image/png', label: 'PNG' },
  { value: 'text/plain', label: 'Text' },
  { value: 'application/msword', label: 'DOC' },
  { value: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', label: 'DOCX' },
];
 
// Common file types
const commonFileTypes = [
  { value: 'submission', label: 'Submission' },
  { value: 'letter', label: 'Letter' }
];

// Common source systems
const commonSourceSystems = [
  { value: 'genius', label: 'Genius' },
  { value: 'dragon', label: 'Dragon' },
  { value: 'ebao', label: 'eBao' },
  { value: 'ivos', label: 'IVOS' }
];
 
// Smart suggestions based on common filter combinations
const smartSuggestions: SmartSuggestion[] = [
  {
    id: 'recent-docs',
    title: 'Recent Documents',
    description: 'Created in the last week',
    icon: 'clock',
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-50',
    filters: [{
      key: 'createdAt',
      type: 'range',
      value: { 
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
      }
    }]
  },
  {
    id: 'submissions',
    title: 'Submissions',
    description: 'All submission documents',
    icon: 'file-text',
    iconColor: 'text-green-500',
    bgColor: 'bg-green-50',
    filters: [{
      key: 'fileType',
      type: 'in',
      value: ['submission']
    }]
  },
  {
    id: 'letters',
    title: 'Letters',
    description: 'All letter documents',
    icon: 'mail',
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-50',
    filters: [{
      key: 'fileType',
      type: 'in',
      value: ['letter']
    }]
  },
  {
    id: 'pdf-docs',
    title: 'PDF Documents',
    description: 'All PDF files',
    icon: 'file',
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-50',
    filters: [{
      key: 'contentType',
      type: 'in',
      value: ['application/pdf']
    }]
  }
];
 
export const FilterPanel: React.FC<FilterPanelProps> = ({
  currentFilters = {},
  onFilterChange,
  onSearch,
  isLoading = false,
  autoApplyFilters = false,
}) => {
  // State for the query being built - array of filter objects like the API requires
  const [queryFilters, setQueryFilters] = useState<QueryFilter[]>(() => {
    // Convert incoming filters to query format if any
    const initialFilters: QueryFilter[] = [];
    if (currentFilters && typeof currentFilters === 'object') {
      Object.entries(currentFilters).forEach(([key, value]) => {
        const option = filterOptions.find(opt => opt.key === key);
        if (option) {
          initialFilters.push({
            key,
            type: option.queryType,
            value
          });
        }
      });
    }
    return initialFilters;
  });
 
  // State for smart suggestions
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [suggestionsMinimized, setSuggestionsMinimized] = useState(false);
  
  // State for active filter and interaction
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [filterInput, setFilterInput] = useState('');
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({});
  
  // Ref for detecting clicks outside the active filter section
  const activeFilterRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Track user's filter usage history for better suggestions
  const [filterUsageHistory, setFilterUsageHistory] = useState<string[]>([]);
  
  // State to track which filter buttons have been clicked
  const [activeFilterButton, setActiveFilterButton] = useState<string | null>(null);
 
  // Reference for the filter container
  const filterContainerRef = useRef<HTMLDivElement | null>(null);
  
  // References for each filter button
  const filterButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  
  // Selected button position for positioning the popup
  const [selectedButtonPosition, setSelectedButtonPosition] = useState({ top: 0, left: 0, width: 0 });
 
  // Close active filter when clicking outside
  useEffect(() => {
    if (!activeFilter) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (activeFilterRef.current && !activeFilterRef.current.contains(event.target as Node)) {
        setActiveFilter(null);
        // Don't reset the activeFilterButton here to maintain the visual selection
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeFilter, filterInput, dateRange, selectedChips]);
 
  // Focus input when active filter changes
  useEffect(() => {
    if (activeFilter && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeFilter]);
 
  // Check if we have any active filters
  const hasActiveFilters = queryFilters.length > 0;
 
  // Get the filter value display format for a given filter
  const getFilterValueDisplay = (key: string, filter: any) => {
    const value = filter.value;
    if (filter.type === 'range' && value && typeof value === 'object') {
      if (value.start && value.end) {
        return `${value.start} to ${value.end}`;
      } else if (value.start) {
        return `after ${value.start}`;
      } else if (value.end) {
        return `before ${value.end}`;
      }
      return '';
    }
    
    if (filter.type === 'in' && Array.isArray(value)) {
      if (key === 'contentType') {
        return value.map(v => {
          const contentType = commonContentTypes.find(ct => ct.value === v);
          return contentType ? contentType.label : v;
        }).join(', ');
      }
      
      if (key === 'fileType') {
        return value.map(v => {
          const fileType = commonFileTypes.find(ft => ft.value === v);
          return fileType ? fileType.label : v;
        }).join(', ');
      }
      
      return value.join(', ');
    }
    
    return String(value);
  };
 
  // Toggle filter selection on/off
  const handleFilterSelect = (key: string) => {
    // Toggle the filter button state
    if (activeFilterButton === key) {
      setActiveFilterButton(null);
      setActiveFilter(null);
      setFilterInput('');
      setSelectedChips([]);
      setDateRange({});
      return;
    }

    // Get the button position for popup positioning
    const buttonEl = filterButtonRefs.current[key];
    const containerEl = filterContainerRef.current;
    
    if (buttonEl && containerEl) {
      const buttonRect = buttonEl.getBoundingClientRect();
      const containerRect = containerEl.getBoundingClientRect();
      
      // Calculate position relative to the container
      setSelectedButtonPosition({
        top: buttonRect.bottom - containerRect.top,
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width
      });
    }

    setActiveFilterButton(key);
    
    const option = filterOptions.find(opt => opt.key === key);
    if (!option) return;
    
    setActiveFilter(key);
    setFilterInput('');
    setSelectedChips([]);
    setDateRange({});
    
    // Initialize selection for existing filter
    const existingFilter = queryFilters.find(f => f.key === key);
    if (existingFilter) {
      if (existingFilter.type === 'in' && Array.isArray(existingFilter.value)) {
        setSelectedChips([...existingFilter.value]);
      } else if (existingFilter.type !== 'range') {
        setFilterInput(String(existingFilter.value));
      } else if (existingFilter.type === 'range' && typeof existingFilter.value === 'object') {
        setDateRange({ ...existingFilter.value });
      }
    }
    
    // Track usage for smart suggestions
    setFilterUsageHistory(prev => [key, ...prev.filter(k => k !== key).slice(0, 9)]);
  };

  // Auto-apply sourceSystem when selected
  const handleSourceSystemSelect = (value: string) => {
    // First update the state
    setFilterInput(value);
    
    // If autoApplyFilters is enabled, use the value directly
    if (autoApplyFilters && activeFilter) {
      const option = filterOptions.find(opt => opt.key === activeFilter);
      if (!option) return;
      
      // Apply filter with this value
      applyFilterWithValue(activeFilter, option.queryType, value);
    }
  };

  // Helper function to directly apply a filter with a value
  const applyFilterWithValue = (key: string, type: QueryType, newValue: any) => {
    // Check if this filter already exists
    const existingIndex = queryFilters.findIndex(f => f.key === key);
    
    let newFilters = [...queryFilters];
    if (existingIndex >= 0) {
      // Update existing filter
      newFilters[existingIndex] = {
        key,
        type,
        value: newValue
      };
    } else {
      // Add new filter
      newFilters.push({
        key,
        type,
        value: newValue
      });
    }
    
    setQueryFilters(newFilters);
    
    // Convert the filter array to the format expected by the parent component
    const filterObject = newFilters.reduce((acc, filter) => {
      acc[filter.key] = filter.value;
      return acc;
    }, {} as Record<string, any>);
    
    onFilterChange(filterObject);
    
    // Reset state
    setActiveFilter(null);
    setActiveFilterButton(null);
    setFilterInput('');
    setDateRange({});
    setSelectedChips([]);
    
    // If autoApplyFilters is enabled, trigger a search
    if (autoApplyFilters) {
      onSearch();
    }
  };

  // Handle toggle of a chip selection
  const handleChipToggle = (value: string) => {
    if (autoApplyFilters && activeFilter) {
      // For auto-apply, we need to handle chips differently
      const option = filterOptions.find(opt => opt.key === activeFilter);
      if (!option) return;
      
      // Create a new array with the toggled value
      const newChips = selectedChips.includes(value)
        ? selectedChips.filter(v => v !== value)
        : [...selectedChips, value];

      if (activeFilter === 'contentType' || activeFilter === 'fileType') {
        if (newChips.length > 0) {
          // Apply with the new chips array
          setSelectedChips(newChips);
          applyFilterWithValue(activeFilter, option.queryType, newChips);
        }
      }
    } else {
      // Regular behavior without auto-apply
      setSelectedChips(prev => {
        if (prev.includes(value)) {
          return prev.filter(v => v !== value);
        } else {
          return [...prev, value];
        }
      });
    }
  };

  // Handle date range change
  const handleDateRangeChange = (part: 'start' | 'end', value: string) => {
    const newDateRange = { ...dateRange, [part]: value };
    setDateRange(newDateRange);
    
    if (autoApplyFilters && activeFilter) {
      const option = filterOptions.find(opt => opt.key === activeFilter);
      if (!option) return;
      
      // Only apply if at least one date is set
      if (newDateRange.start || newDateRange.end) {
        // Add small delay to allow state to update
        setTimeout(() => {
          applyFilterWithValue(activeFilter, option.queryType, newDateRange);
        }, 100);
      }
    }
  };

  // Process the current filter input and add to filters
  const handleFilterConfirm = () => {
    if (!activeFilter) return;
    
    const option = filterOptions.find(opt => opt.key === activeFilter);
    if (!option) return;
    
    let newValue: any;
    
    // Process value based on query type
    if (option.queryType === 'range') {
      // Only add if at least one date is set
      if (!dateRange.start && !dateRange.end) {
        setActiveFilter(null);
        setActiveFilterButton(null);
        return;
      }
      newValue = { ...dateRange };
    } else if (option.queryType === 'in') {
      // For content type and file type, use selected chips
      if (activeFilter === 'contentType' || activeFilter === 'fileType') {
        if (selectedChips.length === 0) {
          setActiveFilter(null);
          setActiveFilterButton(null);
          return;
        }
        newValue = [...selectedChips];
      } else if (filterInput) {
        // Convert comma-separated string to array
        newValue = filterInput.split(',').map(item => item.trim()).filter(Boolean);
      } else {
        // No value, don't add filter
        setActiveFilter(null);
        setActiveFilterButton(null);
        return;
      }
    } else if (filterInput) {
      newValue = filterInput;
    } else {
      // No value, don't add filter
      setActiveFilter(null);
      setActiveFilterButton(null);
      return;
    }
    
    applyFilterWithValue(activeFilter, option.queryType, newValue);
  };

  // Handle key press in filter input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFilterConfirm();
    } else if (e.key === 'Escape') {
      setActiveFilter(null);
      setActiveFilterButton(null);
      setFilterInput('');
      setDateRange({});
      setSelectedChips([]);
    }
  };

  // Handle text input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterInput(e.target.value);
    
    if (autoApplyFilters && activeFilter && e.target.value && 
        !['in', 'range'].includes(filterOptions.find(opt => opt.key === activeFilter)?.queryType || '')) {
      // Debounce the input for text fields
      clearTimeout(inputDebounceRef.current);
      inputDebounceRef.current = setTimeout(() => {
        handleFilterConfirm();
      }, 500);
    }
  };

  // Ref for debouncing text input
  const inputDebounceRef = useRef<any>(null);
 
  // Apply a smart suggestion
  const applySmartSuggestion = (suggestion: typeof smartSuggestions[0]) => {
    // Get existing filters without conflicting ones
    let newFilters = queryFilters.filter(filter => {
      // Check if this filter conflicts with any in the suggestion
      return !suggestion.filters.some((sugFilter: QueryFilter) => sugFilter.key === filter.key);
    });
    
    // Add the suggestion filters
    newFilters = [...newFilters, ...suggestion.filters];
    
    setQueryFilters(newFilters);
    
    // Convert for parent component
    const filterObject = newFilters.reduce((acc, filter) => {
      acc[filter.key] = filter.value;
      return acc;
    }, {} as Record<string, any>);
    
    onFilterChange(filterObject);
    
    // Track that we used this suggestion for future smart suggestions
    setFilterUsageHistory(prev => [suggestion.id, ...prev.filter(id => id !== suggestion.id).slice(0, 9)]);
  };
 
  // Remove a filter from the query
  const removeFilter = (index: number) => {
    const newFilters = [...queryFilters];
    newFilters.splice(index, 1);
    
    setQueryFilters(newFilters);
    
    // Convert for parent component
    const filterObject = newFilters.reduce((acc, filter) => {
      acc[filter.key] = filter.value;
      return acc;
    }, {} as Record<string, any>);
    
    onFilterChange(filterObject);
  };
 
  // Clear all filters
  const clearFilters = () => {
    setQueryFilters([]);
    setActiveFilter(null);
    onFilterChange({});
  };
 
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };
 
  // Helper to format keys for display
  const formatKey = (key: string): string => {
    const option = filterOptions.find(opt => opt.key === key);
    return option ? option.label : key.charAt(0).toUpperCase() + key.slice(1);
  };
 
  // Helper for conditional classes
  const classNames = (...classes: (string | boolean)[]) => {
    return classes.filter(Boolean).join(' ');
  };
 
  // Get smart suggestions that don't conflict with current filters
  const getRelevantSuggestions = () => {
    return smartSuggestions.filter(suggestion => {
      // Don't show suggestions that would conflict with current filters
      return !suggestion.filters.some((sugFilter: QueryFilter) => {
        return queryFilters.some(filter => filter.key === sugFilter.key);
      });
    }).slice(0, 3); // Limit to 3 suggestions
  };
  
  const relevantSuggestions = getRelevantSuggestions();
 
  // Toggle suggestions visibility directly with the header
  const toggleSuggestions = () => {
    if (suggestionsMinimized) {
      setSuggestionsMinimized(false);
    } else {
      setSuggestionsMinimized(!suggestionsMinimized);
    }
  };
 
  // Check if a specific filter is applied
  const isFilterApplied = (key: string) => {
    return queryFilters.some(f => f.key === key);
  };
 
  // Get the applied filter for a key
  const getAppliedFilter = (key: string) => {
    return queryFilters.find(f => f.key === key);
  };
 
  return (
    <div className="relative">
      {/* Fixed Filter Header */}
      <div className="border-b border-gray-200 p-3 flex items-center justify-between bg-gray-50">
        <div className="flex items-center">
          <div className="p-1.5 rounded-md bg-blue-50 text-blue-600 mr-3">
            <Filter size={16} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">Document Filters</h3>
            <p className="text-xs text-gray-500">
              {queryFilters.length === 0
                ? "Select filters below to refine results"
                : `${queryFilters.length} filter${queryFilters.length !== 1 ? 's' : ''} applied`}
            </p>
          </div>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs text-gray-500 hover:text-red-600 transition-colors duration-150 flex items-center"
          >
            <X size={12} className="mr-1" />
            Clear all
          </button>
        )}
      </div>

      <div className="pt-3 pb-3 px-3 bg-white" ref={filterContainerRef}>
        <form onSubmit={handleSearch} className="space-y-4">
          {/* All filter options shown upfront */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-xs font-medium text-gray-700">Filter By:</h4>
            </div>
 
            {/* Grid of filter buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-3">
              {filterOptions.map(option => {
                const isApplied = isFilterApplied(option.key);
                const isActive = activeFilterButton === option.key;
                const appliedFilter = getAppliedFilter(option.key);
                const displayValue = appliedFilter ? getFilterValueDisplay(appliedFilter.key, appliedFilter) : null;
                const IconComponent = option.icon || Filter;
                
                // Color mappings for different filter types
                const getFilterColorClasses = (key: string) => {
                  switch(key) {
                    case 'sourceSystem':
                      return { bg: 'bg-purple-50', text: 'text-purple-700', icon: 'text-purple-500', border: 'border-purple-200', hover: 'hover:bg-purple-100' };
                    case 'filename':
                      return { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-500', border: 'border-blue-200', hover: 'hover:bg-blue-100' };
                    case 'contentType':
                      return { bg: 'bg-green-50', text: 'text-green-700', icon: 'text-green-500', border: 'border-green-200', hover: 'hover:bg-green-100' };
                    case 'fileType':
                      return { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'text-amber-500', border: 'border-amber-200', hover: 'hover:bg-amber-100' };
                    case 'clientId':
                      return { bg: 'bg-cyan-50', text: 'text-cyan-700', icon: 'text-cyan-500', border: 'border-cyan-200', hover: 'hover:bg-cyan-100' };
                    case 'createdAt':
                      return { bg: 'bg-red-50', text: 'text-red-700', icon: 'text-red-500', border: 'border-red-200', hover: 'hover:bg-red-100' };
                    default:
                      return { bg: 'bg-gray-50', text: 'text-gray-700', icon: 'text-gray-500', border: 'border-gray-200', hover: 'hover:bg-gray-100' };
                  }
                };

                const colors = getFilterColorClasses(option.key);
                
                // If this filter is applied, show it as a chip
                if (isApplied && !isActive) {
                  return (
                    <div
                      key={option.key}
                      className={`px-3 py-2 rounded-md text-sm border ${colors.border} ${colors.bg} ${colors.text} ${colors.hover} flex items-center justify-between group cursor-pointer transition-colors shadow-sm`}
                      onClick={() => handleFilterSelect(option.key)}
                    >
                      <div className="flex-1 min-w-0 flex items-center">
                        <IconComponent size={14} className={`${colors.icon} mr-2 flex-shrink-0`} />
                        <div>
                          <div className="font-medium text-xs">{option.label}</div>
                          <div className="text-xs flex items-center">
                            <span className="font-medium">=</span>
                            <span className="ml-1 truncate" title={displayValue || ''}>
                              {displayValue}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the parent's onClick
                          const index = queryFilters.findIndex(f => f.key === option.key);
                          if (index >= 0) removeFilter(index);
                        }}
                        className="text-gray-400 hover:text-red-500 p-1 rounded-full ml-2"
                        title="Remove filter"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  );
                }
                
                // Otherwise show as a button that can be clicked to add a filter
                return (
                  <button
                    key={option.key}
                    type="button"
                    ref={el => filterButtonRefs.current[option.key] = el}
                    onClick={() => handleFilterSelect(option.key)}
                    className={classNames(
                      "px-3 py-2 rounded-md text-sm border transition-colors duration-150 text-left flex items-center shadow-sm hover:shadow",
                      isActive
                        ? `${colors.border} ${colors.bg} ${colors.text}`
                        : `border-gray-200 bg-white hover:${colors.bg} hover:${colors.text} hover:border-gray-300`
                    )}
                  >
                    <IconComponent size={14} className={isActive ? colors.icon : "text-gray-400 mr-2"} />
                    <span className="ml-2">{option.label}</span>
                    {isActive && <X size={14} className="ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>
 
          {/* Floating filter edit UI */}
          {activeFilter && (
            <div 
              ref={activeFilterRef}
              className="absolute bg-white p-4 rounded-lg border border-gray-200 shadow-lg transition-all duration-200 z-10"
              style={{
                top: `${selectedButtonPosition.top}px`,
                left: `${selectedButtonPosition.left}px`,
                width: `${Math.max(300, selectedButtonPosition.width * 1.5)}px`,
                maxWidth: 'calc(100% - 32px)'
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-800">
                    {formatKey(activeFilter)} Filter
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {
                      (() => {
                        const option = filterOptions.find(opt => opt.key === activeFilter);
                        if (!option) return '';
                        return queryTypeConfig[option.queryType].description;
                      })()
                    }
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter(null);
                    setActiveFilterButton(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-0.5 rounded hover:bg-gray-100 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
 
              {/* Dynamic filter input based on query type */}
              {activeFilter && (() => {
                const option = filterOptions.find(opt => opt.key === activeFilter);
                if (!option) return null;
                
                const queryType = option.queryType;
                const config = queryTypeConfig[queryType];
                
                if (queryType === 'range') {
                  return (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">After</label>
                        <input
                          id={`${activeFilter}-start`}
                          type="date"
                          value={dateRange.start || ''}
                          onChange={(e) => {
                            handleDateRangeChange('start', e.target.value);
                            if (autoApplyFilters && e.target.value) {
                              // Add small delay to allow state to update
                              setTimeout(handleFilterConfirm, 300);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white transition text-sm"
                          ref={inputRef}
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Before</label>
                        <input
                          id={`${activeFilter}-end`}
                          type="date"
                          value={dateRange.end || ''}
                          onChange={(e) => {
                            handleDateRangeChange('end', e.target.value);
                            if (autoApplyFilters && e.target.value) {
                              // Add small delay to allow state to update
                              setTimeout(handleFilterConfirm, 300);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white transition text-sm"
                        />
                      </div>
                    </div>
                  );
                }
                
                if (queryType === 'in' && (activeFilter === 'contentType' || activeFilter === 'fileType')) {
                  const options = activeFilter === 'contentType' ? commonContentTypes : commonFileTypes;
                  
                  return (
                    <div>
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-2">Select options:</p>
                        <div className="flex flex-wrap gap-2">
                          {options.map(option => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => handleChipToggle(option.value)}
                              className={`
                                px-2 py-1.5 rounded-full text-xs font-medium border 
                                ${selectedChips.includes(option.value) 
                                  ? 'bg-blue-100 text-blue-800 border-blue-300' 
                                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}
                                transition-colors flex items-center
                              `}
                            >
                              {option.label}
                              {selectedChips.includes(option.value) && (
                                <Check size={12} className="ml-1 text-blue-600" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Tag size={12} className="mr-1" />
                        <span>{selectedChips.length} selected</span>
                      </div>
                    </div>
                  );
                }
                
                // Special case for sourceSystem to show common options
                if (activeFilter === 'sourceSystem') {
                  return (
                    <div>
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-2">Select a source system:</p>
                        <div className="flex flex-wrap gap-2">
                          {commonSourceSystems.map(option => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => handleSourceSystemSelect(option.value)}
                              className={`
                                px-2 py-1.5 rounded-full text-xs font-medium border 
                                ${filterInput === option.value 
                                  ? 'bg-blue-100 text-blue-800 border-blue-300' 
                                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}
                                transition-colors flex items-center
                              `}
                            >
                              {option.label}
                              {filterInput === option.value && (
                                <Check size={12} className="ml-1 text-blue-600" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <input
                          type="text"
                          value={filterInput}
                          onChange={handleInputChange}
                          placeholder={option.placeholder}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white transition"
                          ref={inputRef}
                          onKeyDown={handleKeyPress}
                          autoFocus
                        />
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div>
                    <input
                      type={config.inputType}
                      value={filterInput}
                      onChange={handleInputChange}
                      placeholder={option.placeholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white transition"
                      ref={inputRef}
                      onKeyDown={handleKeyPress}
                      autoFocus
                    />
                    {autoApplyFilters && filterInput && (
                      <div className="mt-2 text-xs text-gray-500 flex items-center">
                        <span>Press Enter to apply filter</span>
                      </div>
                    )}
                  </div>
                );
              })()}
              
              {/* Action buttons - show only if not auto applying */}
              {!autoApplyFilters && (
                <div className="flex justify-end mt-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveFilter(null);
                      setActiveFilterButton(null);
                    }}
                    className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-300 rounded-md text-xs font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleFilterConfirm}
                    className="px-3 py-1 bg-blue-600 text-white border border-blue-600 rounded-md text-xs font-medium hover:bg-blue-700 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Smart Suggestions */}
          {showSuggestions && relevantSuggestions.length > 0 && (
            <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={toggleSuggestions}
                className="w-full px-3 py-2 border-b border-gray-200 bg-gray-50 flex items-center justify-between text-left"
              >
                <h4 className="text-xs font-medium text-gray-700 flex items-center">
                  <Lightbulb size={12} className="mr-1.5 text-amber-500" />
                  Quick Filter Suggestions
                </h4>
                <div className="text-gray-400">
                  {suggestionsMinimized ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </div>
              </button>
              
              {!suggestionsMinimized && (
                <div className="p-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {relevantSuggestions.map((suggestion) => {
                      // Map icon string to component
                      let IconComponent;
                      switch(suggestion.icon) {
                        case 'clock': IconComponent = Clock; break;
                        case 'file-text': IconComponent = FileText; break;
                        case 'mail': IconComponent = Mail; break;
                        case 'file': IconComponent = File; break;
                        default: IconComponent = Lightbulb;
                      }
                      
                      return (
                        <button
                          key={suggestion.id}
                          type="button"
                          onClick={() => applySmartSuggestion(suggestion)}
                          className={`flex items-center p-2 rounded-md border border-gray-100 hover:bg-blue-50 hover:border-blue-100 transition-colors text-left group`}
                        >
                          <div className={`${suggestion.bgColor || 'bg-gray-100'} p-2 rounded-full mr-3`}>
                            <IconComponent className={`w-4 h-4 ${suggestion.iconColor || 'text-gray-500'}`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800 group-hover:text-blue-700">
                              {suggestion.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {suggestion.description}
                            </p>
                          </div>
                          <ArrowRight size={14} className="text-gray-400 group-hover:text-blue-500 ml-2" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Search button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors duration-150 shadow-sm"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-0.5 mr-1.5 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-1.5" />
                  <span>Apply Filters & Search</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

