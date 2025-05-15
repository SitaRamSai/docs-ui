import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, ChevronDown, ChevronUp, Plus, Filter, Check, Sliders, ArrowRight, Lightbulb, AlertCircle, Tag, Edit, Database, FileText, File, User, Calendar, Clock, Mail } from 'lucide-react';
import { FilterPanelProps, FilterOption, QueryType, QueryFilter, DateRange } from '../../types/filterTypes';
import { formatKey, classNames, isFilterApplied, getAppliedFilter } from '../../utils/filterUtils';
 
// Filter option categories aligned with API's searchable fields
const filterOptions: FilterOption[] = [
  { key: 'sourceSystem', label: 'Source System', placeholder: 'e.g., genius', queryType: 'matches' as QueryType, icon: Database },
  { key: 'filename', label: 'Filename', placeholder: 'e.g., report.pdf', queryType: 'like' as QueryType, icon: FileText },
  { key: 'contentType', label: 'Content Type', placeholder: 'Select content types', queryType: 'in' as QueryType, icon: File },
  { key: 'fileType', label: 'File Type', placeholder: 'Select file types', queryType: 'in' as QueryType, icon: Tag },
  { key: 'clientId', label: 'Client ID', placeholder: 'e.g., CS00', queryType: 'like' as QueryType, icon: FileText },
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
  { value: 'letter', label: 'Letter' },
  { value: 'claim', label: 'Claim' },
  { value: 'notice_and_acknowledgement', label: 'Notice & Acknowledgement' },
  { value: 'adjuster_emails', label: 'Adjuster Emails' },
];

