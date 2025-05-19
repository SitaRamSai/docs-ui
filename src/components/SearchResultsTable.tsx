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
  Loader2,
  Eye,
  Download,
  Share2,
  Pencil,
  Info
} from 'lucide-react';
import { cn } from '../utils/cn';
import { SearchResult, SearchPagination } from '../types/search';
import ActionButtons from './ActionButtons';
import FilePreview from './FilePreview';
import ShareDialog from './ShareDialog';
import { toast } from 'react-toastify';
 
interface SearchResultsTableProps {
  results: SearchResult[];
  pagination: SearchPagination;
  isLoading: boolean;
  onPageChange: (offset: number) => void;
  onFileSelect: (file: SearchResult) => void;
  selectedFiles: Set<string>;
}
 
// Extend SearchResult to work with ActionButtons component
const adaptSearchResultToFileItem = (result: SearchResult) => {
  return {
    id: result.id,
    name: result.filename,
    type: 'file',
    modified: new Date(result.createdAt),
    parentId: null,
    metadata: {
      contentType: result.contentType,
      author: result.clientId,
      sourceSystem: result.sourceSystem,
      fileType: result.fileType,
      documentDate: result.createdAt
    }
  };
};
 
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
  const [viewMode, setViewMode] = React.useState<'list' | 'grid'>('list');
  const [previewFile, setPreviewFile] = React.useState<SearchResult | null>(null);
  const [showShareDialog, setShowShareDialog] = React.useState<boolean>(false);
  const [showMetadata, setShowMetadata] = React.useState<SearchResult | null>(null);
  const [openMetaData, setOpenMetaData] = React.useState<boolean>(false);
  const [fileForAction, setFileForAction] = React.useState<SearchResult | null>(null);

  // Action handlers
  const handlePreview = (file: SearchResult, e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewFile(file);
  };

  const handleDownload = (file: SearchResult, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // We don't have direct URL access, so show a message
    toast.info('Download requested for: ' + file.filename);
    
    // In a real implementation, you would trigger a download API call
    // Example: downloadApi.getFileUrl(file.id).then(url => window.open(url, '_blank'));
  };

  const handleShare = (file: SearchResult, e: React.MouseEvent) => {
    e.stopPropagation();
    setFileForAction(file);
    setShowShareDialog(true);
  };

  const handleRename = (file: SearchResult, e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = prompt('Enter new name:', file.filename);
    if (newName && newName !== file.filename) {
      // Implement rename functionality
      toast.warning('Rename functionality not implemented yet');
    }
  };

  const handleMetadata = (file: SearchResult, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMetadata(file);
    setOpenMetaData(true);
  };

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
      {/* Results counter and view mode switcher */}
      <div className="flex justify-between items-center mb-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-50 text-blue-700">
          {pagination.total} {pagination.total === 1 ? 'result' : 'results'} found
        </span>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md ${viewMode === 'list'
              ? 'bg-blue-100 text-blue-600'
              : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md ${viewMode === 'grid'
              ? 'bg-blue-100 text-blue-600'
              : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </button>
        </div>
      </div>
      
      {/* Table View */}
      {viewMode === 'list' ? (
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
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    System
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result) => (
                  <tr 
                    key={result.id}
                    onClick={() => onFileSelect(result)}
                    className={cn(
                      "hover:bg-gray-50 cursor-pointer transition-colors", 
                      selectedFiles.has(result.id) && "bg-gray-100"
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
                      <div className="text-sm text-gray-900">{formatDate(result.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <SystemBadge system={result.sourceSystem} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex justify-center">
                        <div className="flex items-center space-x-2">
                          <button
                            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
                            title="Preview"
                            onClick={(e) => handlePreview(result, e)}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
                            title="Download"
                            onClick={(e) => handleDownload(result, e)}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
                            title="Share"
                            onClick={(e) => handleShare(result, e)}
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
                            title="Rename"
                            onClick={(e) => handleRename(result, e)}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
                            title="Info"
                            onClick={(e) => handleMetadata(result, e)}
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
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
      ) : (
        /* Grid View */
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.map((result) => (
              <div
                key={result.id}
                className={`relative group cursor-pointer p-4 rounded-lg border transition-all duration-200 ${
                  selectedFiles.has(result.id)
                    ? 'border-gray-200 bg-gray-100'
                    : 'border-gray-150 hover:border-gray-300 hover:shadow-lg'
                }`}
                onClick={() => onFileSelect(result)}
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 flex items-center justify-center mb-2">
                    {getFileIcon(result.contentType || '')}
                  </div>
                  <span className="text-sm text-gray-900 text-center truncate w-full">
                    {result.filename}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    {result.clientId || '-'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(result.createdAt)}
                  </span>
                  <span className="mt-2">
                    <SystemBadge system={result.sourceSystem} />
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-2 bg-white border-t border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center space-x-1">
                  <button
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
                    title="Preview"
                    onClick={(e) => handlePreview(result, e)}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
                    title="Download"
                    onClick={(e) => handleDownload(result, e)}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
                    title="Share"
                    onClick={(e) => handleShare(result, e)}
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
                    title="Info"
                    onClick={(e) => handleMetadata(result, e)}
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination for grid view */}
          <div className="mt-4">
            <PaginationControls 
              pagination={pagination} 
              onPageChange={onPageChange} 
            />
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">{previewFile.filename}</h3>
              <button 
                onClick={() => setPreviewFile(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {/* This is where you'd render the file preview */}
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Document preview not available</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Dialog */}
      {showShareDialog && fileForAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Share Document</h3>
              <button 
                onClick={() => setShowShareDialog(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Share "{fileForAction.filename}" with others:</p>
              <div className="flex">
                <input 
                  type="text" 
                  readOnly 
                  value={`${window.location.origin}/share/${fileForAction.sourceSystem}/${fileForAction.id}`}
                  className="flex-1 p-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                />
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/share/${fileForAction.sourceSystem}/${fileForAction.id}`);
                    toast.success('Link copied to clipboard!');
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metadata Dialog */}
      {showMetadata && openMetaData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Metadata Information</h3>
              <button 
                onClick={() => setOpenMetaData(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Created: {formatDate(showMetadata.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Client ID: {showMetadata.clientId || 'Unknown'}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>Type: {showMetadata.contentType || 'Unknown'}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                <span>Source System: {showMetadata.sourceSystem}</span>
              </div>
              {showMetadata.fileType && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>File Type: {showMetadata.fileType}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
 
export default SearchResultsTable; 
