import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import useFileStore from '../store/fileStore';

const Breadcrumbs: React.FC = () => {
    const { files, currentFolder, setCurrentFolder } = useFileStore();

    const getBreadcrumbs = () => {
        const breadcrumbs = [];
        let current = files.find(f => f.id === currentFolder);

        while (current) {
            breadcrumbs.unshift(current);
            current = files.find(f => f.id === current?.parentId);
        }

        return breadcrumbs;
    };

    return (
        <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 border-b">
            <button
                onClick={() => setCurrentFolder('root')}
                className="flex items-center text-gray-600 hover:text-blue-600"
            >
                <Home className="w-4 h-4" />
            </button>
            {getBreadcrumbs().map((item, index) => (
                <React.Fragment key={item.id}>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <button
                        onClick={() => setCurrentFolder(item.id)}
                        className={`text-sm ${index === getBreadcrumbs().length - 1
                                ? 'text-gray-800 font-medium'
                                : 'text-gray-600 hover:text-blue-600'
                            }`}
                    >
                        {item.name}
                    </button>
                </React.Fragment>
            ))}
        </div>
    );
};

export default Breadcrumbs;