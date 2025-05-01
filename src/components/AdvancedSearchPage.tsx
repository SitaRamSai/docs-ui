import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdvancedSearchFileBrowser } from './AdvancedSearchFileBrowser';

const AdvancedSearchPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'metadata' | 'content'>('metadata');

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
                            <h1 className="text-xl font-semibold text-gray-900">Search</h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('metadata')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'metadata'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Metadata Search
                        </button>
                        <button
                            onClick={() => setActiveTab('content')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'content'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Content Search
                        </button>
                    </nav>
                </div>

                <div>
                    {activeTab === 'metadata' && (
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
                            className="min-h-[calc(100vh-16rem)]"
                        />
                    )}

                    {activeTab === 'content' && (
                        <div className="p-6 bg-white rounded-lg border border-gray-200 min-h-[calc(100vh-16rem)]">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Content Search</h2>
                            <p className="text-gray-600">Content search functionality will be implemented here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdvancedSearchPage;