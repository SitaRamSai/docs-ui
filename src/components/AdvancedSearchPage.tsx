import React, { useState, useEffect } from 'react';
import { ArrowLeft, Database, Search, FileText, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdvancedSearchFileBrowser } from './AdvancedSearchFileBrowser';
import { ContentSearchBar } from './ContentSearchBar';
import { apiService } from '../services/api';
 
// Available source systems
const SOURCE_SYSTEMS = [
    { id: 'genius', name: 'Genius' },
    { id: 'dragon', name: 'Dragon' },
    { id: 'ebao', name: 'eBao' },
    { id: 'ivos', name: 'IVOS' }
];

const AdvancedSearchPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'metadata' | 'content'>('metadata');
    // State for content search bar
    const [contentSearchQuery, setContentSearchQuery] = useState('');
    const [tempContentSearchQuery, setTempContentSearchQuery] = useState('');
    // State for selected source system
    const [sourceSystem, setSourceSystem] = useState('genius');
    // Track if content search has been executed
    const [hasSearchedContent, setHasSearchedContent] = useState(false);
    
    // Debug function to test API directly
    const testDirectApiCall = async () => {
        try {
            console.log("Testing direct API call...");
            const exactPayload = {
                query: [
                    {
                        key: "sourceSystem",
                        type: "matches",
                        value: sourceSystem
                    }
                ],
                count: 2,
                offset: 0,
                projection: [
                    "id",
                    "clientId",
                    "contentType",
                    "filename",
                    "fileType",
                    "sourceSystem",
                    "createdAt"
                ]
            };
            
            const result = await apiService.searchDocuments(exactPayload);
            console.log("Direct API call result:", result);
        } catch (error) {
            console.error("Direct API call error:", error);
        }
    };
    
    // Remove automatic API call on mount
    // useEffect(() => {
    //     testDirectApiCall();
    // }, []);
 
    // Function to handle content search submission
    const handleContentSearch = () => {
        setContentSearchQuery(tempContentSearchQuery);
        setHasSearchedContent(true);
    };
    
    // Reset search state when changing tabs
    useEffect(() => {
        if (activeTab === 'metadata') {
            // Reset content search when switching to metadata tab
            setHasSearchedContent(false);
        }
    }, [activeTab]);
 
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate(-1)}
                                className="mr-4 text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h1 className="text-xl font-semibold text-gray-900">Document Search</h1>
                        </div>
                        
                        {/* Source System Selector */}
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm">
                                <Database size={16} className="mr-2 text-blue-600" />
                                <select
                                    value={sourceSystem}
                                    onChange={(e) => setSourceSystem(e.target.value)}
                                    className="text-sm border-0 focus:ring-0 focus:outline-none bg-transparent font-medium text-gray-700"
                                    aria-label="Select source system"
                                >
                                    {SOURCE_SYSTEMS.map(system => (
                                        <option key={system.id} value={system.id}>{system.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
 
            {/* Page Content */}
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Page header */}
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mb-6">
                        <div className="md:flex md:items-center md:justify-between">
                            <div className="flex-1">
                                <div className="flex items-center">
                                    <div className="p-2.5 rounded-md bg-blue-100 text-blue-600 mr-3">
                                        <Search size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Advanced Document Search</h2>
                                        <p className="mt-1 text-sm text-gray-600">
                                            {activeTab === 'metadata' 
                                                ? 'Filter and find specific documents from the selected source system' 
                                                : 'Search for specific content within document text'}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="mt-4 flex flex-wrap gap-4">
                                    <div className="inline-flex items-center text-xs bg-purple-50 px-3 py-1.5 rounded-md border border-purple-100">
                                        <Database size={14} className="mr-1.5 text-purple-600" />
                                        <span className="text-purple-800">Source:</span>
                                        <span className="font-medium ml-1 text-purple-900">
                                            {SOURCE_SYSTEMS.find(system => system.id === sourceSystem)?.name || sourceSystem}
                                        </span>
                                    </div>
                                    
                                    {activeTab === 'content' && contentSearchQuery && (
                                        <div className="inline-flex items-center text-xs bg-green-50 px-3 py-1.5 rounded-md border border-green-100">
                                            <FileText size={14} className="mr-1.5 text-green-600" />
                                            <span className="text-green-800">Content Query:</span>
                                            <span className="font-medium ml-1 text-green-900">
                                                {contentSearchQuery.length > 30 
                                                    ? `${contentSearchQuery.substring(0, 30)}...` 
                                                    : contentSearchQuery}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="mt-4 md:mt-0 md:ml-4">
                                <button 
                                    onClick={testDirectApiCall}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <Search className="w-4 h-4 mr-2" />
                                    Test API
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Tabs */}
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab('metadata')}
                                className={`whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm flex items-center ${
                                    activeTab === 'metadata'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <div className={`p-1.5 rounded-md mr-2 ${
                                    activeTab === 'metadata' ? 'bg-blue-50' : 'bg-gray-100'
                                }`}>
                                    <Filter className={`w-4 h-4 ${
                                        activeTab === 'metadata' ? 'text-blue-600' : 'text-gray-500'
                                    }`} />
                                </div>
                                Filter Search
                            </button>
                            <button
                                onClick={() => setActiveTab('content')}
                                className={`whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm flex items-center ${
                                    activeTab === 'content'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <div className={`p-1.5 rounded-md mr-2 ${
                                    activeTab === 'content' ? 'bg-blue-50' : 'bg-gray-100'
                                }`}>
                                    <FileText className={`w-4 h-4 ${
                                        activeTab === 'content' ? 'text-blue-600' : 'text-gray-500'
                                    }`} />
                                </div>
                                Content Search
                            </button>
                        </nav>
                    </div>
 
                    {/* Content */}
                    <div className="mt-4">
                        {activeTab === 'metadata' && (
                            <div>
                                <AdvancedSearchFileBrowser
                                    initialQuery={{
                                        query: [
                                            {
                                                key: "sourceSystem",
                                                type: "matches",
                                                value: sourceSystem
                                            }
                                        ],
                                        count: 10,
                                        offset: 0,
                                        projection: ["id", "filename", "contentType", "createdAt", "clientId", "fileType", "sourceSystem"]
                                    }}
                                    onFileSelect={(file) => console.log("Selected file:", file)}
                                    onPageChange={(offset) => console.log("Page changed:", offset)}
                                    itemsPerPage={10}
                                    showFilters={true}
                                    enableMultiSelect={true}
                                    className="h-[calc(100vh-240px)]"
                                />
                            </div>
                        )}
 
                        {activeTab === 'content' && (
                            <div className="space-y-4">
                                <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
                                    <ContentSearchBar
                                        value={tempContentSearchQuery}
                                        onChange={setTempContentSearchQuery}
                                        onSubmit={handleContentSearch}
                                    />
                                </div>
                                
                                {hasSearchedContent ? (
                                    <div>
                                        <AdvancedSearchFileBrowser
                                            initialQuery={{
                                                query: [
                                                    {
                                                        key: "sourceSystem",
                                                        type: "matches",
                                                        value: sourceSystem
                                                    },
                                                    ...(contentSearchQuery ? [{ key: "content", type: "matches", value: contentSearchQuery }] : []),
                                                ],
                                                count: 10,
                                                offset: 0,
                                                projection: ["id", "filename", "contentType", "createdAt", "clientId", "fileType", "sourceSystem"]
                                            }}
                                            onFileSelect={file => console.log("Selected file:", file)}
                                            onPageChange={offset => console.log("Page changed:", offset)}
                                            itemsPerPage={10}
                                            showFilters={false}
                                            enableMultiSelect={true}
                                            className="h-[calc(100vh-300px)]"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center p-10 border border-gray-200 rounded-lg bg-white shadow-sm h-[calc(100vh-300px)]">
                                        <div className="p-4 bg-gray-50 rounded-full mb-4">
                                            <FileText className="w-10 h-10 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Enter your content search</h3>
                                        <p className="text-sm text-gray-500 text-center max-w-md">
                                            Type what you're looking for in the search bar above and click "Search" to find documents containing that text.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
 
export default AdvancedSearchPage;
