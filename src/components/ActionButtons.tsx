import { FileItem } from "../types";
import { Eye, Download, Share2, Pencil, Info } from "lucide-react";
import { formatDate } from "../utlis";

interface ActionButtonProps {
    file: FileItem,
    handlePreview: Function,
    handleDownload: Function,
    handleShare: Function,
    handleRename: Function,
    handleMetadata: Function,
}

const ActionButtons: React.FC<ActionButtonProps> = ({ file, handlePreview, handleDownload, handleShare, handleRename, handleMetadata }) => (
    <div className="flex items-center space-x-2">
        {file.type === 'file' && (
            <>
                <button
                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
                    title="Preview"
                    onClick={(e) => handlePreview(file, e)}
                >
                    <Eye className="w-4 h-4" />
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
                <button
                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
                    title="Rename"
                    onClick={(e) => handleRename(file, e)}
                >
                    <Pencil className="w-4 h-4" />
                </button>
            </>
        )}
        {/* <button
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 hover:text-red-600 transition-colors"
            title="Delete"
            onClick={(e) => handleDelete(file, e)}
        >
            <Trash2 className="w-4 h-4" />
        </button> */}
        {
            file.type !== 'file' ? <button
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
                title="Download"
                onClick={(e) => handleDownload(file, e)}
            >
                <Download className="w-4 h-4" />
            </button> : ''
        }
        {/* <button
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
            title="Share"
            onClick={(e) => handleShare(file, e)}
        >
            <Share2 className="w-4 h-4" />
        </button> */}
        <button
            className="group/metadata relative p-1.5 rounded-full relative hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
            onClick={(e) => handleMetadata(file, e)}
        >
            <Info className="w-4 h-4" />
            {
                file.type === 'file' ? <div className="absolute bottom-full right-0 transform -translate-y-1 mb-1 hidden group-hover/metadata:inline-block z-10 min-w-[180px]">
                    <div className="bg-white pt-2 text-left text-xs rounded shadow-lg max-w-xs text-gray-600 border border-gray-200">
                        <p className="px-4 pb-2 text-sm break-all">
                            File type: {file.metadata?.fileType || 'NA'}
                        </p>
                        <p className="px-4 pb-2 text-sm break-all">
                            Sub type: {file.metadata?.subtype || 'NA'}
                        </p>
                        {/* <p className="px-4 pb-2 text-sm break-all capitalize">
                            Author: {file.metadata?.author || 'NA'}
                        </p> */}
                    </div>
                    <div className="absolute top-full right-2 transform -translate-x-1/2 border-4 border-gray-900 border-t-0 border-l-transparent border-r-transparent h-0 w-0 rotate-180 bg-white"></div>
                </div> : ''
            }
        </button>
    </div>
);

export default ActionButtons;