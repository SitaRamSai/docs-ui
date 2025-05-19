import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
    Eye,
    Copy,
    Check
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import {
    FilePlus,
    FolderPlus,
    Clock,
    User,
    FileText,
    HardDrive,
    Lock,
    X,
    Star,
    Building2,
    Building,
    BookOpenCheck,
    CalendarCheck,
    PackageSearch,
    Handshake,
    History,
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
import ShareDialog from './ShareDialog';
import ActionButtons from './ActionButtons';
import { downloadFiles } from '../utils/fileUtils';
import { toast } from 'react-toastify';
const ITEMS_PER_PAGE = 20;

const FileList: React.FC = () => {
    const { sourceSystem, clientId, documentType } = useParams<{ sourceSystem: string; clientId: string, documentType: string }>();
    const {
        files,
        currentFolder,
        selectedFiles,
        toggleFileSelection,
        setCurrentFolder,
        isLoading,
        error,
        fetchDocuments,
        filteredFiles,
        deleteFiles,
        searchQuery
    } = useFileStore();

    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
    const [sortField, setSortField] = useState<string>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [copied, setCopied] = useState(false);
    const [showMetadata, setShowMetadata] = useState<FileItem | null>(null);
    const [openMetaData, setOpenMetaData] = useState<boolean>(false);
    const [showShareDialog, setShowShareDialog] = useState<boolean>(false);
    const [showFileSharing, setShowFileSharing] = useState<FileItem | null>(null);

    useEffect(() => {
        fetchDocuments(sourceSystem, clientId);
    }, [fetchDocuments, sourceSystem, clientId]);


    const currentFiles = filteredFiles.filter(
        (file) => file.parentId === currentFolder
    );

    const selectedFileObjects = files.filter(file => selectedFiles.has(file.id));

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
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

    const truncateText = (text) => {
        const words = text.split(' ');

        if (words.length > 6) {
            return words.slice(0, 6).join(' ') + '...';
        } else {
            return text;
        }
    }

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
        if (selectedFiles?.size) {
            toast.promise(downloadFiles(selectedFileObjects), {
                success: 'Files downloaded successfully!',
                pending: 'Download in progress...',
                error: 'Unable to download file!'
            })
            return;
        }
        if (file.metadata?.url) {
            window.open(file.metadata.url, '_blank');
        }
    };

    const handleShare = (file: FileItem, e: React.MouseEvent) => {
        e.stopPropagation();
        // Implement share functionality
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

    return <div className="w-full">
        {/* Source System and Client ID Info */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-cente justify-between">
                <div className="flex flex-row gap-5">
                    <div>
                        <h2 className="text-sm font-medium text-gray-500">Source System</h2>
                        <p className="text-lg font-semibold text-gray-900">{sourceSystem}</p>
                    </div>
                    <div>
                        <h2 className="text-sm font-medium text-gray-500">Client ID</h2>
                        <p className="text-lg font-semibold text-gray-900">{clientId}</p>
                    </div>
                </div>
                {
                    selectedFiles.size ? <div className="flex flex-row gap-2">
                        <button
                            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
                            title="Download"
                            onClick={(e) => handleDownload(selectedFiles, e)}
                        >
                            <Download className="w-6 h-6" />
                        </button>
                        <button
                            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
                            title="Share"
                            onClick={(e) => handleShare(selectedFiles, e)}
                        >
                            <Share2 className="w-6 h-6" />
                        </button>
                    </div> : ''
                }
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
        {/* <div className="overflow-x-auto">
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
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-32 break-words"
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
                                <td className="px-6 py-4 whitespace-nowrap break-words w-32 overflow-ellipsis">
                                    <div className="flex items-center">
                                        {React.createElement(getFileIcon(file, 5))}
                                        <span className="ml-2 text-sm text-gray-900">{truncateText(file.name)}</span>
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
            </div> */}
        {/* File List/Grid */}
        {viewMode === 'list' ? (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                    checked={selectedFiles.size === paginatedFiles.length}
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
                                className={`hover:bg-gray-50 ${selectedFiles.has(file.id) ? 'bg-gray-100' : ''
                                    }`}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                        checked={selectedFiles.has(file.id)}
                                        onChange={() => toggleFileSelection(file.id)}
                                    />
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap cursor-pointer"
                                    onClick={() => handleFileClick(file)}
                                >
                                    <div className="flex items-center">
                                        {React.createElement(getFileIcon(file, 5), {
                                            className: `w-5 h-5 ${getIconColor(file)}`
                                        })}
                                        <span className="ml-2 text-sm text-gray-900 max-w-25">{file.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <User className="w-4 h-4 mr-1" />
                                        {file.metadata?.author || '-'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(file.metadata?.documentDate)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex justify-center">
                                        <ActionButtons file={file}
                                            handlePreview={handlePreview}
                                            handleDownload={handleDownload}
                                            handleShare={handleShare}
                                            handleRename={handleRename}
                                            handleMetadata={handleMetadata} />
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
                    {currentFolder !== 'root' && (
                        <div
                            className="relative group cursor-pointer p-4 rounded-lg border border-gray-200 hover:border-primary hover:shadow-lg transition-all duration-200"
                            onClick={() => {
                                const parent = files.find(f => f.id === currentFolder)?.parentId;
                                setCurrentFolder(parent || 'root');
                            }}
                        >
                            <div className="flex flex-col items-center">
                                <Folder className="w-12 h-12 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-900 text-center truncate w-full">..</span>
                            </div>
                        </div>
                    )}
                    {paginatedFiles.map((file) => (
                        <div
                            key={file.id}
                            className={`relative group cursor-pointer p-4 rounded-lg border transition-all duration-200 ${selectedFiles.has(file.id)
                                ? 'border-gray-200 bg-gray-100'
                                : 'border-gray-150 hover:border-gray-300 hover:shadow-lg'
                                }`}
                            onClick={() => handleFileClick(file)}
                        >
                            <div className="absolute top-2 left-2">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                    checked={selectedFiles.has(file.id)}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        toggleFileSelection(file.id);
                                    }}
                                />
                            </div>
                            <div className="flex flex-col items-center">
                                {React.createElement(getFileIcon(file, 12), {
                                    className: `w-12 h-12 ${getIconColor(file)} mb-2`
                                })}
                                <span className="text-sm text-gray-900 text-center truncate w-full">
                                    {file.name}
                                </span>
                                <span className="text-xs text-gray-500 mt-1">
                                    {file.metadata?.author || '-'}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {formatDate(file.modified)}
                                </span>
                            </div>
                            <div className="absolute inset-x-0 bottom-0 p-2 bg-white border-t border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center space-x-1">
                                <ActionButtons file={file}
                                    handlePreview={handlePreview}
                                    handleDownload={handleDownload}
                                    handleShare={handleShare}
                                    handleRename={handleRename}
                                    handleMetadata={handleMetadata} />
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

        {/* File Sharing Modal */}
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
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span>Modified: {formatDate(showMetadata.modified)}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <User className="w-4 h-4 text-gray-400" />
                                <span>Owner: {showMetadata.metadata?.author || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <span>Type: {showMetadata.metadata?.contentType || showMetadata.type}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <HardDrive className="w-4 h-4 text-gray-400" />
                                <span>Size: {showMetadata.type === 'file' ? formatFileSize(showMetadata.metadata.sizeString) : '-'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Lock className="w-4 h-4 text-gray-400" />
                                <span>Permissions: {showMetadata.metadata?.permissions || 'Default'}</span>
                            </div>
                            {showMetadata.metadata?.clientId && (
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span>Client ID: {showMetadata.metadata.clientId}</span>
                                </div>
                            )}
                            {showMetadata.metadata?.sourceSystem && (
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    <span>Source System: {showMetadata.metadata.sourceSystem}</span>
                                </div>
                            )}
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Building2 className="w-4 h-4 text-gray-400" />
                                <span>Insured: {showMetadata.metadata?.insured || 'Default'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Building className="w-4 h-4 text-gray-400" />
                                <span>Branch: {showMetadata.metadata?.branch || 'Default'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <BookOpenCheck className="w-4 h-4 text-gray-400" />
                                <span>Current Status: {showMetadata.metadata?.['current status'] || 'Default'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <CalendarCheck className="w-4 h-4 text-gray-400" />
                                <span>Effective Date: {showMetadata.metadata?.['effective date'] || 'Default'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <PackageSearch className="w-4 h-4 text-gray-400" />
                                <span>Product: {showMetadata.metadata?.product || 'Default'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Handshake className="w-4 h-4 text-gray-400" />
                                <span>Line of Business: {showMetadata.metadata?.['line of business'] || 'Default'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <History className="w-4 h-4 text-gray-400" />
                                <span>Version: {showMetadata.metadata?.version || 'Default'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Star className="w-4 h-4 text-gray-400" />
                                <span>Upload Date: {showMetadata.metadata?.uploadDate || 'Default'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <FolderPlus className="w-4 h-4 text-gray-400" />
                                <span>Uploaded By: {showMetadata.metadata?.uploadedByText || 'Default'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <FilePlus className="w-4 h-4 text-gray-400" />
                                <span>AW Account Ref Number: {showMetadata.metadata?.['aw acc ref number'] || 'Default'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <User className="w-4 h-4 text-gray-400" />
                                <span>Underwriter : {showMetadata.metadata?.underwriter || 'Default'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <CalendarCheck className="w-4 h-4 text-gray-400" />
                                <span>Document Date: {showMetadata.metadata?.documentDate || 'Default'}</span>
                            </div>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        )}
    </div>
};

export default FileList;