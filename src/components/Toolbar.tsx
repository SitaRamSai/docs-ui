import React from 'react';
import { Upload, FolderPlus, Trash2, Share2, Search } from 'lucide-react';
import useFileStore from '../store/fileStore';

const Toolbar: React.FC = () => {
    const { selectedFiles, deleteFiles, addFile, currentFolder, searchQuery, setSearchQuery } = useFileStore();

    const handleUpload = () => {
        addFile({
            name: `File ${Math.random().toString(36).substr(2, 9)}.txt`,
            type: 'file',
            size: Math.floor(Math.random() * 1024 * 1024),
            modified: new Date(),
            parentId: currentFolder,
        });
    };

    const handleNewFolder = () => {
        addFile({
            name: 'New Folder',
            type: 'folder',
            modified: new Date(),
            parentId: currentFolder,
        });
    };

    const handleDelete = () => {
        deleteFiles(Array.from(selectedFiles));
    };

    const handleShare = () => {
        alert('Sharing functionality would be implemented here');
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    return (
        <div className="flex flex-wrap gap-2 p-3 sm:p-4 border-b">
            <div className="flex-1 flex items-center gap-2">
                <button
                    onClick={handleUpload}
                    className="flex-none flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 min-w-[80px]"
                >
                    <Upload className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Upload</span>
                </button>


                {/* <button
                    onClick={handleShare}
                    disabled={selectedFiles.size !== 1}
                    className="flex-none flex items-center justify-center px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 min-w-[80px]"
                >
                    <Share2 className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Share</span>
                </button> */}
            </div>
            <div className="flex-none flex items-center min-w-[200px] sm:min-w-[300px]">
                <div className="relative w-full">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder="Search files..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                </div>
            </div>
        </div>
    );
};

export default Toolbar;