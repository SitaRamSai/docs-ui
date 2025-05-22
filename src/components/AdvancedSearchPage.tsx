import React, { useState, useEffect } from 'react';
import { ArrowLeft, Database, Search, FileText, Filter, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdvancedSearchFileBrowser } from './AdvancedSearchFileBrowser';
// import { FilterPanel } from './AdvancedSearchFileBrowser/FilterPanel'; // Original sidebar filter panel, no longer used.
import { IntegratedFilterUI } from './IntegratedFilterUI'; // New integrated filter UI component.
import { ContentSearchBar } from './ContentSearchBar';
import { apiService } from '../services/api';
import ContentSearchResults from './ContentSearchResults';

// Available source systems - Note: This constant is defined here but might be better placed in a shared config if used elsewhere.
const SOURCE_SYSTEMS = [
    { id: 'genius', name: 'Genius' },
    { id: 'dragon', name: 'Dragon' },
    { id: 'ebao', name: 'eBao' },
    { id: 'ivos', name: 'IVOS' }
];

/**
 * AdvancedSearchPage serves as the main UI for performing both metadata-based and content-based document searches.
 * It manages the overall layout, tab switching between search modes, and orchestrates state between
 * the filter input components and the results display components.
 */
const AdvancedSearchPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'metadata' | 'content'>('metadata'); // Manages active tab: 'metadata' or 'content' search

    // State variables for the 'content' search tab
    const [contentSearchQuery, setContentSearchQuery] = useState(''); // The current executed content search query
    const [tempContentSearchQuery, setTempContentSearchQuery] = useState(''); // Temporary state for content search input
    const [hasSearchedContent, setHasSearchedContent] = useState(false); // Tracks if a content search has been performed
    const [contentSearchResults, setContentSearchResults] = useState<any[]>([]); // Stores results from content search
    const [isContentSearchLoading, setIsContentSearchLoading] = useState(false); // Loading state for content search
    const [contentSearchError, setContentSearchError] = useState<Error | null>(null); // Error state for content search

    // State variables for the 'metadata' (filter-based) search tab
    const [sourceSystem, setSourceSystem] = useState('genius'); // Default source system, also used as an initial filter.
    /**
     * `filters`: Stores the current filter criteria for metadata search.
     * It's an object where keys are filter field names (e.g., 'filename', 'contentType')
     * and values are the corresponding filter values.
     * This state is primarily managed by the `IntegratedFilterUI` component, which calls the
     * `setFilters` function (passed as `onFilterChange`) to update this state.
     */
    const [filters, setFilters] = useState<Record<string, any>>({ sourceSystem }); 
    const [isLoading, setIsLoading] = useState(false); // Loading state for metadata search, passed to `IntegratedFilterUI` and affects `AdvancedSearchFileBrowser`.
    const [hasSearchedMetadata, setHasSearchedMetadata] = useState(false); // Tracks if a metadata search has been performed, to determine if results or placeholder are shown.
    /**
     * `searchQuery`: Stores the fully formed query object to be passed to `AdvancedSearchFileBrowser`.
     * This is constructed in `handleSearch` based on the `filters` state.
     * The structure is { query: [], count: number, offset: number, projection: string[] }.
     */
    const [searchQuery, setSearchQuery] = useState<any>({
        query: [], // Array of filter conditions for the API
        count: 10, // Default items per page
        offset: 0, // Default offset
        projection: ["id", "filename", "contentType", "createdAt", "clientId", "fileType", "sourceSystem"] // Default fields to retrieve
    });

    /**
     * Handles the metadata search action.
     * This function is triggered by the `IntegratedFilterUI` component (via its `onSearch` prop).
     * It constructs the `searchQuery` object from the current `filters` state and sets flags to initiate the search display.
     */
    const handleSearch = () => {
        setIsLoading(true); // Set loading state for UI feedback during search.
        // Transform the `filters` object (e.g., { filename: "report" }) into the array format required by the API.
        // The `type` for each filter needs to be determined based on the filter key or configuration.
        setSearchQuery({
            query: Object.entries(filters).map(([key, value]) => {
                // Determine query type based on key - this logic might need to be more robust or config-driven.
                let type = key === 'sourceSystem' ? 'matches' : 'like';
                if (key === 'createdAt') type = 'range'; // Example: 'createdAt' uses a range query.
                if (key === 'contentType' || key === 'fileType') type = 'in'; // Example: 'contentType' and 'fileType' use an 'in' query.
                return { key, type, value };
            }),
            count: 10, // Reset or maintain pagination settings
            offset: 0,
            projection: ["id", "filename", "contentType", "createdAt", "clientId", "fileType", "sourceSystem"] // Specify desired fields
        });
        setHasSearchedMetadata(true); // Mark that a metadata search has been initiated, to show results area.
        // Simulate API call latency for demonstration; in a real app, this would be part of an async API call.
        setTimeout(() => setIsLoading(false), 500); 
    };

    /**
     * Handles the content search action.
     * Triggered by submitting the `ContentSearchBar`.
     * Fetches results based on `tempContentSearchQuery`.
     */
    const handleContentSearch = async () => {
        if (!tempContentSearchQuery.trim()) return; // Prevent search if query is empty or only whitespace.
        
        setIsContentSearchLoading(true); // Set loading state for content search.
        setContentSearchQuery(tempContentSearchQuery); // Finalize the query to be used for the search.
        setHasSearchedContent(true); // Mark that a content search has been initiated.
        setContentSearchError(null); // Clear any previous errors.
        
        try {
            // Perform the API call to search content.
            const results = await apiService.searchContent(tempContentSearchQuery, 5); // Example limit of 5 results.
            setContentSearchResults(results.results || []); // Update results, ensuring it's an array even if API returns null/undefined.
        } catch (error) {
            console.error('Content search error:', error); // Log the error for debugging.
            setContentSearchError(error instanceof Error ? error : new Error('Unknown error occurred')); // Set error state for UI display.
            setContentSearchResults([]); // Clear results on error.
        } finally {
            setIsContentSearchLoading(false); // Reset loading state regardless of outcome.
        }
    };

    /**
     * Effect hook to manage state when switching tabs.
     * Specifically, it resets the content search status (`hasSearchedContent`) when switching 
     * from the 'content' tab back to the 'metadata' tab.
     */
    useEffect(() => {
        if (activeTab === 'metadata') {
            // When switching to the 'metadata' tab, clear the 'content' search performed flag.
            // This ensures the 'content' search results or placeholder are not inadvertently shown or considered active.
            setHasSearchedContent(false);
        }
        // No specific cleanup needed for 'content' tab when switching away from 'metadata'.
    }, [activeTab]); // Dependency: re-run this effect when activeTab changes.
 
    return (
        <div className="min-h-screen bg-gray-50"> {/* Main page container with a light gray background */}
            {/* Sticky Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate(-1)} // Navigate to the previous page in history.
                                className="mr-4 text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
                                aria-label="Go back"
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
                    {/* Dashboard Style Header: Provides page title and tab navigation. */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                        <div className="mb-4">
                            <h1 className="text-xl font-bold text-gray-900">Advanced Document Search</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Access documents across all your systems or search for specific content within files.
                            </p>
                        </div>
                        
                        <div className="border-t border-gray-100 pt-4 mt-4">
                            <nav className="flex space-x-8 overflow-x-auto"> {/* `overflow-x-auto` for responsiveness on small screens. */}
                                <button
                                    onClick={() => setActiveTab('metadata')}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                                        activeTab === 'metadata'
                                            ? 'border-blue-500 text-blue-600' // Active tab styling
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' // Inactive tab styling
                                    }`}
                                >
                                    <Filter className={`w-4 h-4 mr-2 ${activeTab === 'metadata' ? 'text-blue-600' : 'text-gray-500'}`} />
                                    Filter Search
                                </button>
                                <button
                                    onClick={() => setActiveTab('content')}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                                        activeTab === 'content'
                                            ? 'border-blue-500 text-blue-600' // Active tab styling
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' // Inactive tab styling
                                    }`}
                                >
                                    <FileText className={`w-4 h-4 mr-2 ${activeTab === 'content' ? 'text-blue-600' : 'text-gray-500'}`} />
                                    Content Search
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content Area: Switches between Metadata Search and Content Search UIs */}
                    {activeTab === 'metadata' && (
  <div className="space-y-6"> {/* Vertical spacing for children elements within the metadata tab content. */}
    {/* 
      New Filter UI Integration:
      The `<IntegratedFilterUI />` component is used here for the 'metadata' search tab.
      It encapsulates all filter selection logic (buttons, popovers for input, display of applied filter pills).
      This replaces the previous sidebar-style `FilterPanel`.
    */}
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm"> {/* Wrapper for card-like appearance, padding is handled by IntegratedFilterUI. */}
        <IntegratedFilterUI
            // `currentFilters`: Passes the current filter state (`filters`) from this page to the UI component.
            // This allows `IntegratedFilterUI` to display the currently applied filters.
            currentFilters={filters}
            // `onFilterChange`: This is the `setFilters` function from `AdvancedSearchPage`. 
            // `IntegratedFilterUI` calls this function whenever filters are added, modified, or cleared,
            // thus updating the `filters` state in this parent component. This is a key part of how
            // filter logic is encapsulated in `IntegratedFilterUI` while state is owned by the page.
            onFilterChange={setFilters}
            // `onSearch`: This is the `handleSearch` function from `AdvancedSearchPage`.
            // `IntegratedFilterUI` calls this function when its main search button is clicked.
            onSearch={handleSearch}
            // `isLoading`: Propagates the loading state to `IntegratedFilterUI`, which can use it
            // to disable its search button or show loading indicators during a search operation.
            isLoading={isLoading}
        />
    </div>
    
    {/* Results Section for Metadata Search */}
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6"> {/* Card-like wrapper for results display. */}
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Results</h2>
      {/* Conditional rendering: Show file browser if a search has been made, otherwise show a placeholder message. */}
      {hasSearchedMetadata ? (
        <AdvancedSearchFileBrowser
          initialQuery={searchQuery} // The query constructed from applied filters by `handleSearch`.
          onFileSelect={(file) => console.log("Selected file:", file)} // Placeholder for file selection handling.
          onPageChange={(offset) => console.log("Page changed:", offset)} // Placeholder for pagination handling.
          itemsPerPage={10}
          // `showFilters` is explicitly set to `false` for `AdvancedSearchFileBrowser`.
          // This is because filter selection and display are now entirely handled by the 
          // `IntegratedFilterUI` component, making internal filter mechanisms in `AdvancedSearchFileBrowser` redundant.
          showFilters={false} 
          enableMultiSelect={true}
          // `className` for height adjustment:
          // The height `h-[calc(100vh-420px)]` is set to allocate appropriate vertical space for the file browser.
          // This value (420px subtracted from viewport height) was determined after refactoring the filter UI
          // to be horizontal above the results. It accounts for the height of the header, tabs, 
          // the `IntegratedFilterUI` component itself (which can vary slightly based on applied pills), and paddings,
          // aiming to provide a reasonable viewing area for the search results.
          className="h-[calc(100vh-420px)]" 
        />
      ) : (
        // Placeholder display when no metadata search has been performed yet.
        // The height is matched with `AdvancedSearchFileBrowser` for visual consistency.
        <div className="flex flex-col items-center justify-center text-center h-[calc(100vh-420px)]">
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
 
                    {/* Content Search Tab UI */}
                    {activeTab === 'content' && (
  <div className="space-y-6"> {/* Vertical spacing for children elements within the content tab. */}
    {/* Content Search Input Section */}
    <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm"> {/* Card-like wrapper. */}
      <h2 className="text-lg font-medium text-gray-900 mb-4">Content Search</h2>
      <p className="text-sm text-gray-500 mb-4">
        Search for specific text within documents from the selected source system.
      </p>
      <ContentSearchBar
        value={tempContentSearchQuery} // Controlled input: current value of the search bar.
        onChange={setTempContentSearchQuery} // Updates the temporary query state as the user types.
        onSubmit={handleContentSearch} // Triggers search when the form is submitted.
      />
    </div>
    {/* Results Section for Content Search */}
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6"> {/* Card-like wrapper. */}
      {/* Conditional rendering: Show results/error if search performed, otherwise show placeholder. */}
      {hasSearchedContent ? (
        <>
          {contentSearchError ? (
            // Error Display Area if content search fails.
            <div className="bg-red-50 p-4 rounded-md">
              <div className="flex">
                <div className="shrink-0">
                  {/* Error Icon */}
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
            // Content Search Results Display if search is successful.
            <ContentSearchResults
              results={contentSearchResults} // Pass search results to the display component.
              query={contentSearchQuery} // Pass the executed query for context (e.g., highlighting terms).
              isLoading={isContentSearchLoading} // Pass loading state for potential UI indicators in results.
              onResultSelect={(result) => console.log("Selected content result:", result)} // Placeholder for result selection.
            />
          )}
        </>
      ) : (
        // Placeholder display when no content search has been performed yet.
        // Note: The height h-[calc(100vh-350px)] for this placeholder was not adjusted in previous steps,
        // unlike the metadata results placeholder. This might be an oversight if consistent heights are desired
        // when no search has been performed on either tab. For now, it remains as is.
        <div className="flex flex-col items-center justify-center text-center h-[calc(100vh-350px)]">
          <div className="p-4 bg-blue-50 rounded-full mb-4">
            <FileText className="w-10 h-10 text-blue-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to search content</h3>
          <p className="text-sm text-gray-500 text-center max-w-md mb-4">
            Enter your search query above to find documents containing specific text.
          </p>
          <div className="flex justify-center">
            {/* Placeholder for potential additional info or actions. */}
            <div className="text-xs text-gray-500 flex items-center bg-gray-50 px-3 py-1.5 rounded-full">
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
