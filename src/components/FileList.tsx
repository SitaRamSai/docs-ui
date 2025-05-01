import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    LayoutGrid,
    LayoutList,
    User,
    Calendar,
    Loader2,
    Folder,
    File,
    ChevronDown,
    Download,
    Pencil,
    Trash2,
    Share2,
    Info,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import useFileStore from '../store/fileStore';
import { FileItem } from '../types';
import {
    formatFileSize,
    formatDate,
    getFileIcon,
    getIconColor,
} from '../utlis'
import FileContextMenu from './FileContextMenu';
import FilePreview from './FilePreview';

const ITEMS_PER_PAGE = 10;

const FileList: React.FC = () => {
    const { sourceSystem, clientId } = useParams<{ sourceSystem: string; clientId: string }>();
    const {
        files,
        currentFolder,
        selectedFiles,
        toggleFileSelection,
        setCurrentFolder,
        isLoading,
        error,
        fetchDocuments,
        getFilteredFiles,
        deleteFiles,
    } = useFileStore();

    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
    const [sortField, setSortField] = useState<string>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [showMetadata, setShowMetadata] = useState<FileItem | null>(null);

    useEffect(() => {
        fetchDocuments(sourceSystem, clientId);
    }, [fetchDocuments, sourceSystem, clientId]);

    const filteredFiles = getFilteredFiles();
    const currentFiles = filteredFiles.filter(
        (file) => file.parentId === currentFolder
    );

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortedFiles = [...currentFiles].sort((a, b) => {
        const direction = sortDirection === 'asc' ? 1 : -1;
        switch (sortField) {
            case 'name':
                return direction * a.name.localeCompare(b.name);
            case 'author':
                return direction * ((a.metadata?.author || '').localeCompare(b.metadata?.author || ''));
            case 'modified':
                return direction * (a.modified.getTime() - b.modified.getTime());
            default:
                return 0;
        }
    });

    const totalPages = Math.ceil(sortedFiles.length / ITEMS_PER_PAGE);
    const paginatedFiles = sortedFiles.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const newSelection = new Set(paginatedFiles.map(file => file.id));
            useFileStore.setState({ selectedFiles: newSelection });
        } else {
            useFileStore.setState({ selectedFiles: new Set() });
        }
    };

    const handleDownload = (file: FileItem, e: React.MouseEvent) => {
        e.stopPropagation();
        if (file.metadata?.url) {
            window.open(file.metadata.url, '_blank');
        }
    };

    const handleShare = (file: FileItem, e: React.MouseEvent) => {
        e.stopPropagation();
        // Implement share functionality
        alert(`Sharing ${file.name}`);
    };

    const handleRename = (file: FileItem, e: React.MouseEvent) => {
        e.stopPropagation();
        const newName = prompt('Enter new name:', file.name);
        if (newName && newName !== file.name) {
            // Implement rename functionality
        }
    };

    const handleDelete = async (file: FileItem, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(`Are you sure you want to delete ${file.name}?`)) {
            await deleteFiles([file.id]);
        }
    };

    const handlePreview = (file: FileItem, e: React.MouseEvent) => {
        e.stopPropagation();
        setPreviewFile(file);
    };

    const handleMetadata = (file: FileItem, e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMetadata(file);
    };

    const ActionButtons: React.FC<{ file: FileItem }> = ({ file }) => (
        <div className="flex items-center space-x-2">
            {file.type === 'file' && (
                <>
                    <button
                        className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
                        title="Preview"
                        onClick={(e) => handlePreview(file, e)}
                    >
                        <File className="w-4 h-4" />
                    </button>
                    <button
                        className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
                        title="Download"
                        onClick={(e) => handleDownload(file, e)}
                    >
                        <Download className="w-4 h-4" />
                    </button>
                    <button
                        className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
                        title="Share"
                        onClick={(e) => handleShare(file, e)}
                    >
                        <Share2 className="w-4 h-4" />
                    </button>
                </>
            )}
            <button
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
                title="Rename"
                onClick={(e) => handleRename(file, e)}
            >
                <Pencil className="w-4 h-4" />
            </button>
            <button
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 hover:text-red-600 transition-colors"
                title="Delete"
                onClick={(e) => handleDelete(file, e)}
            >
                <Trash2 className="w-4 h-4" />
            </button>
            <button
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
                title="Info"
                onClick={(e) => handleMetadata(file, e)}
            >
                <Info className="w-4 h-4" />
            </button>
        </div>
    );

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
                    <p className="text-lg font-semibold">Error loading files</p>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Source System and Client ID Info */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <h2 className="text-sm font-medium text-gray-500">Source System</h2>
                        <p className="text-lg font-semibold text-gray-900">{sourceSystem}</p>
                    </div>
                    <div>
                        <h2 className="text-sm font-medium text-gray-500">Client ID</h2>
                        <p className="text-lg font-semibold text-gray-900">{clientId}</p>
                    </div>
                </div>
            </div>

            {/* View mode switcher */}
            <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                    {/* <div className="flex items-center">
                        <Folder className="w-4 h-4 mr-1 text-gray-400" />
                        <span>{currentFiles.filter(f => f.type === 'folder').length} folders</span>
                    </div> */}
                    <div className="flex items-center">
                        <File className="w-4 h-4 mr-1 text-gray-400" />
                        <span>{currentFiles.filter(f => f.type === 'file').length} files</span>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md ${viewMode === 'list'
                            ? 'bg-blue-100 text-blue-600'
                            : 'text-gray-500 hover:bg-gray-100'
                            }`}
                    >
                        <LayoutList className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md ${viewMode === 'grid'
                            ? 'bg-blue-100 text-blue-600'
                            : 'text-gray-500 hover:bg-gray-100'
                            }`}
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* File List */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    checked={selectedFiles.size === paginatedFiles.length}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer [w-10%]"
                                onClick={() => handleSort('name')}
                            >
                                <div className="flex items-center">
                                    Name
                                    {sortField === 'name' && (
                                        <ChevronDown
                                            className={`w-4 h-4 ml-1 transform ${sortDirection === 'desc' ? 'rotate-180' : ''
                                                }`}
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
                                            className={`w-4 h-4 ml-1 transform ${sortDirection === 'desc' ? 'rotate-180' : ''
                                                }`}
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
                                            className={`w-4 h-4 ml-1 transform ${sortDirection === 'desc' ? 'rotate-180' : ''
                                                }`}
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
                        {currentFolder !== 'root' && (
                            <tr className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <Folder className="w-5 h-5 text-gray-400" />
                                    </div>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap cursor-pointer"
                                    onClick={() => {
                                        const parent = files.find(f => f.id === currentFolder)?.parentId;
                                        setCurrentFolder(parent || 'root');
                                    }}
                                >
                                    <div className="flex items-center">
                                        <span className="text-sm text-gray-900">..</span>
                                    </div>
                                </td>
                                <td colSpan={3}></td>
                            </tr>
                        )}
                        {paginatedFiles.map((file) => (
                            <tr
                                key={file.id}
                                className={`hover:bg-gray-50 ${selectedFiles.has(file.id) ? 'bg-blue-50' : ''
                                    }`}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        checked={selectedFiles.has(file.id)}
                                        onChange={() => toggleFileSelection(file.id)}
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        {React.createElement(getFileIcon(file, 5))}
                                        <span className="ml-2 text-sm text-gray-900">{file.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <User className="w-4 h-4 mr-1" />
                                        {file.metadata?.author || '-'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(file.modified)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex justify-center">
                                        <ActionButtons file={file} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

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
                                    {Math.min(currentPage * ITEMS_PER_PAGE, sortedFiles.length)}
                                </span>{' '}
                                of <span className="font-medium">{sortedFiles.length}</span> results
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

            {/* Metadata Modal */}
            {showMetadata && (
                <FileContextMenu
                    file={showMetadata}
                    isOpen={true}
                    onClose={() => setShowMetadata(null)}
                />
            )}
        </div>
    );
};

export default FileList;