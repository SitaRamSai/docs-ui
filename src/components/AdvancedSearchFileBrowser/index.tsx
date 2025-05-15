import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useSearch } from '../../hooks/useSearch';
import type { AdvancedSearchFileBrowserProps, SearchResult } from '../../types/search';
import { EmptyState } from './EmptyState';
import { FilterPanel } from './FilterPanel';
import SearchResultsTable from '../SearchResultsTable';

export const AdvancedSearchFileBrowser: React.FC<AdvancedSearchFileBrowserProps> = ({
  initialQuery,
  onFileSelect,
  onPageChange,
  className,
  itemsPerPage = 20,
  showFilters = true,
  enableMultiSelect = true,
  dateFormat = 'PPp',
  loadingPlaceholderCount = 5,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const parentRef = useRef<HTMLDivElement>(null);
  const { data, error, isLoading, isFetching, updateParams, executeSearch, prefetchNextPage } = useSearch(initialQuery);

  // Trigger new search when initialQuery prop changes
  useEffect(() => {
    updateParams(initialQuery);
    executeSearch();
    setHasSearched(true);
  }, [initialQuery]);

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

  const handleFileClick = useCallback((file: SearchResult) => {
    if (enableMultiSelect) {
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

  const handlePageChange = useCallback((offset: number) => {
    updateParams({
      offset: offset
    });
    executeSearch();
    
    if (onPageChange) {
      onPageChange(offset);
    }
  }, [updateParams, executeSearch, onPageChange]);

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
          className="flex-1 overflow-auto"
        >
          {error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6 border-t border-gray-100">
              <div className="bg-red-50 p-4 rounded-full mb-4">
                <Search className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading files</h3>
              <p className="text-sm text-red-500 mb-1 font-medium">{error.message}</p>
              <p className="text-xs text-gray-500">Please try again or contact support if the problem persists</p>
            </div>
          ) : (
            <SearchResultsTable
              results={data?.results || []}
              pagination={data?.pagination || {
                total: 0,
                pageSize: itemsPerPage,
                currentOffset: 0,
                nextOffset: null,
                previousOffset: null,
                hasMore: false,
                totalPages: 0,
                currentPage: 1
              }}
              isLoading={isLoading}
              onPageChange={handlePageChange}
              onFileSelect={handleFileClick}
              selectedFiles={selectedFiles}
            />
          )}
        </div>
      ) : (
        showFilters ? null : (
          <div className="flex-1 flex flex-col items-center justify-center p-10 border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="p-4 bg-gray-50 rounded-full mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to search</h3>
            <p className="text-sm text-gray-500 text-center max-w-md">
              Use the filters above to search for documents. Select filters and click the search button when you're ready.
            </p>
          </div>
        )
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