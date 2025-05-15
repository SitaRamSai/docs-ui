import React, { useState, useEffect } from 'react';
import { ArrowLeft, Database, Search, FileText, Filter, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdvancedSearchFileBrowser } from './AdvancedSearchFileBrowser';
import { FilterPanel } from './AdvancedSearchFileBrowser/FilterPanel';
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
    // Track if metadata search has been executed
    const [hasSearchedMetadata, setHasSearchedMetadata] = useState(false);

    // --- Advanced Search Filter/Results State ---
    const [filters, setFilters] = useState<Record<string, string>>({ sourceSystem });
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState<any>({
        query: [],
        count: 10,
        offset: 0,
        projection: ["id", "filename", "contentType", "createdAt", "clientId", "fileType", "sourceSystem"]
    });

    // Handler to trigger search from FilterPanel
    const handleSearch = () => {
        setIsLoading(true);
        setSearchQuery({
            query: Object.entries(filters).map(([key, value]) => {
                let type = key === 'sourceSystem' ? 'matches' : 'like';
                if (key === 'createdAt') type = 'range';
                if (key === 'contentType' || key === 'fileType') type = 'in';
                return { key, type, value };
            }),
            count: 10,
            offset: 0,
            projection: ["id", "filename", "contentType", "createdAt", "clientId", "fileType", "sourceSystem"]
        });
        setHasSearchedMetadata(true);
        // Optionally, you could trigger a loading spinner here
        setTimeout(() => setIsLoading(false), 500); // Simulate async
    };

    // Handler for content search
    const handleContentSearch = () => {
        if (!tempContentSearchQuery.trim()) return; // Don't search if empty
        
        setIsLoading(true);
        setContentSearchQuery(tempContentSearchQuery);
        setHasSearchedContent(true);
        
        // Give the UI time to update before showing results
        setTimeout(() => setIsLoading(false), 500); // Simulate async
    };

    // Reset search state when changing tabs
    useEffect(() => {
        if (activeTab === 'metadata') {
            // Reset content search when switching to metadata tab
            setHasSearchedContent(false);
        }
    }, [activeTab]);
 
    return (
        <div className="min-h-screen bg-gray-50">
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
                    </div>
                </div>
            </div>
 
            {/* Page Content */}
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Dashboard Style Header */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                        <div className="mb-4">
                            <h1 className="text-xl font-bold text-gray-900">Advanced Document Search</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Access documents across all your systems or search for specific content within files.
                            </p>
                        </div>
                        
                        <div className="border-t border-gray-100 pt-4 mt-4">
                            <nav className="flex space-x-8 overflow-x-auto">
                                <button
                                    onClick={() => setActiveTab('metadata')}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                                        activeTab === 'metadata'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <Filter className={`w-4 h-4 mr-2 ${
                                        activeTab === 'metadata' ? 'text-blue-600' : 'text-gray-500'
                                    }`} />
                                    Filter Search
                                </button>
                                <button
                                    onClick={() => setActiveTab('content')}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                                        activeTab === 'content'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <FileText className={`w-4 h-4 mr-2 ${
                                        activeTab === 'content' ? 'text-blue-600' : 'text-gray-500'
                                    }`} />
                                    Content Search
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Content */}
                    {activeTab === 'metadata' && (
  <div className="space-y-6">
    {/* Filters Section */}
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <FilterPanel
        currentFilters={filters}
        onFilterChange={setFilters}
        onSearch={handleSearch}
        isLoading={isLoading}
      />
    </div>
    {/* Results Section */}
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Results</h2>
      {hasSearchedMetadata ? (
        <AdvancedSearchFileBrowser
          initialQuery={searchQuery}
          onFileSelect={(file) => console.log("Selected file:", file)}
          onPageChange={(offset) => console.log("Page changed:", offset)}
          itemsPerPage={10}
          showFilters={false}
          enableMultiSelect={true}
          className="h-[calc(100vh-350px)]"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-center h-[calc(100vh-350px)]">
          <div className="p-4 bg-blue-50 rounded-full mb-4">
            <Search className="w-10 h-10 text-blue-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select filters and click search</h3>
          <p className="text-sm text-gray-500 text-center max-w-md mb-4">
            Use the filters above to narrow down your search criteria and click the Search button.
          </p>
        </div>
      )}
    </div>
  </div>
)}
 
                    {activeTab === 'content' && (
  <div className="space-y-6">
    {/* Content Search Bar Section */}
    <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Content Search</h2>
      <p className="text-sm text-gray-500 mb-4">
        Search for specific text within documents from the selected source system.
      </p>
      <ContentSearchBar
        value={tempContentSearchQuery}
        onChange={setTempContentSearchQuery}
        onSubmit={handleContentSearch}
      />
    </div>
    {/* Results Section */}
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      {hasSearchedContent ? (
        <>
          <div className="border-b border-gray-200 pb-4 mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-full mr-3">
                <Search className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Search Results</h3>
                <p className="text-xs text-gray-500">
                  Showing documents containing "<span className="font-medium">{contentSearchQuery}</span>"
                </p>
              </div>
            </div>
          </div>
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
            className="h-[calc(100vh-350px)]"
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-center h-[calc(100vh-350px)]">
          <div className="p-4 bg-blue-50 rounded-full mb-4">
            <FileText className="w-10 h-10 text-blue-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to search content</h3>
          <p className="text-sm text-gray-500 text-center max-w-md mb-4">
            Enter your search query above to find documents containing specific text.
          </p>
          <div className="flex justify-center">
            <div className="text-xs text-gray-500 flex items-center bg-gray-50 px-3 py-1.5 rounded-full">
              <Clock className="w-3 h-3 mr-1.5 text-gray-400" />
              <span>Current system: </span>
              <span className="ml-1 text-blue-600 font-medium">
                {SOURCE_SYSTEMS.find(s => s.id === sourceSystem)?.name || sourceSystem}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
)}
                </div>
            </div>
        </div>
    );
};
 
export default AdvancedSearchPage;
