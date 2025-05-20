import React, { useState, useEffect } from 'react';
import { ArrowLeft, Database, Search, FileText, Filter, Clock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AdvancedSearchFileBrowser } from './AdvancedSearchFileBrowser';
import { FilterPanel } from './AdvancedSearchFileBrowser/FilterPanel';
import { ContentSearchBar } from './ContentSearchBar';
import { openSearchApi } from '../services/openSearchAPI'
import { apiService } from '../services/api'
import ContentSearchResults from './ContentSearchResults';
import { SourceSystem } from '../types/filterTypes';
 
// Function to parse query parameters
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

interface ConfigResponse {
  Items?: Array<{
    sourceSystem: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}
 
const AdvancedSearchPage: React.FC = () => {
    const navigate = useNavigate();
    const query = useQuery();
    const [activeTab, setActiveTab] = useState<'metadata' | 'content'>('metadata');
    // State for content search bar
    const [contentSearchQuery, setContentSearchQuery] = useState('');
    const [tempContentSearchQuery, setTempContentSearchQuery] = useState('');
    // State for available source systems
    const [availableSourceSystems, setAvailableSourceSystems] = useState<SourceSystem[]>([]);
    // State for selected source system - use URL param if available
    const sourceSystemParam = query.get('sourceSystem');
    const [sourceSystem, setSourceSystem] = useState(sourceSystemParam || '');
    // Track if content search has been executed
    const [hasSearchedContent, setHasSearchedContent] = useState(false);
    // Track if metadata search has been executed
    const [hasSearchedMetadata, setHasSearchedMetadata] = useState(false);
 
    // Content search results state
    const [contentSearchResults, setContentSearchResults] = useState<any[]>([]);
    const [isContentSearchLoading, setIsContentSearchLoading] = useState(false);
    const [contentSearchError, setContentSearchError] = useState<Error | null>(null);
 
    // --- Advanced Search Filter/Results State ---
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState<any>({
        query: [],
        count: 10,
        offset: 0,
        projection: ["id", "filename", "contentType", "createdAt", "clientId", "fileType", "sourceSystem"]
    });
 
    // Fetch available source systems from API
    useEffect(() => {
        const fetchSourceSystems = async () => {
            try {
                const configs: any = await apiService.getSourceSystemConfigs();
                // Handle both array response and response with Items property
                if (configs && Array.isArray(configs)) {
                    const systems = configs.map(config => ({
                        id: config.sourceSystem,
                        name: config.sourceSystem
                    }));
                    setAvailableSourceSystems(systems);
                } else if (configs && configs.Items && Array.isArray(configs.Items)) {
                    const systems = configs.Items.map((config: any) => ({
                        id: config.sourceSystem,
                        name: config.sourceSystem
                    }));
                    setAvailableSourceSystems(systems);
                }
            } catch (error) {
                console.error('Error fetching source systems:', error);
                // Fallback to default systems if API fails
                setAvailableSourceSystems([
                    { id: 'genius', name: 'Genius' },
                    { id: 'dragon', name: 'Dragon' },
                    { id: 'ebao', name: 'eBao' },
                    { id: 'ivos', name: 'IVOS' }
                ]);
            }
        };
        
        fetchSourceSystems();
    }, []);

    // Initialize filters with sourceSystem if provided and trigger search immediately
    useEffect(() => {
        if (sourceSystemParam) {
            // Update filters state
            setFilters(prev => {
                const updatedFilters = { ...prev };
                updatedFilters.sourceSystem = sourceSystemParam;
                return updatedFilters;
            });
            
            // Immediately trigger search with the sourceSystem filter
            setSearchQuery({
                query: [{ key: 'sourceSystem', type: 'matches', value: sourceSystemParam }],
                count: 10,
                offset: 0,
                projection: ["id", "filename", "contentType", "createdAt", "clientId", "fileType", "sourceSystem"]
            });
            
            // Set search as executed
            setHasSearchedMetadata(true);
        }
    }, [sourceSystemParam]);
 
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
    const handleContentSearch = async () => {
        if (!tempContentSearchQuery.trim()) return; // Don't search if empty
        
        setIsContentSearchLoading(true);
        setContentSearchQuery(tempContentSearchQuery);
        setHasSearchedContent(true);
        setContentSearchError(null);
        
        try {
            // Call the content search API
            const results = await openSearchApi.searchContent(tempContentSearchQuery, 5);
            setContentSearchResults(results.results || []);
        } catch (error) {
            console.error('Content search error:', error);
            setContentSearchError(error instanceof Error ? error : new Error('Unknown error occurred'));
            setContentSearchResults([]);
        } finally {
            setIsContentSearchLoading(false);
        }
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
        availableSourceSystems={availableSourceSystems}
      />
    </div>
    
    {/* Results Section */}
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <h2 className="text-xl font-semibold text-gray-900 p-6 border-b border-gray-200">Results</h2>
      {hasSearchedMetadata ? (
        <div className="bg-gray-50">
          <AdvancedSearchFileBrowser
            initialQuery={searchQuery}
            onFileSelect={(file) => console.log("Selected file:", file)}
            onPageChange={(offset) => console.log("Page changed:", offset)}
            itemsPerPage={10}
            showFilters={false}
            enableMultiSelect={true}
            className="min-h-[400px] flex flex-col"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center h-[calc(100vh-350px)] p-6 bg-gray-50">
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
          {contentSearchError ? (
            <div className="bg-red-50 p-4 rounded-md">
              <div className="flex">
                <div className="shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error searching content</h3>
                  <p className="text-sm text-red-700 mt-2">{contentSearchError.message}</p>
                </div>
              </div>
            </div>
          ) : (
            <ContentSearchResults
              results={contentSearchResults}
              query={contentSearchQuery}
              isLoading={isContentSearchLoading}
              onResultSelect={(result) => console.log("Selected content result:", result)}
            />
          )}
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