// Common source systems
const commonSourceSystems = [
  { value: 'genius', label: 'Genius' },
  { value: 'dragon', label: 'Dragon' },
  { value: 'ebao', label: 'eBao' },
  { value: 'ivos', label: 'IVOS' }
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
  const [selectedButtonPosition, setSelectedButtonPosition] = useState({ 
    top: 0, 
    left: 0, 
    width: 0,
    positionAbove: false 
  });
 
  // Close active filter when clicking outside
  useEffect(() => {
    if (!activeFilter) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (activeFilterRef.current && !activeFilterRef.current.contains(event.target as Node)) {
        setActiveFilter(null);
        setActiveFilterButton(null);
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
      if (value.from && value.to) {
        return `${value.from} to ${value.to}`;
      } else if (value.from) {
        return `from ${value.from}`;
      } else if (value.to) {
        return `to ${value.to}`;
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

    // Get the button position immediately before updating state
    const buttonEl = filterButtonRefs.current[key];
    const containerEl = filterContainerRef.current;
    
    if (buttonEl && containerEl) {
      const buttonRect = buttonEl.getBoundingClientRect();
      const containerRect = containerEl.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate available space below the button
      const spaceBelow = windowHeight - buttonRect.bottom;
      // Estimate popover height (can be refined based on content)
      const estimatedPopoverHeight = 350; 
      
      // Determine if popover should appear above or below
      const shouldPositionAbove = spaceBelow < estimatedPopoverHeight;
      
      // Calculate position relative to the container
      setSelectedButtonPosition({
        top: shouldPositionAbove 
          ? buttonRect.top - containerRect.top - 5 // Position above with offset
          : buttonRect.bottom - containerRect.top + 5, // Position below with offset
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
        positionAbove: shouldPositionAbove
      });
    }

    // Update state after position calculation
    setActiveFilterButton(key);
    setActiveFilter(key);
    
    const option = filterOptions.find(opt => opt.key === key);
    if (!option) return;
    
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
    // Only update the input state, don't apply yet
    setFilterInput(value);
  };

  // Handle toggle of a chip selection
  const handleChipToggle = (value: string) => {
    // Regular behavior without auto-apply - just update the UI state
    setSelectedChips(prev => {
      if (prev.includes(value)) {
        return prev.filter(v => v !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  // Handle date range change
  const handleDateRangeChange = (part: 'from' | 'to', value: string) => {
    // Just update the date range state, don't apply yet
    const newDateRange = { ...dateRange, [part]: value };
    setDateRange(newDateRange);
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
      if (!dateRange.from && !dateRange.to) {
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

  // Handle text input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Simply update the input value state, don't process or apply
    setFilterInput(e.target.value);
  };

  // Handle key press in filter input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setActiveFilter(null);
      setActiveFilterButton(null);
      setFilterInput('');
      setDateRange({});
      setSelectedChips([]);
    }
  };

  // Ref for debouncing text input
  const inputDebounceRef = useRef<any>(null);
 
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
 
  // Check if a specific filter is applied
  const isFilterApplied = (key: string) => {
    return queryFilters.some(f => f.key === key);
  };
 
  // Get the applied filter for a key
  const getAppliedFilter = (key: string) => {
    return queryFilters.find(f => f.key === key);
  };
 
  // Helper function to directly apply a filter with a value
  const applyFilterWithValue = (key: string, type: QueryType, newValue: any) => {
    // Check if this filter already exists
    const existingIndex = queryFilters.findIndex(f => f.key === key);    let newFilters = [...queryFilters];
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
    
    // IMPORTANT: Remove the auto-search after applying filters
    // Only execute search when explicitly requested
    // if (autoApplyFilters) {
    //   onSearch();
    // }
  };
 
  // Handle the filter popup portal creation and positioning
  useEffect(() => {
    if (!activeFilter) return;
    
    // Get updated position of the button
    const buttonEl = filterButtonRefs.current[activeFilter];
    const containerEl = filterContainerRef.current;
    
    if (buttonEl && containerEl) {
      // Recalculate position to ensure it's correct
      const buttonRect = buttonEl.getBoundingClientRect();
      const containerRect = containerEl.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate available space below the button
      const spaceBelow = windowHeight - buttonRect.bottom;
      const estimatedPopoverHeight = 350;
      
      // Determine if popover should appear above or below
      const shouldPositionAbove = spaceBelow < estimatedPopoverHeight;
      
      // Calculate position for fixed positioning relative to viewport
      setSelectedButtonPosition({
        top: shouldPositionAbove 
          ? buttonRect.top - 5 // Position above with offset
          : buttonRect.bottom + 5, // Position below with offset
        left: buttonRect.left,
        width: buttonRect.width,
        positionAbove: shouldPositionAbove
      });
    }
  }, [activeFilter]);
 
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 mb-3">
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
                            <span className="ml-1 truncate max-w-[120px]" title={displayValue || ''}>
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
 
          {/* Add backdrop overlay when filter is active */}
          {activeFilter && (
            <div 
              className="fixed inset-0 bg-black/20 z-30"
              onClick={() => {
                setActiveFilter(null);
                setActiveFilterButton(null);
              }}
            ></div>
          )}

          {/* Floating filter edit UI */}
          {activeFilter && (
            <div 
              key={`filter-popover-${activeFilter}`}
              ref={activeFilterRef}
              className="fixed bg-white p-4 rounded-lg border border-gray-200 shadow-lg z-40 max-h-[80vh] overflow-y-auto"
              style={{
                ...(selectedButtonPosition.positionAbove 
                  ? { top: 'auto', bottom: `${window.innerHeight - selectedButtonPosition.top}px` } 
                  : { top: `${selectedButtonPosition.top}px`, bottom: 'auto' }),
                left: `${selectedButtonPosition.left}px`,
                width: `${Math.max(300, selectedButtonPosition.width * 1.5)}px`,
                maxWidth: 'calc(100vw - 32px)'
              }}
              onClick={(e) => e.stopPropagation()}
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
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">From</label>
                          <input
                            id={`${activeFilter}-from`}
                            type="date"
                            value={dateRange.from || ''}
                            onChange={(e) => {
                              handleDateRangeChange('from', e.target.value);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white transition text-sm"
                            ref={inputRef}
                            autoFocus
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">To</label>
                          <input
                            id={`${activeFilter}-to`}
                            type="date"
                            value={dateRange.to || ''}
                            onChange={(e) => {
                              handleDateRangeChange('to', e.target.value);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white transition text-sm"
                          />
                        </div>
                      </div>
                      {/* Apply button */}
                      <div className="flex justify-end mt-4">
                        <button
                          type="button"
                          onClick={handleFilterConfirm}
                          className="px-3 py-1.5 bg-blue-600 text-white border border-blue-600 rounded-md text-xs font-medium hover:bg-blue-700 transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    </>
                  );
                }
                
                if (queryType === 'in' && (activeFilter === 'contentType' || activeFilter === 'fileType')) {
                  const options = activeFilter === 'contentType' ? commonContentTypes : commonFileTypes;
                  
                  return (
                    <>
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
                      <div className="text-xs text-gray-500 flex items-center mb-3">
                        <Tag size={12} className="mr-1" />
                        <span>{selectedChips.length} selected</span>
                      </div>
                      {/* Apply button */}
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleFilterConfirm}
                          className="px-3 py-1.5 bg-blue-600 text-white border border-blue-600 rounded-md text-xs font-medium hover:bg-blue-700 transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    </>
                  );
                }
                
                // Special case for sourceSystem to show common options
                if (activeFilter === 'sourceSystem') {
                  return (
                    <>
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
                      {/* Apply button */}
                      <div className="flex justify-end mt-4">
                        <button
                          type="button"
                          onClick={handleFilterConfirm}
                          className="px-3 py-1.5 bg-blue-600 text-white border border-blue-600 rounded-md text-xs font-medium hover:bg-blue-700 transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    </>
                  );
                }
                
                return (
                  <>
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
                    </div>
                    {/* Apply button */}
                    <div className="flex justify-end mt-4">
                      <button
                        type="button"
                        onClick={handleFilterConfirm}
                        className="px-3 py-1.5 bg-blue-600 text-white border border-blue-600 rounded-md text-xs font-medium hover:bg-blue-700 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </>
                );
              })()}
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

