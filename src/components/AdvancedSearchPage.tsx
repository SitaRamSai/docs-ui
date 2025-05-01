import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdvancedSearchFileBrowser } from './AdvancedSearchFileBrowser';

const AdvancedSearchPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate(-1)}
                                className="mr-4 text-gray-500 hover:text-gray-700"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h1 className="text-xl font-semibold text-gray-900">Advanced Search</h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <AdvancedSearchFileBrowser
                    initialQuery={{
                        query: [
                            {
                                key: "sourceSystem",
                                type: "matches",
                                value: "dragon"
                            }
                        ],
                        count: 10,
                        offset: 0,
                        projection: ["id", "filename", "contentType", "createdAt"]
                    }}
                    onFileSelect={(file) => console.log("Selected file:", file)}
                    onPageChange={(offset) => console.log("Page changed:", offset)}
                    itemsPerPage={10}
                    showFilters={true}
                    enableMultiSelect={true}
                    className="min-h-[calc(100vh-12rem)]"
                />
            </div>
        </div>
    );
};

export default AdvancedSearchPage;