import React from 'react';
import { Star } from 'lucide-react';
import { FileItem } from '../types';
import { getFileIcon, getIconColor } from '../utils';
import useFileStore from '../store/fileStore';

interface FileGridItemProps {
    file: FileItem;
    onClick: () => void;
    onSelect?: (e: React.MouseEvent) => void;
    selected?: boolean;
}

const FileGridItem: React.FC<FileGridItemProps> = ({ file, onClick, onSelect, selected }) => {
    const { toggleFavorite } = useFileStore();
    const Icon = getFileIcon(file, 8);

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleFavorite(file.id);
    };

    return (
        <div
            className={`p-4 rounded-lg border border-gray-200 ${selected ? 'bg-blue-50' : 'hover:bg-gray-50'
                } cursor-pointer transition-colors duration-200 relative group`}
            onClick={onClick}
        >
            <button
                onClick={handleFavoriteClick}
                className={`absolute top-2 right-2 p-1 rounded-full ${file.favorite ? 'text-yellow-400' : 'text-gray-400 opacity-0 group-hover:opacity-100'
                    } hover:bg-gray-100 transition-opacity duration-200`}
            >
                <Star className="w-4 h-4" />
            </button>
            <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-16 h-16 flex items-center justify-center">
                    <Icon className={`w-16 h-16 ${getIconColor(file)}`} />
                </div>
                <div className="w-full">
                    <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                    </p>
                    {file.type === 'file' && file.size !== undefined && (
                        <p className="text-xs text-gray-500 mt-1">
                            {formatFileSize(file.size)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileGridItem;