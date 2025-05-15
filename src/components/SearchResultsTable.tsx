import React from 'react';
import { format } from 'date-fns';
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  FileIcon,
  FileText,
  Image,
  FileSpreadsheet,
  FileType,
  FileCode,
  Mail,
  File,
  Loader2
} from 'lucide-react';
import { cn } from '../utils/cn';
import { SearchResult, SearchPagination } from '../types/search';

interface SearchResultsTableProps {
  results: SearchResult[];
  pagination: SearchPagination;
  isLoading: boolean;
  onPageChange: (offset: number) => void;
  onFileSelect: (file: SearchResult) => void;
  selectedFiles: Set<string>;
}

// File type icon mapping
const getFileIcon = (contentType: string): React.ReactNode => {
  if (!contentType) return <File className="w-4 h-4 text-gray-600" />;
  
  if (contentType.includes('pdf')) 
    return <FileType className="w-4 h-4 text-red-600" />;
  if (contentType.includes('spreadsheet') || contentType.includes('excel')) 
    return <FileSpreadsheet className="w-4 h-4 text-green-600" />;
  if (contentType.includes('word') || contentType.includes('document')) 
    return <FileText className="w-4 h-4 text-blue-600" />;
  if (contentType.includes('image')) 
    return <Image className="w-4 h-4 text-purple-600" />;
  if (contentType.includes('html') || contentType.includes('json') || contentType.includes('xml')) 
    return <FileCode className="w-4 h-4 text-yellow-600" />;
  if (contentType.includes('outlook') || contentType.includes('email') || contentType.includes('msg')) 
    return <Mail className="w-4 h-4 text-blue-600" />;
  
  return <FileIcon className="w-4 h-4 text-gray-600" />;
};

// Format date helper
const formatDate = (dateStr: string) => {
  try {
    // Handle numeric timestamp in milliseconds (as string)
    const timestamp = parseInt(dateStr, 10);
    if (!isNaN(timestamp)) {
      return format(new Date(timestamp), 'MMM d, yyyy');
    }
    
    // Try to parse as ISO date string
    return format(new Date(dateStr), 'MMM d, yyyy');
  } catch (error) {
    return 'Invalid date';
  }
};

// Format content type for display
const formatContentType = (contentType: string): string => {
  if (!contentType) return 'Unknown';
  
  // Map common content types to readable formats
  if (contentType.includes('pdf')) return 'PDF';
  if (contentType.includes('jpeg') || contentType.includes('jpg')) return 'JPEG';
  if (contentType.includes('png')) return 'PNG';
  if (contentType.includes('gif')) return 'GIF';
  if (contentType.includes('word')) return 'Word';
  if (contentType.includes('excel') || contentType.includes('spreadsheetml')) return 'Excel';
  if (contentType.includes('powerpoint') || contentType.includes('presentation')) return 'PowerPoint';
  if (contentType.includes('text/plain')) return 'Text';
  if (contentType.includes('text/html')) return 'HTML';
  if (contentType.includes('application/json')) return 'JSON';
  if (contentType.includes('application/xml')) return 'XML';
  if (contentType.includes('outlook') || contentType.includes('msg')) return 'Email';
  if (contentType.includes('zip') || contentType.includes('compressed')) return 'Archive';
  
  // For other types, get the subtype from MIME format
  const splitType = contentType.split('/');
  if (splitType.length === 2) {
    return splitType[1].charAt(0).toUpperCase() + splitType[1].slice(1);
  }
  
  return contentType;
};

const ContentTypeBadge = ({ contentType }: { contentType: string }) => {
  // Set colors based on content type category
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-700';
  
  if (contentType.includes('pdf')) {
    bgColor = 'bg-red-50';
    textColor = 'text-red-700';
  } else if (contentType.includes('image')) {
    bgColor = 'bg-purple-50';
    textColor = 'text-purple-700';
  } else if (contentType.includes('word') || contentType.includes('document')) {
    bgColor = 'bg-blue-50';
    textColor = 'text-blue-700';
  } else if (contentType.includes('excel') || contentType.includes('spreadsheet')) {
    bgColor = 'bg-green-50';
    textColor = 'text-green-700';
  } else if (contentType.includes('outlook') || contentType.includes('msg') || contentType.includes('email')) {
    bgColor = 'bg-yellow-50';
    textColor = 'text-yellow-700';
  }
  
  return (
    <div className="group relative flex items-center">
      <div className={`flex-shrink-0 p-1 rounded ${bgColor}`}>
        {getFileIcon(contentType)}
      </div>
      <span className={`ml-2 text-sm ${textColor}`}>
        {formatContentType(contentType)}
      </span>
      
      {/* Tooltip that appears on hover */}
      <div className="absolute bottom-full left-0 transform -translate-y-1 mb-1 hidden group-hover:block z-10">
        <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 shadow-lg max-w-xs">
          <p className="font-medium">Content Type:</p>
          <p className="break-all">{contentType || 'Not specified'}</p>
        </div>
        <div className="absolute top-full left-4 transform -translate-x-1/2 border-4 border-gray-900 border-t-0 border-l-transparent border-r-transparent h-0 w-0"></div>
      </div>
    </div>
  );
};

