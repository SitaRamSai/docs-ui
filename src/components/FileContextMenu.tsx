import React, { useState } from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import * as Dialog from '@radix-ui/react-dialog';
import {
    FolderOpen,
    Download,
    Pencil,
    Trash2,
    Share2,
    FilePlus,
    FolderPlus,
    Info,
    Calendar,
    Clock,
    User,
    FileText,
    HardDrive,
    Lock,
    Copy,
    Check,
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
import { FileItem } from '../types';
import useFileStore from '../store/fileStore';
import { formatFileSize, formatDate } from '../utlis';

interface FileContextMenuProps {
    file: FileItem;
    children: React.ReactNode;
    asChild?: boolean;
}

const FileContextMenu: React.FC<FileContextMenuProps> = ({ file, children, asChild = false }) => {

    const [showMetadata, setShowMetadata] = useState(false);
    const { deleteFiles, setCurrentFolder, addFile } = useFileStore();
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleOpen = () => {
        if (file.type === 'folder') {
            setCurrentFolder(file.id);
        } else {
            // Implement file opening logic
            console.log('Opening file:', file.name);
        }
    };

    const handleDownload = () => {
        if (file.metadata?.url) {
            window.open(file.metadata.url, '_blank');
        }
    };

    const handleRename = () => {
        // Implement rename logic
        const newName = prompt('Enter new name:', file.name);
        if (newName && newName !== file.name) {
            console.log('Renaming to:', newName);
        }
    };

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete ${file.name}?`)) {
            deleteFiles([file.id]);
        }
    };

    const handleShare = () => {
        setShowShareDialog(true);
    };

    const handleNewFile = () => {
        addFile({
            name: 'New File.txt',
            type: 'file',
            size: 0,
            modified: new Date(),
            parentId: file.id,
        });
    };

    const handleNewFolder = () => {
        addFile({
            name: 'New Folder',
            type: 'folder',
            modified: new Date(),
            parentId: file.id,
        });
    };

    const handleCopyUrl = async () => {
        const url = file.metadata?.url || window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy URL:', err);
        }
    };

    const handleToggleFavorite = () => {
        toggleFavorite(file.id);
    };

    return (
        <>
            <ContextMenu.Root>
                <ContextMenu.Trigger asChild={asChild}>
                    {children}
                </ContextMenu.Trigger>
                <ContextMenu.Portal>
                    <ContextMenu.Content
                        className="min-w-[220px] bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                    >
                        {file.type === 'folder' && (
                            <ContextMenu.Item
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer outline-none"
                                onClick={handleOpen}
                            >
                                <FolderOpen className="w-4 h-4 mr-2" />
                                Open
                            </ContextMenu.Item>
                        )}
                        {file.type === 'file' && (
                            <>
                                {file.metadata?.url && (
                                    <ContextMenu.Item
                                        className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer outline-none"
                                        onClick={handleDownload}
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download
                                    </ContextMenu.Item>
                                )}
                                <ContextMenu.Separator className="h-px bg-gray-200 my-1" />
                                <ContextMenu.Item
                                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer outline-none"
                                    onClick={handleShare}
                                >
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share
                                </ContextMenu.Item>
                            </>
                        )}

                        {/* <>
                            <ContextMenu.Item
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer outline-none"
                                onClick={handleNewFile}
                            >
                                <FilePlus className="w-4 h-4 mr-2" />
                                New File
                            </ContextMenu.Item>
                            <ContextMenu.Item
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer outline-none"
                                onClick={handleNewFolder}
                            >
                                <FolderPlus className="w-4 h-4 mr-2" />
                                New Folder
                            </ContextMenu.Item>
                        </> */}


                        <ContextMenu.Separator className="h-px bg-gray-200 my-1" />

                        <ContextMenu.Item
                            className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer outline-none"
                            onClick={() => setShowMetadata(true)}
                        >
                            <Info className="w-4 h-4 mr-2" />
                            Metadata Information
                        </ContextMenu.Item>

                        <ContextMenu.Separator className="h-px bg-gray-200 my-1" />

                        <ContextMenu.Item
                            className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer outline-none"
                            onClick={handleRename}
                        >
                            <Pencil className="w-4 h-4 mr-2" />
                            Rename
                        </ContextMenu.Item>

                        <ContextMenu.Item
                            className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer outline-none"
                            onClick={handleDelete}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </ContextMenu.Item>
                    </ContextMenu.Content>
                </ContextMenu.Portal>
            </ContextMenu.Root>

            <Dialog.Root open={showMetadata} onOpenChange={setShowMetadata}>
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
                                <span>Created: {formatDate(file.metadata?.createdAt || file.modified)}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span>Modified: {formatDate(file.modified)}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <User className="w-4 h-4 text-gray-400" />
                                <span>Owner: {file.metadata?.author || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <span>Type: {file.metadata?.contentType || file.type}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <HardDrive className="w-4 h-4 text-gray-400" />
                                <span>Size: {file.type === 'file' ? formatFileSize(file.metadata.sizeString) : '-'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Lock className="w-4 h-4 text-gray-400" />
                                <span>Permissions: {file.metadata?.permissions || 'Default'}</span>
                            </div>
                            {file.metadata?.clientId && (
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span>Client ID: {file.metadata.clientId}</span>
                                </div>
                            )}
                            {file.metadata?.sourceSystem && (
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    <span>Source System: {file.metadata.sourceSystem}</span>
                                </div>
                            )}
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Building2 className="w-4 h-4 text-gray-400" />
                                <span>Insured: {file.metadata?.insured || 'Default'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Building className="w-4 h-4 text-gray-400" />
                                <span>Branch: {file.metadata?.branch || 'Default'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <BookOpenCheck className="w-4 h-4 text-gray-400" />
                                <span>Current Status: {file.metadata?.['current status'] || 'Default'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <CalendarCheck className="w-4 h-4 text-gray-400" />
                                <span>Effective Date: {file.metadata?.['effective date'] || 'Default'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <PackageSearch className="w-4 h-4 text-gray-400" />
                                <span>Product: {file.metadata?.product || 'Default'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Handshake className="w-4 h-4 text-gray-400" />
                                <span>Line of Business: {file.metadata?.['line of business'] || 'Default'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <History className="w-4 h-4 text-gray-400" />
                                <span>Version: {file.metadata?.version || 'Default'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Star className="w-4 h-4 text-gray-400" />
                                <span>Upload Date: {file.metadata?.uploadDate || 'Default'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <FolderPlus className="w-4 h-4 text-gray-400" />
                                <span>Uploaded By: {file.metadata?.uploadedByText || 'Default'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <FilePlus className="w-4 h-4 text-gray-400" />
                                <span>AW Account Ref Number: {file.metadata?.['aw acc ref number'] || 'Default'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <User className="w-4 h-4 text-gray-400" />
                                <span>Underwriter : {file.metadata?.underwriter || 'Default'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <CalendarCheck className="w-4 h-4 text-gray-400" />
                                <span>Document Date: {file.metadata?.documentDate || 'Default'}</span>
                            </div>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
            {/* Share Dialog */}
            <Dialog.Root open={showShareDialog} onOpenChange={setShowShareDialog}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-fade-in" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-[90vw] max-w-md focus:outline-none">
                        <div className="flex justify-between items-center mb-4">
                            <Dialog.Title className="text-lg font-semibold text-gray-900">
                                Share {file.name}
                            </Dialog.Title>
                            <Dialog.Close className="text-gray-400 hover:text-gray-500">
                                <X className="w-5 h-5" />
                            </Dialog.Close>
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={file.metadata?.url || window.location.href}
                                    readOnly
                                    className="w-full pr-24 pl-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-900"
                                />
                                <button
                                    onClick={handleCopyUrl}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 flex items-center"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4 mr-1" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4 mr-1" />
                                            Copy
                                        </>
                                    )}
                                </button>
                            </div>

                            <p className="text-sm text-gray-500">
                                Anyone with this link will be able to view this file.
                            </p>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <Dialog.Close className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">
                                Close
                            </Dialog.Close>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </>
    );
};

export default FileContextMenu;