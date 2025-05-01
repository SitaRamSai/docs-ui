import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { format } from 'date-fns';
import { File as FileIcon, FileText, Image } from 'lucide-react';
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
      return (
        <div className="flex items-center gap-2">
          <FileIcon className="w-5 h-5 text-gray-400" />
          <span className="truncate">{item.filename}</span>
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
    accessor: (item: SearchResult) => item.contentType,
    sortable: true,
    width: '20%',
    minWidth: '120px',
  },
  {
    id: 'createdAt',
    label: 'Created',
    accessor: (item: SearchResult) => format(new Date(item.createdAt), 'PPp'),
    sortable: true,
    width: '20%',
    minWidth: '150px',
  },
  {
    id: 'sourceSystem',
    label: 'Source',
    accessor: (item: SearchResult) => item.sourceSystem,
    sortable: true,
    width: '20%',
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
    const searchQueries = Object.entries(filters).map(([key, value]) => ({
      key,
      type: 'matches',
      value
    }));

    updateParams({
      query: [
        { key: 'sourceSystem', type: 'matches', value: 'ebao' },
        ...searchQueries
      ],
      offset: 0 // Reset to first page on new search
    });
    executeSearch();
  }, [filters, updateParams, executeSearch]);

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

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {showFilters && (
        <FilterPanel
          currentFilters={filters}
          onFilterChange={setFilters}
          onSearch={handleSearch}
          isLoading={isLoading}
        />
      )}
      
      <div
        ref={parentRef}
        className="flex-1 overflow-auto border border-gray-200 rounded-lg bg-white"
      >
        <div className="min-w-full table">
          <div className="sticky top-0 bg-gray-50 border-b border-gray-200">
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
                  {column.label}
                  {initialQuery.query.some(q => q.key === 'sortBy' && q.value === column.id) && (
                    <span className="ml-2">↓</span>
                  )}
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
                      'flex hover:bg-gray-50 cursor-pointer',
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
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
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

      {isFetching && !isLoading && (
        <div className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-full shadow-lg">
          Loading more...
        </div>
      )}
    </div>
  );
};