// File type badge helper
const FileTypeBadge = ({ type }: { type: string }) => {
  if (!type) return null;
  
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
};

// System source badge helper
const SystemBadge = ({ system }: { system: string }) => {
  const sourceSystemColors: Record<string, {bg: string, text: string}> = {
    'genius': { bg: 'bg-purple-100', text: 'text-purple-800' },
    'dragon': { bg: 'bg-green-100', text: 'text-green-800' },
    'ebao': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    'ivos': { bg: 'bg-red-100', text: 'text-red-800' },
  };
  
  const color = sourceSystemColors[system.toLowerCase()] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  
  return (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${color.bg} ${color.text}`}>
      {system}
    </div>
  );
};

// Pagination component
const PaginationControls: React.FC<{
  pagination: SearchPagination;
  onPageChange: (offset: number) => void;
}> = ({ pagination, onPageChange }) => {
  const { currentPage, totalPages, pageSize, total, currentOffset, nextOffset, previousOffset } = pagination;
  
  // Calculate start and end item numbers
  const startItem = currentOffset + 1;
  const endItem = Math.min(currentOffset + pageSize, total);
  
  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    
    // Always show first page
    pages.push(1);
    
    // Calculate range around current page
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pages.push('ellipsis-start');
    }
    
    // Add pages around current page
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pages.push('ellipsis-end');
    }
    
    // Always show last page if more than one page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 py-3 px-2 border-t border-gray-200">
      {/* Results counter */}
      <div className="text-sm text-gray-700">
        Showing <span className="font-medium">{startItem}</span> to{' '}
        <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{total}</span> results
      </div>
      
      {/* Pagination controls */}
      <div className="flex items-center space-x-2">
        {/* First page button */}
        <button
          onClick={() => onPageChange(0)}
          disabled={currentPage === 1}
          className={cn(
            "relative inline-flex items-center px-2 py-1.5 rounded-md text-sm font-medium",
            currentPage === 1
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-700 hover:bg-gray-50"
          )}
        >
          <ChevronFirst className="h-4 w-4" />
        </button>
        
        {/* Previous page button */}
        <button
          onClick={() => previousOffset !== null && onPageChange(previousOffset)}
          disabled={previousOffset === null}
          className={cn(
            "relative inline-flex items-center px-2 py-1.5 rounded-md text-sm font-medium",
            previousOffset === null
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-700 hover:bg-gray-50"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        {/* Page numbers */}
        <div className="hidden md:flex">
          {getPageNumbers().map((page, index) => {
            if (page === 'ellipsis-start' || page === 'ellipsis-end') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="relative inline-flex items-center px-3 py-1.5 text-sm text-gray-700"
                >
                  ...
                </span>
              );
            }
            
            const pageNum = page as number;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange((pageNum - 1) * pageSize)}
                className={cn(
                  "relative inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium",
                  currentPage === pageNum
                    ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
        
        {/* Current page indicator (mobile) */}
        <span className="md:hidden text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        
        {/* Next page button */}
        <button
          onClick={() => nextOffset !== null && onPageChange(nextOffset)}
          disabled={nextOffset === null}
          className={cn(
            "relative inline-flex items-center px-2 py-1.5 rounded-md text-sm font-medium",
            nextOffset === null
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-700 hover:bg-gray-50"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        
        {/* Last page button */}
        <button
          onClick={() => onPageChange((totalPages - 1) * pageSize)}
          disabled={currentPage === totalPages}
          className={cn(
            "relative inline-flex items-center px-2 py-1.5 rounded-md text-sm font-medium",
            currentPage === totalPages
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-700 hover:bg-gray-50"
          )}
        >
          <ChevronLast className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const SearchResultsTable: React.FC<SearchResultsTableProps> = ({
  results,
  pagination,
  isLoading,
  onPageChange,
  onFileSelect,
  selectedFiles
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500">Loading results...</p>
      </div>
    );
  }
  
  if (!results || results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="p-4 bg-gray-50 rounded-full mb-4">
          <FileText className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
        <p className="text-sm text-gray-500">Try adjusting your search filters</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col">
      {/* Results counter badge */}
      <div className="mb-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-50 text-blue-700">
          {pagination.total} {pagination.total === 1 ? 'result' : 'results'} found
        </span>
      </div>
      
      {/* Table */}
      <div className="overflow-hidden border border-gray-200 rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  System
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map((result) => (
                <tr 
                  key={result.id}
                  onClick={() => onFileSelect(result)}
                  className={cn(
                    "hover:bg-blue-50 cursor-pointer transition-colors", 
                    selectedFiles.has(result.id) && "bg-blue-50"
                  )}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-md bg-gray-50">
                        {getFileIcon(result.contentType || '')}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {result.filename}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{result.clientId || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ContentTypeBadge contentType={result.contentType || ''} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <FileTypeBadge type={result.fileType || ''} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(result.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <SystemBadge system={result.sourceSystem} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <PaginationControls 
          pagination={pagination} 
          onPageChange={onPageChange} 
        />
      </div>
    </div>
  );
};

export default SearchResultsTable; 