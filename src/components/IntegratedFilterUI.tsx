import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, ChevronDown, ChevronUp, Plus, Filter, Check, Sliders, ArrowRight, Lightbulb, AlertCircle, Tag, Edit, Database, FileText, File, User, Calendar, Clock, Mail } from 'lucide-react';
import { FilterOption, QueryType, QueryFilter, DateRange } from '../types/filterTypes';
import { formatKey, classNames, isFilterApplied as checkIsFilterApplied, getAppliedFilter as findAppliedFilter } from '../utils/filterUtils';

/**
 * @interface IntegratedFilterUIProps
 * @description Props for the IntegratedFilterUI component.
 * @property {Record<string, any>} [currentFilters] - Optional. The currently applied filters from the parent component.
 * @property {(filters: Record<string, any>) => void} onFilterChange - Callback function triggered when filters are changed.
 * @property {() => void} onSearch - Callback function triggered when the search action is initiated.
 * @property {boolean} [isLoading] - Optional. Indicates if a search operation is currently in progress.
 */
export interface IntegratedFilterUIProps {
  currentFilters?: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
  onSearch: () => void;
  isLoading?: boolean;
}

// --- Configuration Constants ---

/**
 * @const filterOptions
 * @description Defines the available filterable fields, their labels, placeholders, query types, and icons.
 * This configuration drives the generation of filter buttons and the behavior of the filter input popover.
 */
const filterOptions: FilterOption[] = [
  { key: 'sourceSystem', label: 'Source System', placeholder: 'e.g., genius', queryType: 'matches' as QueryType, icon: Database },
  { key: 'filename', label: 'Filename', placeholder: 'e.g., report.pdf', queryType: 'like' as QueryType, icon: FileText },
  { key: 'contentType', label: 'Content Type', placeholder: 'Select content types', queryType: 'in' as QueryType, icon: File },
  { key: 'fileType', label: 'File Type', placeholder: 'Select file types', queryType: 'in' as QueryType, icon: Tag },
  { key: 'clientId', label: 'Client ID', placeholder: 'e.g., CS00', queryType: 'like' as QueryType, icon: User },
  { key: 'createdAt', label: 'Created Date', placeholder: 'Select date range', queryType: 'range' as QueryType, icon: Calendar }
];

/**
 * @const queryTypeConfig
 * @description Maps query types (e.g., 'matches', 'like') to UI component types and input behaviors.
 * Used by the filter popover to render the correct input field and provide descriptions.
 */
const queryTypeConfig: Record<QueryType, { component: string; inputType: string; description: string }> = {
  'matches': { component: 'input', inputType: 'text', description: 'Exact match' },
  'like': { component: 'input', inputType: 'text', description: 'Contains text' },
  'in': { component: 'input', inputType: 'text', description: 'Multiple values allowed (comma-separated or chip selection)' },
  'range': { component: 'dateRange', inputType: 'date', description: 'Date range (from/to)' }
};

// Predefined lists for common filter values, enhancing user experience by providing quick selections.
const commonContentTypes = [ /* ... as previously defined ... */ ];
const commonFileTypes = [ /* ... as previously defined ... */ ];
const commonSourceSystems = [ /* ... as previously defined ... */ ];

/**
 * @component IntegratedFilterUI
 * @description Provides a horizontally-oriented, integrated filter interface.
 * This component allows users to select various filter criteria through an interactive UI,
 * view applied filters as pills, and trigger a search. It replaces the traditional sidebar filter panel
 * for a more modern and integrated feel directly above the search results.
 * It manages its own internal state for filter construction and interacts with a parent component
 * (e.g., AdvancedSearchPage) via props (`currentFilters`, `onFilterChange`, `onSearch`, `isLoading`)
 * to receive initial filter values, communicate filter changes, and initiate search actions.
 */
