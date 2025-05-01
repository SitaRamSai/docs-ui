import React, { useState, useEffect } from 'react';
import { LayoutGrid, LayoutList, User, Calendar, Loader2, Folder, File } from 'lucide-react';
import useFileStore from '../store/fileStore';
import { FileItem } from '../types';
import { formatFileSize, formatDate, getFileIcon, getIconColor } from '../utlis';
import FileContextMenu from './FileContextMenu';
import FilePreview from './FilePreview';

const FileList: React.FC = () => {
    const {
        files,
        currentFolder,
        selectedFiles,
        toggleFileSelection,
        setCurrentFolder,
        isLoading,
        error,
        fetchDocuments,
        fetchClientList,
        getFilteredFiles
    } = useFileStore();

    const [viewMode, setViewMode] = React.useState<'list' | 'grid'>('list');
    const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

    useEffect(() => {
        // Initial load of client list
        fetchClientList('dragon');
    }, [fetchClientList]);

    const filteredFiles = getFilteredFiles();
    const currentFiles = filteredFiles.filter((file) => file.parentId === currentFolder);
    const folderCount = currentFiles.filter(file => file.type === 'folder').length;
    const fileCount = currentFiles.filter(file => file.type === 'file').length;

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

    const handleFileClick = async (file: FileItem) => {
        if (file.type === 'folder') {
            setCurrentFolder(file.id);
            // Load files when clicking a folder
            if (file.metadata?.clientId && file.metadata?.sourceSystem) {
                await fetchDocuments(file.metadata.sourceSystem, file.metadata.clientId);
            }
        } else {
            setPreviewFile(file);
        }
    };

    const handleFileSelect = (e: React.MouseEvent, file: FileItem) => {
        e.stopPropagation();
        toggleFileSelection(file.id);
    };

    const renderIcon = (file: FileItem, size: number = 20) => {
        const Icon = getFileIcon(file, size);
        const className = `h-${size} w-${size} ${file.type === 'file' ? getIconColor(file) : 'text-gray-400'
            }`;
        return <Icon className={className} />;
    };

    const renderMobileFile = (file: FileItem) => (
        <FileContextMenu key={file.id} file={file}>
            <div
                className={`p-4 ${selectedFiles.has(file.id) ? 'bg-blue-50' : ''
                    }`}
                onClick={() => handleFileClick(file)}
            >
                <div className="flex items-center space-x-3">
                    {renderIcon(file)}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                        </p>
                        <div className="mt-1 flex items-center text-xs text-gray-500">
                            {file.metadata?.author && (
                                <span className="flex items-center">
                                    <User className="h-3 w-3 mr-1" />
                                    {file.metadata.author}
                                </span>
                            )}
                            <span className="mx-2">•</span>
                            <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatDate(file.modified)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </FileContextMenu>
    );

    const renderGridFile = (file: FileItem) => (
        <FileContextMenu key={file.id} file={file}>
            <div
                className={`p-4 rounded-lg border border-gray-200 ${selectedFiles.has(file.id) ? 'bg-blue-50' : 'hover:bg-gray-50'
                    } cursor-pointer transition-colors duration-200`}
                onClick={() => handleFileClick(file)}
            >
                <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-16 h-16 flex items-center justify-center">
                        {renderIcon(file, 8)}
                    </div>
                    <div className="w-full">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                        </p>
                        {file.type === 'file' && (
                            <p className="text-xs text-gray-500 mt-1">
                                {formatFileSize(file.metadata?.sizeString!)}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </FileContextMenu>
    );

    const renderDesktopFile = (file: FileItem) => {
        const content = (
            <tr
                className={`group ${selectedFiles.has(file.id) ? 'bg-blue-50' : 'hover:bg-gray-50'
                    } cursor-pointer`}
                onClick={() => handleFileClick(file)}
            >
                <td className="w-[35%] px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center min-w-0">
                        <div className="flex-shrink-0">
                            {renderIcon(file)}
                        </div>
                        <span className="ml-2 text-sm text-gray-900 truncate">{file.name}</span>
                    </div>
                </td>
                <td className="w-[15%] px-6 py-4 whitespace-nowrap">
                    {file.metadata?.author && (
                        <div className="flex items-center text-sm text-gray-500 truncate">
                            <User className="h-4 w-4 mr-1 flex-shrink-0" />
                            {file.metadata.author}
                        </div>
                    )}
                </td>
                <td className="w-[20%] px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(file.modified)}
                </td>
                <td className="hidden lg:table-cell w-[15%] px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate">
                    {file.metadata?.clientId}
                </td>
                <td className="hidden md:table-cell w-[10%] px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate">
                    {file.type === 'file' ? file.metadata?.contentType || file.type : 'Folder'}
                </td>
                <td className="w-[5%] px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {file.type === 'file' ? formatFileSize(file.size!) : '-'}
                </td>
            </tr>
        );

        return (
            <FileContextMenu key={file.id} file={file} asChild>
                {content}
            </FileContextMenu>
        );
    };

    return (
        <div className="w-full">
            {/* View mode switcher with file counts */}
            <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                        <Folder className="w-4 h-4 mr-1 text-gray-400" />
                        <span>{folderCount} folder{folderCount !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center">
                        <File className="w-4 h-4 mr-1 text-gray-400" />
                        <span>{fileCount} file{fileCount !== 1 ? 's' : ''}</span>
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

            {/* Mobile view */}
            <div className="sm:hidden divide-y divide-gray-200">
                {currentFolder !== 'root' && (
                    <div
                        className="p-4 flex items-center space-x-2 hover:bg-gray-50"
                        onClick={() => {
                            const parent = files.find((f) => f.id === currentFolder)?.parentId;
                            setCurrentFolder(parent || 'root');
                        }}
                    >
                        {renderIcon({ id: '..', name: '..', type: 'folder', modified: new Date(), parentId: null })}
                        <span className="text-sm text-gray-900">..</span>
                    </div>
                )}
                {currentFiles.map(renderMobileFile)}
            </div>

            {/* Desktop view */}
            <div className="hidden sm:block">
                {viewMode === 'grid' ? (
                    <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {currentFolder !== 'root' && (
                            <div
                                className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                                onClick={() => {
                                    const parent = files.find((f) => f.id === currentFolder)?.parentId;
                                    setCurrentFolder(parent || 'root');
                                }}
                            >
                                <div className="flex flex-col items-center text-center space-y-2">
                                    <div className="w-16 h-16 flex items-center justify-center text-gray-400">
                                        {renderIcon({ id: '..', name: '..', type: 'folder', modified: new Date(), parentId: null }, 8)}
                                    </div>
                                    <p className="text-sm text-gray-900">..</p>
                                </div>
                            </div>
                        )}
                        {currentFiles.map(renderGridFile)}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-fixed divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="w-[25%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Author
                                    </th>
                                    <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Modified
                                    </th>
                                    <th className="hidden  w-[5%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Client ID
                                    </th>
                                    <th className="hidden w-[3%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="w-[5%] px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Size
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentFolder !== 'root' && (
                                    <tr
                                        className="hover:bg-gray-50 cursor-pointer"
                                        onClick={() => {
                                            const parent = files.find((f) => f.id === currentFolder)?.parentId;
                                            setCurrentFolder(parent || 'root');
                                        }}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {renderIcon({ id: '..', name: '..', type: 'folder', modified: new Date(), parentId: null })}
                                                <span className="text-sm text-gray-900 ml-2">..</span>
                                            </div>
                                        </td>
                                        <td colSpan={5}></td>
                                    </tr>
                                )}
                                {currentFiles.map(renderDesktopFile)}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {previewFile && (
                <FilePreview
                    file={previewFile}
                    isOpen={true}
                    onClose={() => setPreviewFile(null)}
                />
            )}
        </div>
    );
};

export default FileList;