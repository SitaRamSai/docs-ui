import React, { useState, useEffect } from 'react';
import {
    LayoutGrid,
    LayoutList,
    Calendar,
    Loader2,
    Folder,
    File,
    ChevronDown,
    Download,
    Pencil,
    Share2,
    Info,
    ChevronLeft,
    ChevronRight,
    User,
    X,
    Filter,
    Search,
    Eye,
    Copy,
    Check
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import useFileStore from '../store/fileStore';
import { FileItem } from '../types';
import {
    formatFileSize,
    formatDate,
    getFileIcon,
    getIconColor,
} from '../utlis';
import FilePreview from './FilePreview';
import ShareDialog from './ShareDialog';
import ActionButtons from './ActionButtons';
import { downloadFiles } from '../utils/fileUtils';
import { toast } from 'react-toastify';

const ITEMS_PER_PAGE = 20;

// Custom interface for the component's SearchResult type
interface SearchResult {
    file: FileItem;
    relevanceScore: number;
    matchContext?: string;
}

interface AdvancedSearchResultsProps {
    searchResults: SearchResult[];
    isLoading: boolean;
    error: string | null;
    searchQuery: string;
    searchFilters: any;
}

const AdvancedSearchResults: React.FC<AdvancedSearchResultsProps> = ({
    searchResults,
    isLoading,
    error,
    searchQuery,
    searchFilters
}) => {
    const { selectedFiles, toggleFileSelection, files } = useFileStore();

    type ViewMode = 'list' | 'grid';
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
    const [sortField, setSortField] = useState<string>('relevance');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [showShareDialog, setShowShareDialog] = useState<boolean>(false);
    const [showMetadata, setShowMetadata] = useState<FileItem | null>(null);
    const [openMetaData, setOpenMetaData] = useState<boolean>(false);
    const [copied, setCopied] = useState(false);
    const [showFileSharing, setShowFileSharing] = useState<FileItem | null>(null);

    const selectedFileObjects = files.filter((file: FileItem) => selectedFiles.has(file.id));

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const handleCopyUrl = async () => {
        const url = showFileSharing?.metadata?.url || window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy URL:', err);
        }
    };

    const sortedResults = [...searchResults].sort((a, b) => {
        const direction = sortDirection === 'asc' ? 1 : -1;
        switch (sortField) {
            case 'name':
                return direction * a.file.name.localeCompare(b.file.name);
            case 'author':
                return direction * ((a.file.metadata?.author || '').localeCompare(b.file.metadata?.author || ''));
            case 'modified':
                return direction * (a.file.modified.getTime() - b.file.modified.getTime());
            case 'relevance':
                return direction * (b.relevanceScore - a.relevanceScore);
            default:
                return 0;
        }
    });

    const totalPages = Math.ceil(sortedResults.length / ITEMS_PER_PAGE);
    const paginatedResults = sortedResults.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const newSelection = new Set(paginatedResults.map(result => result.file.id));
            useFileStore.setState({ selectedFiles: newSelection });
        } else {
            useFileStore.setState({ selectedFiles: new Set() });
        }
    };

    const handleDownload = (file: FileItem, e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedFiles?.size) {
            toast.promise(downloadFiles(selectedFileObjects), {
                success: 'Files downloaded successfully!',
                pending: 'Download in progress...',
                error: 'Unable to download file!'
            });
            return;
        }
        if (file?.metadata?.url) {
            window.open(file.metadata.url, '_blank');
        }
    };

    const handleShare = (file: FileItem, e: React.MouseEvent) => {
        e.stopPropagation();
        setShowFileSharing(file);
        setShowShareDialog(true);
    };

    const handleRename = (file: FileItem, e: React.MouseEvent) => {
        e.stopPropagation();
        const newName = prompt('Enter new name:', file.name);
        if (newName && newName !== file.name) {
            // Implement rename functionality
        }
    };

    const handlePreview = (file: FileItem, e: React.MouseEvent) => {
        e.stopPropagation();
        setPreviewFile(file);
    };

    const handleMetadata = (file: FileItem, e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMetadata(file);
        setOpenMetaData(true);
    };

    const handleFileClick = (file: FileItem) => {
        if (file.type === 'folder') {
            // Handle folder navigation if needed
        } else {
            setPreviewFile(file);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-red-500 text-center">
                    <p className="text-lg font-semibold">Error loading search results</p>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Search Info Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <Search className="w-5 h-5 text-gray-400" />
                            <h2 className="text-lg font-semibold text-gray-900">Search Results for: <span className="text-primary">{searchQuery}</span></h2>
                        </div>
                    </div>
                    {
                        selectedFiles.size ? <div className="flex flex-row gap-2">
                            <button
                                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
                                title="Download"
                                onClick={(e) => handleDownload(selectedFileObjects[0], e)}
                            >
                                <Download className="w-6 h-6" />
                            </button>
                            <button
                                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
                                title="Share"
                                onClick={(e) => handleShare(selectedFileObjects[0], e)}
                            >
                                <Share2 className="w-6 h-6" />
                            </button>
                        </div> : ''
                    }
                </div>
            </div>

            {/* Filters and View mode switcher */}
            <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                        <Filter className="w-4 h-4 mr-1 text-gray-400" />
                        <span>Filters Applied: {Object.keys(searchFilters || {}).length || 'None'}</span>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-500">View:</span>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-md ${viewMode === 'list'
                            ? 'bg-blue-100 text-blue-600'
                            : 'text-gray-500 hover:bg-gray-100'
                            }`}
                    >
                        <LayoutList className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-md ${viewMode === 'grid'
                            ? 'bg-blue-100 text-blue-600'
                            : 'text-gray-500 hover:bg-gray-100'
                            }`}
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Search Results */}
            {viewMode === 'list' ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                        checked={selectedFiles.size === paginatedResults.length}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('name')}
                                >
                                    <div className="flex items-center">
                                        Name
                                        {sortField === 'name' && (
                                            <ChevronDown
                                                className={`w-4 h-4 ml-1 transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
                                            />
                                        )}
                                    </div>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('author')}
                                >
                                    <div className="flex items-center">
                                        Author
                                        {sortField === 'author' && (
                                            <ChevronDown
                                                className={`w-4 h-4 ml-1 transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
                                            />
                                        )}
                                    </div>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('modified')}
                                >
                                    <div className="flex items-center">
                                        Modified
                                        {sortField === 'modified' && (
                                            <ChevronDown
                                                className={`w-4 h-4 ml-1 transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
                                            />
                                        )}
                                    </div>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('relevance')}
                                >
                                    <div className="flex items-center">
                                        Relevance
                                        {sortField === 'relevance' && (
                                            <ChevronDown
                                                className={`w-4 h-4 ml-1 transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
                                            />
                                        )}
                                    </div>
                                </th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedResults.map((result) => (
                                <tr
                                    key={result.file.id}
                                    className={`hover:bg-gray-50 ${selectedFiles.has(result.file.id) ? 'bg-gray-100' : ''}`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                            checked={selectedFiles.has(result.file.id)}
                                            onChange={() => toggleFileSelection(result.file.id)}
                                        />
                                    </td>
                                    <td
                                        className="px-6 py-4 whitespace-nowrap cursor-pointer"
                                        onClick={() => handleFileClick(result.file)}
                                    >
                                        <div className="flex items-center">
                                            {React.createElement(getFileIcon(result.file, 5), {
                                                className: `w-5 h-5 ${getIconColor(result.file)}`
                                            })}
                                            <span className="ml-2 text-sm text-gray-900 max-w-25">{result.file.name}</span>
                                        </div>
                                        {result.matchContext && (
                                            <p className="text-xs text-gray-500 mt-1 ml-7 italic">
                                                ...{result.matchContext}...
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <User className="w-4 h-4 mr-1" />
                                            {result.file.metadata?.author || '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(result.file.metadata?.documentDate || result.file.modified)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div 
                                                className="bg-primary h-2.5 rounded-full" 
                                                style={{ width: `${Math.min(100, result.relevanceScore * 100)}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {Math.round(result.relevanceScore * 100)}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex justify-center">
                                            <ActionButtons 
                                                file={result.file}
                                                handlePreview={handlePreview}
                                                handleDownload={handleDownload}
                                                handleShare={handleShare}
                                                handleRename={handleRename}
                                                handleMetadata={handleMetadata} 
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {paginatedResults.map((result) => (
                            <div
                                key={result.file.id}
                                className={`relative group cursor-pointer p-4 rounded-lg border transition-all duration-200 ${
                                    selectedFiles.has(result.file.id)
                                        ? 'border-gray-200 bg-gray-100'
                                        : 'border-gray-150 hover:border-gray-300 hover:shadow-lg'
                                }`}
                                onClick={() => handleFileClick(result.file)}
                            >
                                <div className="absolute top-2 left-2">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                        checked={selectedFiles.has(result.file.id)}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            toggleFileSelection(result.file.id);
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col items-center">
                                    {React.createElement(getFileIcon(result.file, 12), {
                                        className: `w-12 h-12 ${getIconColor(result.file)} mb-2`
                                    })}
                                    <span className="text-sm text-gray-900 text-center truncate w-full">
                                        {result.file.name}
                                    </span>
                                    <span className="text-xs text-gray-500 mt-1">
                                        {result.file.metadata?.author || '-'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {formatDate(result.file.modified)}
                                    </span>
                                    {result.matchContext && (
                                        <p className="text-xs text-gray-500 mt-1 italic line-clamp-2 text-center">
                                            ...{result.matchContext}...
                                        </p>
                                    )}
                                    {/* Relevance indicator */}
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                        <div 
                                            className="bg-primary h-1.5 rounded-full" 
                                            style={{ width: `${Math.min(100, result.relevanceScore * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="absolute inset-x-0 bottom-0 p-2 bg-white border-t border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center space-x-1">
                                    <ActionButtons 
                                        file={result.file}
                                        handlePreview={handlePreview}
                                        handleDownload={handleDownload}
                                        handleShare={handleShare}
                                        handleRename={handleRename}
                                        handleMetadata={handleMetadata} 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                            disabled={currentPage === totalPages}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                                <span className="font-medium">
                                    {Math.min(currentPage * ITEMS_PER_PAGE, sortedResults.length)}
                                </span>{' '}
                                of <span className="font-medium">{sortedResults.length}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="sr-only">First</span>
                                    <ChevronLeft className="h-5 w-5" />
                                    <ChevronLeft className="h-5 w-5 -ml-2" />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="sr-only">Previous</span>
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="sr-only">Next</span>
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="sr-only">Last</span>
                                    <ChevronRight className="h-5 w-5" />
                                    <ChevronRight className="h-5 w-5 -ml-2" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            {/* File Preview Modal */}
            {previewFile && (
                <FilePreview
                    file={previewFile}
                    isOpen={true}
                    onClose={() => setPreviewFile(null)}
                />
            )}

            {/* Share Dialog */}
            {showShareDialog && (
                <ShareDialog
                    files={selectedFileObjects}
                    isOpen={showShareDialog}
                    onClose={() => setShowShareDialog(false)}
                />
            )}

            {/* Metadata Modal */}
            {showMetadata && (
                <Dialog.Root open={openMetaData} onOpenChange={setOpenMetaData}>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
                        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-[90vw] max-w-2xl focus:outline-none">
                            <div className="flex items-center justify-between mb-4">
                                <Dialog.Title className="text-lg font-semibold text-gray-900">
                                    Metadata Information
                                </Dialog.Title>
                                <Dialog.Close className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </Dialog.Close>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span>Created: {formatDate(showMetadata.metadata?.createdAt || showMetadata.modified)}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span>Modified: {formatDate(showMetadata.modified)}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span>Author: {showMetadata.metadata?.author || 'Unknown'}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <File className="w-4 h-4 text-gray-400" />
                                    <span>Type: {showMetadata.metadata?.contentType || showMetadata.type}</span>
                                </div>
                                {showMetadata.metadata?.sourceSystem && (
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <Folder className="w-4 h-4 text-gray-400" />
                                        <span>Source System: {showMetadata.metadata.sourceSystem}</span>
                                    </div>
                                )}
                                {showMetadata.metadata?.clientId && (
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <span>Client ID: {showMetadata.metadata.clientId}</span>
                                    </div>
                                )}
                                {showMetadata.metadata?.documentDate && (
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span>Document Date: {showMetadata.metadata.documentDate}</span>
                                    </div>
                                )}
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>
            )}
        </div>
    );
};

export default AdvancedSearchResults; 