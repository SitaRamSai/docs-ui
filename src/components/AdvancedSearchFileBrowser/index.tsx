import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { format } from 'date-fns';
import { File as FileIcon, FileText, Image, Search } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useSearch } from '../../hooks/useSearch';
import type { AdvancedSearchFileBrowserProps, Column, SearchResult } from '../../types/search';
import { LoadingPlaceholder } from './LoadingPlaceholder';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';
import { FilterPanel } from './FilterPanel';

const defaultColumns: Column[] = [
  {
    id: 'filename',
    label: 'Name',
    accessor: (item: SearchResult) => {
      // Determine icon based on contentType
      let Icon = FileIcon;
      if (item.contentType?.includes('image')) {
        Icon = Image;
      } else if (item.contentType?.includes('pdf') || item.contentType?.includes('word')) {
        Icon = FileText;
      }
      
      return (
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 p-1.5 rounded-md bg-blue-50">
            <Icon className="w-4 h-4 text-blue-600" />
          </div>
          <span className="truncate font-medium">{item.filename}</span>
        </div>
      );
    },
    sortable: true,
    width: '40%',
    minWidth: '200px',
  },
  {
    id: 'contentType',
    label: 'Type',
    accessor: (item: SearchResult) => {
      // Format content type to be more readable
      let type = item.contentType || '';
      if (type.includes('pdf')) return 'PDF';
      if (type.includes('jpeg') || type.includes('jpg')) return 'JPEG';
      if (type.includes('png')) return 'PNG';
      if (type.includes('word')) return 'Word';
      if (type.includes('excel')) return 'Excel';
      if (type.includes('spreadsheetml.sheet')) return 'Excel';
      if (type.includes('openxmlformats-officedocument.spreadsheetml')) return 'Excel';
      if (type.includes('text')) return 'Text';
      // Truncate long content types
      const splitType = type.split('/').pop() || type;
      return splitType.length > 15 ? splitType.substring(0, 12) + '...' : splitType;
    },
    sortable: true,
    width: '15%',
    minWidth: '100px',
  },
  {
    id: 'fileType',
    label: 'Category',
    accessor: (item: SearchResult) => (
      <div>
        {item.fileType ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {item.fileType.charAt(0).toUpperCase() + item.fileType.slice(1)}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </div>
    ),
    sortable: true,
    width: '15%',
    minWidth: '100px',
  },
  {
    id: 'createdAt',
    label: 'Created',
    accessor: (item: SearchResult) => {
      try {
        // Handle numeric timestamp in milliseconds (as string)
        const timestamp = parseInt(item.createdAt, 10);
        if (!isNaN(timestamp)) {
          return format(new Date(timestamp), 'MMM d, yyyy');
        }
        
        // Try to parse as ISO date string
        return format(new Date(item.createdAt), 'MMM d, yyyy');
      } catch (error) {
        console.log('Error formatting date:', item.createdAt);
        return 'Invalid date';
      }
    },
    sortable: true,
    width: '15%',
    minWidth: '120px',
  },
  {
    id: 'sourceSystem',
    label: 'Source',
    accessor: (item: SearchResult) => {
      const sourceSystemColors: Record<string, {bg: string, text: string}> = {
        'genius': { bg: 'bg-purple-100', text: 'text-purple-800' },
        'dragon': { bg: 'bg-green-100', text: 'text-green-800' },
        'ebao': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
        'ivos': { bg: 'bg-red-100', text: 'text-red-800' },
      };
      
      const color = sourceSystemColors[item.sourceSystem.toLowerCase()] || { bg: 'bg-gray-100', text: 'text-gray-800' };
      
      return (
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${color.bg} ${color.text}`}>
          {item.sourceSystem}
        </div>
      );
    },
    sortable: true,
    width: '15%',
    minWidth: '100px',
  },
];

export const AdvancedSearchFileBrowser: React.FC<AdvancedSearchFileBrowserProps> = ({
  initialQuery,
  onFileSelect,
  onPageChange,
  className,
  itemsPerPage = 20,
  showFilters = true,
  enableMultiSelect = true,
  customFileTypeIcons,
  dateFormat = 'PPp',
  loadingPlaceholderCount = 5,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const parentRef = useRef<HTMLDivElement>(null);
  const { data, error, isLoading, isFetching, updateParams, executeSearch, prefetchNextPage } = useSearch(initialQuery);

  const rowVirtualizer = useVirtualizer({
    count: data?.results.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 5,
  });

  const handleSort = useCallback((columnId: string) => {
    updateParams({
      query: [
        ...initialQuery.query,
        { key: 'sortBy', type: 'sort', value: columnId }
      ],
    });
    executeSearch();
  }, [initialQuery.query, updateParams, executeSearch]);

  const handleSearch = useCallback(() => {
    // Get filter types from FilterPanel's filterOptions
    const filterTypesMap: Record<string, string> = {
      'filename': 'like',
      'contentType': 'in',
      'fileType': 'in',
      'clientId': 'like',
      'createdAt': 'range',
      'sourceSystem': 'matches'
    };

    // Map filters to search queries with correct types
    const searchQueries = Object.entries(filters).map(([key, value]) => ({
      key,
      type: filterTypesMap[key] || 'matches', // Use defined type or default to 'matches'
      value
    }));

    // Check if sourceSystem is already in the filters
    const hasSourceSystem = searchQueries.some(query => query.key === 'sourceSystem');
    
    // Get the sourceSystem from the initialQuery if it exists
    const sourceSystemFromInitial = initialQuery.query.find(q => q.key === 'sourceSystem')?.value || 'genius';

    // Create new query array with sourceSystem always included
    const queryArray = [
      // Add sourceSystem if not already present in searchQueries
      ...(!hasSourceSystem ? [{ key: 'sourceSystem', type: 'matches', value: sourceSystemFromInitial }] : []),
      ...searchQueries
    ];

    updateParams({
      query: queryArray,
      offset: 0 // Reset to first page on new search
    });
    executeSearch();
    setHasSearched(true);
  }, [filters, updateParams, executeSearch, initialQuery.query]);

  const handleFileClick = useCallback((file: SearchResult, event: React.MouseEvent) => {
    if (enableMultiSelect && (event.ctrlKey || event.metaKey)) {
      setSelectedFiles(prev => {
        const newSelection = new Set(prev);
        if (newSelection.has(file.id)) {
          newSelection.delete(file.id);
        } else {
          newSelection.add(file.id);
        }
        return newSelection;
      });
    } else {
      setSelectedFiles(new Set([file.id]));
      onFileSelect?.(file);
    }
  }, [enableMultiSelect, onFileSelect]);

  useEffect(() => {
    if (data?.pagination.currentOffset !== undefined && onPageChange) {
      onPageChange(data.pagination.currentOffset);
    }
  }, [data?.pagination.currentOffset, onPageChange]);

  useEffect(() => {
    const scrollElement = parentRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      if (scrollHeight - scrollTop - clientHeight < 200) {
        prefetchNextPage();
      }
    };

    scrollElement.addEventListener('scroll', handleScroll);
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, [prefetchNextPage]);

  // Add useEffect to log any errors
  useEffect(() => {
    if (error) {
      console.error('Search error:', error);
    }
  }, [error]);

  // Add useEffect to log data when it changes
  useEffect(() => {
    if (data) {
      console.log('Search data received:', data);
    }
  }, [data]);
  
  // Don't execute search on mount automatically
  // useEffect(() => {
  //   console.log('Executing search on mount with params:', initialQuery);
  //   executeSearch();
  // }, [executeSearch]);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {showFilters && (
        <div className="mb-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <FilterPanel
            currentFilters={filters}
            onFilterChange={setFilters}
            onSearch={handleSearch}
            isLoading={isLoading}
          />
        </div>
      )}
      
      {hasSearched || data ? (
        <div
          ref={parentRef}
          className="flex-1 overflow-auto border border-gray-200 rounded-lg bg-white shadow-sm"
        >
          <div className="min-w-full table">
            <div className="sticky top-0 bg-gray-50 border-b border-gray-200 shadow-sm z-10">
              <div className="flex">
                {defaultColumns.map((column) => (
                  <div
                    key={column.id}
                    className={cn(
                      'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                      column.sortable && 'cursor-pointer hover:bg-gray-100',
                    )}
                    style={{ width: column.width, minWidth: column.minWidth }}
                    onClick={() => column.sortable && handleSort(column.id)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {initialQuery.query.some(q => q.key === 'sortBy' && q.value === column.id) && (
                        <span className="ml-1.5 text-blue-600">↓</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {isLoading ? (
              <LoadingPlaceholder count={loadingPlaceholderCount} columns={defaultColumns} />
            ) : !data ? (
              <EmptyState />
            ) : data.results.length === 0 ? (
              <EmptyState />
            ) : (
              <div
                className="relative"
                style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const item = data.results[virtualRow.index];
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        'absolute top-0 left-0 w-full',
                        'flex hover:bg-blue-50 cursor-pointer border-b border-gray-100',
                        selectedFiles.has(item.id) && 'bg-blue-50',
                      )}
                      style={{
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                      onClick={(e) => handleFileClick(item, e)}
                    >
                      {defaultColumns.map((column) => (
                        <div
                          key={column.id}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                          style={{ width: column.width, minWidth: column.minWidth }}
                        >
                          {column.accessor(item)}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-10 border border-gray-200 rounded-lg bg-white shadow-sm">
          <div className="p-4 bg-gray-50 rounded-full mb-4">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to search</h3>
          <p className="text-sm text-gray-500 text-center max-w-md">
            Use the filters above to search for documents. Select filters and click the search button when you're ready.
          </p>
        </div>
      )}

      {isFetching && !isLoading && (
        <div className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-full shadow-lg flex items-center text-blue-700 border border-blue-100">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm font-medium">Loading more...</span>
        </div>
      )}
    </div>
  );
};