export const IntegratedFilterUI: React.FC<IntegratedFilterUIProps> = ({
  currentFilters = {}, // Incoming filters from parent, used to initialize state.
  onFilterChange,     // Callback to inform parent of filter changes.
  onSearch,           // Callback to trigger search in parent.
  isLoading = false,  // Loading state from parent to disable UI elements.
}) => {
  /**
   * @state queryFilters
   * @description Array of `QueryFilter` objects representing the currently constructed/applied filters.
   * Initialized from `currentFilters` prop. This is the primary state for managing active filters.
   */
  const [queryFilters, setQueryFilters] = useState<QueryFilter[]>(() => {
    const initialFilters: QueryFilter[] = [];
    if (currentFilters && typeof currentFilters === 'object') {
      Object.entries(currentFilters).forEach(([key, value]) => {
        const option = filterOptions.find(opt => opt.key === key);
        if (option) {
          initialFilters.push({ key, type: option.queryType, value });
        }
      });
    }
    return initialFilters;
  });

  // --- State Variables for Filter Input Popover ---
  /** @state activeFilter - Key of the filter currently being edited in the popover (e.g., 'filename'). Null if no popover is active. */
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  /** @state filterInput - Holds the value for simple text-based inputs within the popover. */
  const [filterInput, setFilterInput] = useState('');
  /** @state selectedChips - Array of strings for 'in' type filters using chip selection (e.g., selected content types). */
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  /** @state dateRange - Object holding 'from' and 'to' date strings for 'range' type filters. */
  const [dateRange, setDateRange] = useState<DateRange>({});
  
  // --- Refs for DOM Elements ---
  const activeFilterRef = useRef<HTMLDivElement>(null); // Ref for the filter input popover element, used for click-outside detection.
  const inputRef = useRef<HTMLInputElement>(null); // Ref for the primary input field within the popover, used for autofocus.
  const filterButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({}); // Refs for each filter selection button, used for positioning the popover.
  
  /**
   * @state selectedButtonPosition
   * @description Stores the position (top, left, width) of the currently clicked filter button.
   * Used to calculate the position of the filter input popover, making it appear near the button.
   * `positionAbove` indicates if the popover should render above the button due to lack of space below.
   */
  const [selectedButtonPosition, setSelectedButtonPosition] = useState({ top: 0, left: 0, width: 0, positionAbove: false });

  // --- Effects ---

  /**
   * Effect to handle clicks outside the active filter popover to close it.
   */
  useEffect(() => {
    if (!activeFilter) return; // Only run if a popover is active.
    const handleClickOutside = (event: MouseEvent) => {
      if (activeFilterRef.current && !activeFilterRef.current.contains(event.target as Node)) {
        setActiveFilter(null); // Close popover.
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside); // Cleanup.
  }, [activeFilter]);

  /**
   * Effect to autofocus the main input field when a filter popover becomes active.
   */
  useEffect(() => {
    if (activeFilter && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeFilter]); // Re-run when `activeFilter` changes.

  // --- Filter Utility Functions ---
  const isFilterApplied = (key: string) => checkIsFilterApplied(key, queryFilters); // Checks if a filter with the given key is active.
  const getAppliedFilter = (key: string) => findAppliedFilter(key, queryFilters); // Retrieves an applied filter by its key.

  /**
   * @function getFilterValueDisplay
   * @description Formats the value of an applied filter for display in the filter pills.
   * Handles date ranges and array values (e.g., for 'in' type filters) appropriately.
   */
  const getFilterValueDisplay = (key: string, filter: QueryFilter): string => {
    // ... (implementation as before)
    const value = filter.value;
    if (filter.type === 'range' && value && typeof value === 'object') {
      const { from, to } = value as DateRange;
      if (from && to) return `${from} to ${to}`;
      if (from) return `From ${from}`;
      if (to) return `To ${to}`;
      return 'Invalid date range';
    }
    if (filter.type === 'in' && Array.isArray(value)) {
      let displayValues = value;
      if (key === 'contentType') {
        displayValues = value.map(v => commonContentTypes.find(ct => ct.value === v)?.label || v);
      } else if (key === 'fileType') {
        displayValues = value.map(v => commonFileTypes.find(ft => ft.value === v)?.label || v);
      }
      return displayValues.join(', ');
    }
    return String(value);
  };

  // --- Event Handlers for Filter Interaction ---

  /**
   * @function handleFilterSelect
   * @description Handles the click on a filter selection button.
   * It determines the popover's position relative to the clicked button and sets the `activeFilter`
   * state to show the popover. It also pre-populates the popover's input fields if the filter is already applied.
   */
  const handleFilterSelect = (key: string) => {
    const buttonEl = filterButtonRefs.current[key];
    if (buttonEl) {
      const buttonRect = buttonEl.getBoundingClientRect();
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const estimatedPopoverHeight = 300; // Approximate height of the popover.
      // Determine if popover should appear above the button if space below is insufficient
      // and there's enough space above.
      const positionAbove = spaceBelow < estimatedPopoverHeight && buttonRect.top > estimatedPopoverHeight;
      
      setSelectedButtonPosition({
        top: positionAbove ? buttonRect.top : buttonRect.bottom, // Anchor to top or bottom of button. Offset is handled by transform.
        left: buttonRect.left, // Align left edges.
        width: buttonRect.width, // Match width or use for relative sizing.
        positionAbove: positionAbove,
      });
    }

    setActiveFilter(key); // Set the current filter key to activate its popover.
    const option = filterOptions.find(opt => opt.key === key);
    if (!option) return;

    // Reset input states for the new popover.
    setFilterInput('');
    setSelectedChips([]);
    setDateRange({});

    // If the selected filter is already active, pre-fill the popover with its current values.
    const existingFilter = getAppliedFilter(key);
    if (existingFilter) {
      if (existingFilter.type === 'in' && Array.isArray(existingFilter.value)) {
        setSelectedChips([...existingFilter.value]);
      } else if (existingFilter.type === 'range' && typeof existingFilter.value === 'object') {
        setDateRange({ ...(existingFilter.value as DateRange) });
      } else if (typeof existingFilter.value === 'string') {
        setFilterInput(existingFilter.value);
      }
    }
  };
  
  // Handlers for specific input types within the popover.
  const handleSourceSystemSelect = (value: string) => setFilterInput(value); // For selecting predefined source systems.
  const handleChipToggle = (value: string) => { // For toggling chip selections in 'in' type filters.
    setSelectedChips(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };
  const handleDateRangeChange = (part: 'from' | 'to', value: string) => { // For date inputs in 'range' filters.
    setDateRange(prev => ({ ...prev, [part]: value }));
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setFilterInput(e.target.value); // For general text inputs.
  
  /**
   * @function handleKeyPress
   * @description Handles key presses (Escape, Enter) within the filter popover's input fields.
   * Escape closes the popover. Enter confirms the filter (except for date range).
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setActiveFilter(null);
    // For non-range types, Enter key can also confirm the filter.
    if (e.key === 'Enter' && activeFilter && filterOptions.find(opt => opt.key === activeFilter)?.queryType !== 'range') {
        handleFilterConfirm();
    }
  };

  /**
   * @function handleFilterConfirm
   * @description Called when the "Apply Filter" button in the popover is clicked.
   * It constructs the filter object based on the input values, updates the `queryFilters` state,
   * and calls `onFilterChange` to notify the parent component.
   */
  const handleFilterConfirm = () => {
    if (!activeFilter) return;
    const option = filterOptions.find(opt => opt.key === activeFilter);
    if (!option) return;

    let newValue: any; // Holds the value to be set for the filter.
    // Determine value based on query type and current input state.
    if (option.queryType === 'range') {
      if (!dateRange.from && !dateRange.to) { newValue = null; } // Allow clearing date range by removing value.
      else { newValue = { ...dateRange }; }
    } else if (option.queryType === 'in') {
      if (selectedChips.length === 0) { newValue = null; } // Allow clearing chip selection.
      else { newValue = [...selectedChips]; }
    } else { // 'matches', 'like' types
      if (!filterInput.trim()) { newValue = null; } // Allow clearing text input.
      else { newValue = filterInput.trim(); }
    }
    
    let newQueryFilters = [...queryFilters];
    const existingIndex = newQueryFilters.findIndex(f => f.key === activeFilter);

    // If newValue is null or an empty array, it means the user wants to remove/clear this specific filter.
    if (newValue === null || (Array.isArray(newValue) && newValue.length === 0)) {
        if (existingIndex >= 0) {
            newQueryFilters.splice(existingIndex, 1); // Remove filter from array.
        }
    } else { // Otherwise, add or update the filter.
        if (existingIndex >= 0) { // Update existing filter.
            newQueryFilters[existingIndex] = { key: activeFilter, type: option.queryType, value: newValue };
        } else { // Add new filter.
            newQueryFilters.push({ key: activeFilter, type: option.queryType, value: newValue });
        }
    }

    setQueryFilters(newQueryFilters); // Update internal state.
    // Convert `queryFilters` (array of objects) to `Record<string, any>` for the parent component.
    const newCurrentFilters = newQueryFilters.reduce((acc, f) => {
      acc[f.key] = f.value;
      return acc;
    }, {} as Record<string, any>);
    onFilterChange(newCurrentFilters); // Notify parent of the change.
    setActiveFilter(null); // Close the popover.
  };

  /**
   * @function removeFilter
   * @description Removes a specific filter pill when its 'X' button is clicked.
   * Updates `queryFilters` and calls `onFilterChange`.
   */
  const removeFilter = (keyToRemove: string) => {
    const newQueryFilters = queryFilters.filter(f => f.key !== keyToRemove);
    setQueryFilters(newQueryFilters);
    const newCurrentFilters = newQueryFilters.reduce((acc, f) => {
      acc[f.key] = f.value;
      return acc;
    }, {} as Record<string, any>);
    onFilterChange(newCurrentFilters);
  };

  /**
   * @function clearFilters
   * @description Clears all applied filters. Resets `queryFilters` and calls `onFilterChange` with an empty object.
   */
  const clearFilters = () => {
    setQueryFilters([]);
    onFilterChange({});
    setActiveFilter(null); // Ensure any open popover is closed.
  };

  /**
   * @function handleSearchSubmit
   * @description Triggers the `onSearch` callback prop to notify the parent component to perform the search.
   * Called by the main "Apply Filters & Search" button.
   */
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault(); // Prevent default form submission if used in a form context.
    onSearch();
  };

  return (
    // Main container for the filter UI. `space-y-4` provides vertical spacing between its direct children.
    // `p-4` provides internal padding. Styling aims for a card-like appearance.
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-4">
      {/* Filter Buttons Bar: Displays buttons for each available filter option. */}
      {/* Uses flex-wrap to allow buttons to wrap onto multiple lines on smaller screens. `gap-2` for spacing. */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm font-medium text-gray-700 mr-2">Filter by:</span>
        {filterOptions.map(option => {
          const IconComponent = option.icon || Filter;
          const applied = isFilterApplied(option.key);
          // Each button, when clicked, calls `handleFilterSelect` to open the popover for that filter.
          // Styling changes based on whether the filter is active (popover open) or applied.
          // Focus styles (`focus:outline-none focus:ring-2 ...`) are important for accessibility.
          return (
            <button
              key={option.key}
              ref={el => filterButtonRefs.current[option.key] = el}
              onClick={() => handleFilterSelect(option.key)}
              className={classNames(
                "px-3 py-1.5 rounded-md text-sm border transition-colors duration-150 flex items-center shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                activeFilter === option.key ? "bg-blue-500 text-white border-blue-500" : // Active (popover open) style
                applied ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" : // Applied style
                "bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50" // Default style
              )}
              aria-label={`Filter by ${option.label}${applied ? ', current filter applied' : ''}`}
            >
              <IconComponent size={14} className={classNames("mr-2", activeFilter === option.key || applied ? "" : "text-gray-400")} />
              {option.label}
              {activeFilter === option.key && <X size={14} className="ml-1.5" />} {/* Show 'X' if popover is open for this button */}
            </button>
          );
        })}
      </div>

      {/* Applied Filters Pills: Displays currently active/applied filters. */}
      {/* This section is only rendered if there are any filters in `queryFilters`. */}
      {queryFilters.length > 0 && (
        <div className="border-t border-gray-200 pt-3 mt-3"> {/* Separator line and spacing. */}
          <div className="flex flex-wrap items-center gap-2"> {/* `flex-wrap` for pill wrapping, `gap-2` for spacing. */}
            <span className="text-sm font-medium text-gray-700">Applied:</span>
            {queryFilters.map(qf => {
              const option = filterOptions.find(opt => opt.key === qf.key);
              const IconComponent = option?.icon || Filter;
              // Each pill displays the filter label and its formatted value.
              // Includes an 'X' button to remove the filter via `removeFilter`.
              return (
              <span
                key={qf.key}
                className="flex items-center bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-300"
              >
                <IconComponent size={12} className="mr-1.5 text-gray-500" />
                {option?.label || formatKey(qf.key)}: <strong className="ml-1 font-semibold">{getFilterValueDisplay(qf.key, qf)}</strong>
                <button
                  onClick={() => removeFilter(qf.key)}
                  className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-1 focus:ring-red-500 rounded-full p-0.5"
                  title={`Remove ${option?.label || qf.key} filter`}
                  aria-label={`Remove ${option?.label || qf.key} filter`}
                >
                  <X size={12} />
                </button>
              </span>
            )})}
            {/* "Clear all" button to remove all filters. */}
            <button
                onClick={clearFilters}
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline ml-2 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
            >
                Clear all
            </button>
          </div>
        </div>
      )}

      {/* Filter Input Popover: Dynamically rendered when `activeFilter` is not null. */}
      {/* Logic for popover:
          - Triggered by `handleFilterSelect` when a filter button is clicked.
          - `activeFilter` state holds the key of the filter being edited.
          - Renders different input fields based on `option.queryType` (date, chips, text).
          - Positioned near the clicked button using `selectedButtonPosition` state.
          - Includes a backdrop to close on outside click.
      */}
      {activeFilter && (() => {
        const option = filterOptions.find(opt => opt.key === activeFilter);
        if (!option) return null; // Should not happen if activeFilter is valid.
        const config = queryTypeConfig[option.queryType];

        return (
          <>
            {/* Backdrop for modal-like behavior; clicking it closes the popover. */}
            <div 
              className="fixed inset-0 bg-black/10 z-30"
              onClick={() => setActiveFilter(null)}
              aria-hidden="true" 
            ></div>
            {/* Popover Content Area */}
            {/* Styling for the popover: fixed position, shadow, border, rounded corners, max height with overflow. */}
            {/* `max-h-[80vh]` and `maxWidth: 'calc(100vw - 32px)'` ensure responsiveness. */}
            {/* `transform` with `translateY` provides a slight offset from the button for visual separation. */}
            <div
              ref={activeFilterRef} // Ref for click-outside detection.
              className="fixed bg-white p-4 rounded-lg border border-gray-300 shadow-xl z-40 max-h-[80vh] overflow-y-auto"
              style={{
                top: selectedButtonPosition.positionAbove ? 'auto' : `${selectedButtonPosition.top}px`,
                bottom: selectedButtonPosition.positionAbove 
                    // When positioned above, anchor its bottom relative to the button's top.
                    // The `selectedButtonPosition.width` was an error here in previous versions and is removed.
                    // The `selectedButtonPosition.top` is the top of the button.
                    ? `${window.innerHeight - selectedButtonPosition.top}px` 
                    : 'auto',
                left: `${selectedButtonPosition.left}px`,
                width: `${Math.max(300, selectedButtonPosition.width * 1.2)}px`, // Ensure a minimum width, can expand based on button width.
                minWidth: '300px',
                maxWidth: 'calc(100vw - 32px)', 
                transform: selectedButtonPosition.positionAbove 
                    ? 'translateY(-100%) translateY(-10px)' // Position above button with a 10px gap.
                    : 'translateY(10px)', // Position below button with a 10px gap.
              }}
              onClick={(e) => e.stopPropagation()} // Prevent clicks inside popover from closing it via backdrop.
              role="dialog"
              aria-modal="true"
              aria-labelledby={`filter-popover-title-${activeFilter}`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 id={`filter-popover-title-${activeFilter}`} className="text-sm font-medium text-gray-800">{option.label} Filter</h3>
                <button type="button" onClick={() => setActiveFilter(null)} className="text-gray-400 hover:text-gray-600 p-0.5 rounded hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-400" aria-label="Close filter input">
                  <X size={14} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-3">{config.description}</p>

              {/* Dynamic rendering of input fields based on filter type */}
              {option.queryType === 'range' && ( /* Date Range Input */
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor={`${activeFilter}-from`} className="block text-xs text-gray-600 mb-1">From</label>
                    <input id={`${activeFilter}-from`} type="date" value={dateRange.from || ''} onChange={(e) => handleDateRangeChange('from', e.target.value)}
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm" ref={inputRef} autoFocus />
                  </div>
                  <div>
                    <label htmlFor={`${activeFilter}-to`} className="block text-xs text-gray-600 mb-1">To</label>
                    <input id={`${activeFilter}-to`} type="date" value={dateRange.to || ''} onChange={(e) => handleDateRangeChange('to', e.target.value)}
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm" />
                  </div>
                </div>
              )}

              {/* Chip/Tag selection for 'Content Type' and 'File Type' */}
              {(option.queryType === 'in' && (activeFilter === 'contentType' || activeFilter === 'fileType')) && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">Select options:</p>
                  {/* `max-h-60 overflow-y-auto` allows scrolling if many options. */}
                  <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-1 bg-gray-50 rounded-md border">
                    {(activeFilter === 'contentType' ? commonContentTypes : commonFileTypes).map(chipOpt => (
                      <button key={chipOpt.value} type="button" onClick={() => handleChipToggle(chipOpt.value)}
                              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 ${selectedChips.includes(chipOpt.value) ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'}`}>
                        {chipOpt.label} {selectedChips.includes(chipOpt.value) && <Check size={12} className="ml-1 inline-block" />}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">{selectedChips.length} selected</p>
                </div>
              )}
              
              {/* Special input for 'Source System' combining predefined chips and text input */}
              {activeFilter === 'sourceSystem' && option.queryType === 'matches' && (
                <div className="space-y-2">
                     <p className="text-xs text-gray-500 mb-2">Select a source system or type to search:</p>
                        <div className="flex flex-wrap gap-2 mb-2 p-1 bg-gray-50 rounded-md border">
                          {commonSourceSystems.map(sysOpt => (
                            <button
                              key={sysOpt.value}
                              type="button"
                              onClick={() => handleSourceSystemSelect(sysOpt.value)} // Updates text input directly
                              className={`px-2.5 py-1 rounded-full text-xs font-medium border shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 ${filterInput === sysOpt.value ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                            >
                              {sysOpt.label} {filterInput === sysOpt.value && <Check size={12} className="ml-1 inline-block" />}
                            </button>
                          ))}
                        </div>
                  <input type={config.inputType} value={filterInput} onChange={handleInputChange} placeholder={option.placeholder}
                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm" ref={inputRef} onKeyDown={handleKeyPress} autoFocus />
                </div>
              )}

              {/* Default text input for 'like', other 'matches', and other 'in' types */}
              { (option.queryType === 'like' || (option.queryType === 'matches' && activeFilter !== 'sourceSystem') || (option.queryType === 'in' && activeFilter !== 'contentType' && activeFilter !== 'fileType') ) && (
                 <input type={config.inputType} value={filterInput} onChange={handleInputChange} placeholder={option.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm" ref={inputRef} onKeyDown={handleKeyPress} autoFocus />
              )}
              
              {/* Action button to apply the filter from the popover. */}
              <div className="flex justify-end mt-4">
                <button type="button" onClick={handleFilterConfirm}
                        className="px-4 py-1.5 bg-blue-600 text-white border border-blue-600 rounded-md text-xs font-medium hover:bg-blue-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
                  Apply Filter
                </button>
              </div>
            </div>
          </>
        );
      })()}

      {/* Main Search Button: Triggers the search action via `handleSearchSubmit`. */}
      {/* Separated by a border and padding from the filter selection/pill area. */}
      {/* Focus state `focus:ring-offset-2` provides a slightly larger offset for better visibility. */}
      <div className="flex justify-end border-t border-gray-200 pt-4 mt-4">
        <button
          type="button"
          onClick={() => handleSearchSubmit()}
          disabled={isLoading} // Disabled when `isLoading` prop is true.
          className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center transition-colors duration-150 shadow-sm"
        >
          {isLoading ? ( // Loading indicator within the button.
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Searching...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Apply Filters & Search
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default IntegratedFilterUI;
