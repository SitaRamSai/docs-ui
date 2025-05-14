import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  FileText, 
  Database, 
  Calendar, 
  Tag, 
  User, 
  X, 
  ChevronDown, 
  ChevronRight,
  Layers,
  Clock,
  Bookmark,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  Plus,
  LayoutGrid,
  List,
  Lightbulb,
  Info,
  History,
  RefreshCw
} from 'lucide-react';

/**
 * SearchUIRedesign Component - A mockup of the redesigned search interface
 * 
 * This component demonstrates the revised search experience with:
 * - Unified search entry point
 * - Three distinct search modes (Basic, Advanced, Content)
 * - Progressive disclosure of options
 * - Clear visual hierarchy
 * - Responsive design considerations
 */
export const SearchUIRedesign: React.FC = () => {
  // Search state
  type SearchMode = 'filters' | 'content';
  const [activeMode, setActiveMode] = useState<SearchMode>('filters');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  
  // Filter states
  const [appliedFilters, setAppliedFilters] = useState<{
    sourceSystem?: string;
    fileType?: string[];
    dateRange?: string;
    clientId?: string;
    tags?: string[];
  }>({
    sourceSystem: 'Dragon',
    fileType: ['PDF'],
    dateRange: 'Last 7 days'
  });
  
  // Content search options
  const [contentSearchOptions, setContentSearchOptions] = useState({
    exactPhrase: true,
    caseSensitive: false,
    regex: false,
    includeMetadata: true
  });
  
  // Mock filter options for UI display
  const sourceSystemOptions = ['Genius', 'Dragon', 'eBao', 'IVOS'];
  const fileTypeOptions = ['PDF', 'Word', 'Excel', 'Image', 'Text'];
  const dateRangeOptions = ['Today', 'Yesterday', 'Last 7 days', 'Last 30 days', 'Last 90 days', 'Custom range'];
  
  // Add animation states
  const [isChangingMode, setIsChangingMode] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<'right' | 'left'>('right');
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  // Add result grouping options to state
  const [resultGrouping, setResultGrouping] = useState<'none' | 'date' | 'type' | 'source'>('none');
  
  // Add smart filter suggestions to state
  const [showSmartSuggestions, setShowSmartSuggestions] = useState(true);
  
  // Smart filter suggestions
  const smartFilterSuggestions = [
    {
      id: 'recent',
      name: 'Recent Documents',
      description: 'Documents from the last 7 days',
      icon: Clock,
      color: 'bg-blue-50 text-blue-700 border-blue-100',
      filters: {
        dateRange: 'Last 7 days'
      }
    },
    {
      id: 'quarterly-reports',
      name: 'Quarterly Reports',
      description: 'PDF documents containing "quarterly"',
      icon: FileText,
      color: 'bg-purple-50 text-purple-700 border-purple-100',
      filters: {
        fileType: ['PDF'],
        tags: ['Confidential']
      }
    },
    {
      id: 'dragon-files',
      name: 'Dragon Files',
      description: 'All files from Dragon source system',
      icon: Database,
      color: 'bg-green-50 text-green-700 border-green-100',
      filters: {
        sourceSystem: 'Dragon'
      }
    }
  ];
  
  // Add filter category state - initializing all categories collapsed
  const [expandedFilterCategories, setExpandedFilterCategories] = useState<{
    sources: boolean;
    documents: boolean;
    date: boolean;
    client: boolean;
    other: boolean;
  }>({
    sources: false,
    documents: false,
    date: false,
    client: false,
    other: false,
  });

  // Add active filter tab state
  const [activeFilterTab, setActiveFilterTab] = useState<'sources' | 'documents' | 'date' | 'client'>('sources');
  
  // Toggle filter category expansion
  const toggleFilterCategory = (category: keyof typeof expandedFilterCategories) => {
    setExpandedFilterCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  // Animate mode changes
  const animatedChangeSearchMode = (mode: SearchMode) => {
    if (mode === activeMode) return;
    
    // Determine animation direction
    if (
      (activeMode === 'filters' && mode === 'content')
    ) {
      setAnimationDirection('right');
    } else {
      setAnimationDirection('left');
    }
    
    // Start animation sequence
    setIsChangingMode(true);
    
    // Change mode after short delay
    setTimeout(() => {
      setActiveMode(mode);
      
      // End animation
      setTimeout(() => {
        setIsChangingMode(false);
      }, 50);
    }, 200);
  };
  
  // Update the existing changeSearchMode to use animation
  const changeSearchMode = animatedChangeSearchMode;
  
  // Add click-outside behavior for filter panels
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const [isFilterPanelExpanded, setIsFilterPanelExpanded] = useState(false);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target as Node)) {
        setIsFilterPanelExpanded(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Add keyboard shortcut handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+1, Alt+2, Alt+3 for search modes
      if (e.altKey) {
        if (e.key === '1') {
          changeSearchMode('filters');
        } else if (e.key === '2') {
          changeSearchMode('content');
        }
      }
      
      // Escape to clear input
      if (e.key === 'Escape') {
        if (activeMode === 'content') {
          setSearchQuery('');
        } else {
          setAppliedFilters({});
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeMode]);

  // Add CSS classes for animations
  const searchAnimationClass = isChangingMode 
    ? `opacity-0 transform ${animationDirection === 'right' ? 'translate-x-10' : '-translate-x-10'}` 
    : 'opacity-100 transform translate-x-0';
  
  // Modify the handleSearch function to use only filters
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching with:', {
      mode: activeMode,
      query: activeMode === 'content' ? searchQuery : '',
      filters: appliedFilters,
      contentOptions: activeMode === 'content' ? contentSearchOptions : undefined
    });
    // In a real implementation, this would trigger the search API call
  };
  
  // Add or update a filter
  const applyFilter = (key: keyof typeof appliedFilters, value: any) => {
    setAppliedFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Remove a filter
  const removeFilter = (key: keyof typeof appliedFilters) => {
    setAppliedFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };
  
  // Update the renderCompactFilterPills function to show label=value format
  const renderCompactFilterPills = () => {
    return (
      <>
        {Object.entries(appliedFilters).map(([key, value]) => {
          if (!value || (Array.isArray(value) && value.length === 0)) return null;
          
          let icon;
          let label;
          let color;
          
          switch(key) {
            case 'sourceSystem':
              icon = <Database size={12} />;
              label = 'Source';
              color = 'bg-blue-50 text-blue-800 border-blue-100';
              break;
            case 'fileType':
              icon = <FileText size={12} />;
              label = 'Type';
              color = 'bg-purple-50 text-purple-800 border-purple-100';
              break;
            case 'dateRange':
              icon = <Calendar size={12} />;
              label = 'Date';
              color = 'bg-amber-50 text-amber-800 border-amber-100';
              break;
            case 'clientId':
              icon = <User size={12} />;
              label = 'Client';
              color = 'bg-green-50 text-green-800 border-green-100';
              break;
            case 'tags':
              icon = <Tag size={12} />;
              label = 'Tags';
              color = 'bg-rose-50 text-rose-800 border-rose-100';
              break;
            default:
              icon = <Filter size={12} />;
              label = key;
              color = 'bg-gray-50 text-gray-800 border-gray-100';
          }
          
          const displayValue = Array.isArray(value) ? value.join(', ') : value;
          
          return (
            <div key={key} className={`inline-flex items-center text-xs px-2 py-1 rounded-full border ${color}`}>
              <span className="mr-1">{icon}</span>
              <span className="font-medium">{label}={displayValue}</span>
              <button 
                onClick={() => removeFilter(key as keyof typeof appliedFilters)} 
                className="ml-1 hover:text-gray-800 transition-all duration-200"
                aria-label={`Remove ${label} filter`}
              >
                <X size={10} />
              </button>
            </div>
          );
        })}
      </>
    );
  };
  
  // Update the renderFilterPanel function to be much more compact with a tabbed interface
  const renderFilterPanel = () => {
    return (
      <div className="border-t border-gray-200 py-4">
        {/* Applied filters row - Now only shown here once */}
        <div className="px-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Filter size={16} className="text-gray-500 mr-2" />
              <h3 className="font-medium text-gray-700">Define Your Search</h3>
            </div>
            <div className="flex gap-2">
              {Object.keys(appliedFilters).some(key => !!appliedFilters[key as keyof typeof appliedFilters]) && (
                <button 
                  onClick={() => setAppliedFilters({})}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                  <X size={14} className="mr-1" />
                  Clear
                </button>
              )}
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-md hover:bg-brand-700 transition-all duration-200"
              >
                Search
              </button>
            </div>
          </div>
        </div>
        
        <div className="px-4 pb-2">
          <span className="text-sm text-gray-500">Applied:</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(appliedFilters).map(([key, value]) => {
              if (!value || (Array.isArray(value) && value.length === 0)) return null;
              
              let icon;
              let label;
              
              switch(key) {
                case 'sourceSystem':
                  icon = <Database size={14} />;
                  label = 'Source';
                  break;
                case 'fileType':
                  icon = <FileText size={14} />;
                  label = 'Type';
                  break;
                case 'dateRange':
                  icon = <Calendar size={14} />;
                  label = 'Date';
                  break;
                default:
                  icon = <Filter size={14} />;
                  label = key;
              }
              
              const displayValue = Array.isArray(value) ? value.join(', ') : value;
              
              return (
                <div key={key} className={`inline-flex items-center text-sm px-2 py-1 rounded-full bg-gray-100 text-gray-700`}>
                  <span className="mr-1.5">{icon}</span>
                  <span className="font-medium">{label}={displayValue}</span>
                  <button 
                    onClick={() => removeFilter(key as keyof typeof appliedFilters)} 
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Tab navigation - simplified to match screenshot */}
        <div className="border-t border-gray-200 pt-4 px-4">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveFilterTab('sources')}
              className={`pb-2 mr-6 text-sm border-b-2 ${
                activeFilterTab === 'sources' ? 'border-brand-500 text-brand-600 font-medium' : 'border-transparent text-gray-500'
              } flex items-center`}
            >
              <Database size={14} className="mr-2" />
              Source System
            </button>
            <button
              onClick={() => setActiveFilterTab('documents')}
              className={`pb-2 mr-6 text-sm border-b-2 ${
                activeFilterTab === 'documents' ? 'border-brand-500 text-brand-600 font-medium' : 'border-transparent text-gray-500'
              } flex items-center`}
            >
              <FileText size={14} className="mr-2" />
              Types
            </button>
            <button
              onClick={() => setActiveFilterTab('date')}
              className={`pb-2 mr-6 text-sm border-b-2 ${
                activeFilterTab === 'date' ? 'border-brand-500 text-brand-600 font-medium' : 'border-transparent text-gray-500'
              } flex items-center`}
            >
              <Calendar size={14} className="mr-2" />
              Date
            </button>
            <button
              onClick={() => setActiveFilterTab('client')}
              className={`pb-2 text-sm border-b-2 ${
                activeFilterTab === 'client' ? 'border-brand-500 text-brand-600 font-medium' : 'border-transparent text-gray-500'
              } flex items-center`}
            >
              <User size={14} className="mr-2" />
              Client
            </button>
          </div>
        </div>
        
        {/* Tab content - simplified to match screenshot */}
        <div className="p-4">
          {/* Document Types Tab Content - shown as an example */}
          {activeFilterTab === 'documents' && (
            <div className="flex flex-wrap gap-2">
              {fileTypeOptions.map(option => (
                <button
                  key={option}
                  onClick={() => {
                    const currentTypes = appliedFilters.fileType ? 
                      (typeof appliedFilters.fileType === 'string' ? [appliedFilters.fileType] : [...appliedFilters.fileType as string[]]) : 
                      [];
                    
                    if (currentTypes.includes(option)) {
                      const newTypes = currentTypes.filter(t => t !== option);
                      if (newTypes.length === 0) {
                        removeFilter('fileType');
                      } else {
                        applyFilter('fileType', newTypes);
                      }
                    } else {
                      applyFilter('fileType', [...currentTypes, option]);
                    }
                  }}
                  className={`px-4 py-2 text-sm rounded-full ${
                    appliedFilters.fileType && 
                    (typeof appliedFilters.fileType === 'string' ? 
                      appliedFilters.fileType === option : 
                      (appliedFilters.fileType as string[]).includes(option))
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
          
          {/* Client tab content */}
          {activeFilterTab === 'client' && (
            <div className="space-y-4">
              <div className="flex flex-col space-y-3">
                <div>
                  <label className="text-sm text-gray-700 mb-1 block">Client ID</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter client ID"
                      value={appliedFilters.clientId || ''}
                      onChange={(e) => applyFilter('clientId', e.target.value)}
                      className="flex-grow text-sm p-2 border border-gray-300 rounded-lg"
                    />
                    <button
                      onClick={() => {
                        if (appliedFilters.clientId) {
                          removeFilter('clientId');
                        }
                      }}
                      className={`px-3 py-1 text-sm rounded-md ${
                        appliedFilters.clientId ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Clear
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-700 mb-1 block">Client Tags</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {['VIP', 'Corporate', 'Individual', 'Government', 'Contract'].map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          const currentTags = appliedFilters.tags || [];
                          if (currentTags.includes(tag)) {
                            applyFilter('tags', currentTags.filter(t => t !== tag));
                          } else {
                            applyFilter('tags', [...currentTags, tag]);
                          }
                        }}
                        className={`px-4 py-2 text-sm rounded-full transition-colors ${
                          appliedFilters.tags?.includes(tag)
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Show smart suggestions button */}
          <div className="mt-6 text-center">
            <button 
              onClick={() => setShowSmartSuggestions(!showSmartSuggestions)}
              className="inline-flex items-center text-sm text-brand-600 hover:text-brand-800"
            >
              <Lightbulb size={14} className="mr-1.5 text-amber-500" />
              {showSmartSuggestions ? 'Hide Smart Suggestions' : 'Show Smart Suggestions'}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Render content search options
  const renderContentSearchOptions = () => {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 mb-5 border border-gray-200">
        <h3 className="font-semibold text-gray-800 flex items-center mb-4">
          <SlidersHorizontal size={16} className="mr-2 text-brand-500" />
          Search Options
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Content search options checkboxes */}
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                id="exactPhrase"
                type="checkbox"
                checked={contentSearchOptions.exactPhrase}
                onChange={() => setContentSearchOptions(prev => ({ ...prev, exactPhrase: !prev.exactPhrase }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="exactPhrase" className="ml-2 block text-sm text-gray-700">
                Match exact phrase
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="caseSensitive"
                type="checkbox"
                checked={contentSearchOptions.caseSensitive}
                onChange={() => setContentSearchOptions(prev => ({ ...prev, caseSensitive: !prev.caseSensitive }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="caseSensitive" className="ml-2 block text-sm text-gray-700">
                Case sensitive
              </label>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                id="regex"
                type="checkbox"
                checked={contentSearchOptions.regex}
                onChange={() => setContentSearchOptions(prev => ({ ...prev, regex: !prev.regex }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="regex" className="ml-2 block text-sm text-gray-700">
                Regex search
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="includeMetadata"
                type="checkbox"
                checked={contentSearchOptions.includeMetadata}
                onChange={() => setContentSearchOptions(prev => ({ ...prev, includeMetadata: !prev.includeMetadata }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="includeMetadata" className="ml-2 block text-sm text-gray-700">
                Include document metadata
              </label>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Narrow Content Search By:</h4>
          {renderCompactFilterPills()}
        </div>
      </div>
    );
  };
  
  // Enhance the mock search results with more data
  const getMockSearchResults = () => {
    return [
      {
        id: '1',
        name: 'Quarterly Report Q1 2023.pdf',
        type: 'PDF',
        size: '2.4 MB',
        date: 'April 12, 2023',
        dateTimestamp: new Date('2023-04-12').getTime(),
        source: 'Dragon',
        snippet: 'Financial projections show a 15% increase in Q2 compared to previous forecasts. Revenue streams from new product lines are exceeding expectations.',
        isHighlighted: true,
        relevanceScore: 98
      },
      {
        id: '2',
        name: 'Financial Statement Jan 2023.xlsx',
        type: 'Excel',
        size: '1.8 MB',
        date: 'Feb 3, 2023',
        dateTimestamp: new Date('2023-02-03').getTime(),
        source: 'Genius',
        snippet: 'Balance sheet totals reconciled with Q4 report figures. Cash flow statements indicate positive growth trends in primary business segments.',
        isHighlighted: false,
        relevanceScore: 92
      },
      {
        id: '3',
        name: 'Client Meeting Notes.docx',
        type: 'Word',
        size: '420 KB',
        date: 'March 18, 2023',
        dateTimestamp: new Date('2023-03-18').getTime(),
        source: 'eBao',
        snippet: 'Client requested additional documentation for claims process. Follow-up meeting scheduled for next month to review implementation progress.',
        isHighlighted: false,
        relevanceScore: 85
      },
      {
        id: '4',
        name: 'Product Roadmap 2023.pptx',
        type: 'PowerPoint',
        size: '5.7 MB',
        date: 'Jan 15, 2023',
        dateTimestamp: new Date('2023-01-15').getTime(),
        source: 'Dragon',
        snippet: 'Q3 goals include expansion into European markets. New feature development timeline adjusted to accommodate regulatory requirements.',
        isHighlighted: false,
        relevanceScore: 80
      },
      {
        id: '5',
        name: 'Compliance Report.pdf',
        type: 'PDF',
        size: '1.2 MB',
        date: 'April 5, 2023',
        dateTimestamp: new Date('2023-04-05').getTime(),
        source: 'IVOS',
        snippet: 'All departments have completed required training modules. Security protocols have been updated to reflect latest industry standards.',
        isHighlighted: false,
        relevanceScore: 78
      },
      {
        id: '6',
        name: 'Marketing Campaign Results.xlsx',
        type: 'Excel',
        size: '3.1 MB',
        date: 'March 30, 2023',
        dateTimestamp: new Date('2023-03-30').getTime(),
        source: 'Genius',
        snippet: 'Q1 campaign exceeded conversion targets by 23%. Social media engagement metrics show significant improvement over previous quarter.',
        isHighlighted: true,
        relevanceScore: 95
      }
    ];
  };

  // Update the renderSearchResults function
  const renderSearchResults = () => {
    const results = getMockSearchResults();
    
    // Group results if grouping is enabled
    const getGroupedResults = () => {
      if (resultGrouping === 'none') {
        return { 'All Results': results };
      }
      
      return results.reduce((groups: Record<string, typeof results>, result) => {
        let groupKey = '';
        
        if (resultGrouping === 'date') {
          // Group by month/year
          const date = new Date(result.dateTimestamp);
          groupKey = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
        } else if (resultGrouping === 'type') {
          groupKey = result.type;
        } else if (resultGrouping === 'source') {
          groupKey = result.source;
        }
        
        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        
        groups[groupKey].push(result);
        return groups;
      }, {});
    };
    
    const groupedResults = getGroupedResults();
    
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="border-b border-gray-200 px-5 py-4 flex justify-between items-center bg-gray-50 rounded-t-xl">
          <div className="text-sm text-gray-700 flex items-center">
            <span className="font-medium">{results.length} results</span>
            <div className="ml-2 flex items-center text-xs text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200">
              <Clock size={12} className="mr-1" />
              0.24 seconds
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* View mode toggles */}
            <button 
              onClick={() => setViewMode('card')} 
              className={`p-1.5 rounded ${viewMode === 'card' ? 'bg-brand-100 text-brand-700' : 'hover:bg-gray-100 text-gray-600'} transition-colors duration-200`}
              aria-label="Card view"
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')} 
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-brand-100 text-brand-700' : 'hover:bg-gray-100 text-gray-600'} transition-colors duration-200`}
              aria-label="List view"
            >
              <List size={18} />
            </button>
            
            {/* Grouping dropdown */}
            <div className="ml-2 relative">
              <select
                className="block w-full pl-3 pr-8 py-1.5 text-sm border-gray-300 rounded-lg focus:outline-none focus:ring-brand-500 focus:border-brand-500 bg-white"
                value={resultGrouping}
                onChange={(e) => setResultGrouping(e.target.value as typeof resultGrouping)}
              >
                <option value="none">No Grouping</option>
                <option value="date">Group by Date</option>
                <option value="type">Group by Type</option>
                <option value="source">Group by Source</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <ChevronDown size={14} className="text-gray-400" />
              </div>
            </div>
            
            {/* Sort dropdown */}
            <div className="ml-2 relative">
              <select
                className="block w-full pl-3 pr-8 py-1.5 text-sm border-gray-300 rounded-lg focus:outline-none focus:ring-brand-500 focus:border-brand-500 bg-white"
                defaultValue="relevance"
              >
                <option value="relevance">Sort: Relevance</option>
                <option value="date">Sort: Date</option>
                <option value="name">Sort: Name</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <ChevronDown size={14} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Grouped results */}
        <div className="divide-y divide-gray-200">
          {Object.entries(groupedResults).map(([groupName, groupResults]) => (
            <div key={groupName} className="bg-white">
              {resultGrouping !== 'none' && (
                <div className="px-5 py-2 bg-gray-50 sticky top-0 z-10 flex items-center">
                  <h3 className="text-sm font-medium text-gray-700">{groupName}</h3>
                  <span className="ml-2 text-xs text-gray-500">({groupResults.length})</span>
                </div>
              )}
              
              {/* Results grid or list based on view mode */}
              <div className={viewMode === 'card' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4' 
                : 'divide-y divide-gray-100'
              }>
                {groupResults.map(result => (
                  <div 
                    key={result.id} 
                    className={viewMode === 'card' 
                      ? `bg-white border ${result.isHighlighted ? 'border-brand-300 ring-1 ring-brand-300' : 'border-gray-200'} rounded-xl p-4 hover:shadow-md hover:border-brand-200 transition-all duration-200` 
                      : `p-4 hover:bg-gray-50 transition-colors duration-200 ${result.isHighlighted ? 'bg-brand-50/30' : ''}`
                    }
                  >
                    <div className="flex items-start">
                      {/* File icon */}
                      <div className={`flex-shrink-0 rounded-md p-2.5 ${
                        result.type === 'PDF' ? 'bg-red-50 text-red-700' :
                        result.type === 'Excel' ? 'bg-green-50 text-green-700' :
                        result.type === 'Word' ? 'bg-blue-50 text-blue-700' :
                        result.type === 'PowerPoint' ? 'bg-amber-50 text-amber-700' :
                        'bg-purple-50 text-purple-700'
                      }`}>
                        <FileText size={viewMode === 'card' ? 20 : 16} />
                      </div>
                      
                      {/* File details */}
                      <div className="ml-3 flex-1 min-w-0">
                        {/* Filename with truncation */}
                        <h4 className="font-medium text-gray-900 truncate">{result.name}</h4>
                        
                        {/* File metadata */}
                        <div className="mt-1 flex items-center text-xs text-gray-500 flex-wrap gap-y-1">
                          <span className="font-medium">{result.type}</span>
                          <span className="mx-1.5 text-gray-300">•</span>
                          <span>{result.size}</span>
                          <span className="mx-1.5 text-gray-300">•</span>
                          <span>{result.date}</span>
                          <span className="mx-1.5 text-gray-300">•</span>
                          <span>{result.source}</span>
                        </div>
                        
                        {/* Relevance score for list view */}
                        {viewMode === 'list' && (
                          <div className="mt-1 flex items-center">
                            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-brand-500 rounded-full" 
                                style={{ width: `${result.relevanceScore}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-xs text-gray-500">{result.relevanceScore}% match</span>
                          </div>
                        )}
                        
                        {/* Content snippet with highlighting */}
                        {(viewMode === 'list' || activeMode === 'content') && result.snippet && (
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                            {activeMode === 'content' ? (
                              <span 
                                dangerouslySetInnerHTML={{ 
                                  __html: result.snippet.replace(
                                    /Financial|projections|revenue|balance|sheet|cash|flow/gi, 
                                    match => `<mark class="bg-yellow-100 px-0.5 rounded">${match}</mark>`
                                  ) 
                                }} 
                              />
                            ) : (
                              result.snippet
                            )}
                          </p>
                        )}
                        
                        {/* Action buttons for card view */}
                        {viewMode === 'card' && (
                          <div className="mt-3 flex space-x-2">
                            <button className="px-2.5 py-1.5 text-xs font-medium text-brand-700 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors duration-200">
                              Preview
                            </button>
                            <button className="px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                              Open
                            </button>
                            <div className="relative ml-auto">
                              <button className="px-1.5 py-1.5 text-xs font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                                <ChevronDown size={12} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Action buttons for list view */}
                      {viewMode === 'list' && (
                        <div className="ml-auto flex space-x-1 flex-shrink-0">
                          <button className="p-1.5 text-brand-600 hover:text-brand-800 hover:bg-brand-50 rounded transition-colors duration-200">
                            Preview
                          </button>
                          <button className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors duration-200">
                            Open
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Load more button */}
        <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
          <button className="w-full py-2 text-sm text-brand-600 hover:text-brand-800 font-medium transition-colors duration-200">
            Load More Results
          </button>
        </div>
      </div>
    );
  };
  
  // Define a proper type for saved searches
  interface SavedSearch {
    id: string;
    name: string;
    icon: JSX.Element;
    filters: Record<string, any>;
    mode: SearchMode;
    query: string;
  }

  // Update the savedSearches state with the proper type
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([
    {
      id: '1',
      name: 'Quarterly Reports',
      icon: <Bookmark size={14} className="text-amber-500" />,
      filters: {
        fileType: ['PDF'],
        sourceSystem: 'Dragon',
        dateRange: 'Last 90 days'
      },
      mode: 'content' as SearchMode,
      query: 'quarterly report'
    },
    {
      id: '2',
      name: 'Client Documents',
      icon: <Bookmark size={14} className="text-amber-500" />,
      filters: {
        clientId: '12345',
        sourceSystem: 'Genius'
      },
      mode: 'content' as SearchMode,
      query: ''
    },
    {
      id: '3',
      name: 'Recent Submissions',
      icon: <Bookmark size={14} className="text-amber-500" />,
      filters: {
        fileType: ['Excel'],
        dateRange: 'Last 7 days'
      },
      mode: 'content' as SearchMode,
      query: 'submission'
    }
  ]);

  // Add state for save search dialog
  const [isSaveSearchDialogOpen, setIsSaveSearchDialogOpen] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');

  // Function to load a saved search
  const loadSavedSearch = (savedSearch: typeof savedSearches[0]) => {
    // First set the search mode
    setActiveMode(savedSearch.mode);
    
    // Then set the appropriate query
    if (savedSearch.mode === 'content') {
      setSearchQuery(savedSearch.query);
    } else {
      setAppliedFilters(savedSearch.filters);
    }
    
    // Show advanced options if advanced mode
    if (savedSearch.mode === 'content') {
      setShowAdvancedOptions(true);
    }
  };

  // Function to save current search
  const saveCurrentSearch = () => {
    if (!saveSearchName.trim()) return;
    
    // Create a properly typed copy of the filters
    const filtersCopy: Record<string, any> = {};
    
    // Only copy defined values
    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        filtersCopy[key] = value;
      }
    });
    
    const newSavedSearch = {
      id: Date.now().toString(),
      name: saveSearchName,
      icon: <Bookmark size={14} className="text-amber-500" />,
      filters: filtersCopy,
      mode: activeMode,
      query: activeMode === 'content' ? searchQuery : ''
    };
    
    setSavedSearches([newSavedSearch, ...savedSearches]);
    setSaveSearchName('');
    setIsSaveSearchDialogOpen(false);
  };

  // Save search dialog component
  const SaveSearchDialog = () => {
    if (!isSaveSearchDialogOpen) return null;
    
    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={() => setIsSaveSearchDialogOpen(false)}
        ></div>
        
        {/* Dialog */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 transform transition-all duration-300">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Save Search</h3>
            
            <div className="mb-5">
              <label htmlFor="searchName" className="block text-sm font-medium text-gray-700 mb-1">
                Search Name
              </label>
              <input
                id="searchName"
                type="text"
                value={saveSearchName}
                onChange={(e) => setSaveSearchName(e.target.value)}
                placeholder="e.g., Quarterly Reports"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                autoFocus
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsSaveSearchDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveCurrentSearch}
                disabled={!saveSearchName.trim()}
                className={`px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
                  !saveSearchName.trim() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  // Update the renderSavedSearches function
  const renderSavedSearches = () => {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 mb-5 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <History size={16} className="mr-2 text-brand-500" />
            Recent Searches
          </h3>
          <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200">
            Clear
          </button>
        </div>
        
        <ul className="space-y-2 mb-4">
          <li className="text-sm text-gray-700 hover:bg-gray-50 p-2 rounded-md flex items-center">
            <Clock size={14} className="text-gray-400 mr-2" />
            "quarterly report" + PDF + Last 30 days
          </li>
          <li className="text-sm text-gray-700 hover:bg-gray-50 p-2 rounded-md flex items-center">
            <Clock size={14} className="text-gray-400 mr-2" />
            Client ID: 12345 + Source: Dragon
          </li>
        </ul>
        
        <div className="flex justify-between items-center mb-3 mt-6">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <Bookmark size={16} className="mr-2 text-brand-500" />
            Saved Searches
          </h3>
          <button 
            onClick={() => {
              if (Object.keys(appliedFilters).some(key => !!appliedFilters[key as keyof typeof appliedFilters]) || 
                  searchQuery) {
                setIsSaveSearchDialogOpen(true);
              }
            }}
            className={`text-brand-600 hover:text-brand-800 transition-colors duration-200 flex items-center ${
              !(Object.keys(appliedFilters).some(key => !!appliedFilters[key as keyof typeof appliedFilters]) || 
                searchQuery) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Plus size={14} className="mr-1" />
            Save Current
          </button>
        </div>
        
        <ul className="space-y-2">
          {savedSearches.map(saved => (
            <li 
              key={saved.id} 
              className="text-sm text-gray-700 hover:bg-gray-50 p-2 rounded-md flex items-center justify-between group cursor-pointer"
              onClick={() => loadSavedSearch(saved)}
            >
              <div className="flex items-center">
                {saved.icon}
                <span className="ml-2">{saved.name}</span>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 text-gray-400 hover:text-gray-700">
                  <ChevronRight size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Add mobile detection utility and mobile filter sheet component
  const [isMobileFilterSheetOpen, setIsMobileFilterSheetOpen] = useState(false);

  // Add device detection
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileFilterSheetOpen) {
        setIsMobileFilterSheetOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileFilterSheetOpen]);

  // Mobile filter bottom sheet component
  const MobileFilterBottomSheet = () => {
    if (!isMobileFilterSheetOpen) return null;
    
    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={() => setIsMobileFilterSheetOpen(false)}
        ></div>
        
        {/* Bottom Sheet */}
        <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-xl shadow-lg transform transition-transform duration-300 ease-in-out max-h-[85vh] overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3"></div>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
              <button 
                onClick={() => setIsMobileFilterSheetOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          <div className="p-4">
            {/* Filter content - copied from filter panel but optimized for mobile */}
            <div className="space-y-6">
              {/* Source System */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Source System</label>
                <div className="space-y-5">
                  <div className="bg-blue-50 rounded-lg p-4 mb-5">
                    <h4 className="text-sm font-medium text-blue-800 mb-1.5 flex items-center">
                      <Info size={14} className="mr-1.5" />
                      About Source Systems
                    </h4>
                    <p className="text-xs text-blue-700">
                      Source systems are the original platforms where documents are stored and managed. 
                      Selecting a specific source system will limit your search to only documents from that platform.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {/* Show all source systems from the response */}
                    {sourceSystemOptions.map(option => (
                      <button
                        key={option}
                        onClick={() => {
                          if (appliedFilters.sourceSystem === option) {
                            removeFilter('sourceSystem');
                          } else {
                            applyFilter('sourceSystem', option);
                          }
                        }}
                        className={`px-5 py-2.5 text-sm rounded-lg transition-colors ${
                          appliedFilters.sourceSystem === option 
                            ? 'bg-blue-100 text-blue-800 font-medium' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* File Type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">File Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {fileTypeOptions.map(option => (
                    <button
                      key={option}
                      className={`p-3 border rounded-lg text-sm ${
                        appliedFilters.fileType && 
                        (typeof appliedFilters.fileType === 'string' ? 
                          appliedFilters.fileType === option : 
                          (appliedFilters.fileType as string[]).includes(option))
                          ? 'bg-purple-50 border-purple-200 text-purple-700' 
                          : 'border-gray-200 text-gray-700'
                      }`}
                      onClick={() => {
                        if (appliedFilters.fileType && 
                            (typeof appliedFilters.fileType === 'string' ? 
                              appliedFilters.fileType === option : 
                              (appliedFilters.fileType as string[]).includes(option))) {
                          removeFilter('fileType');
                        } else {
                          applyFilter('fileType', [...(appliedFilters.fileType || []), option]);
                        }
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Date Range */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Date Range</label>
                <div className="flex flex-wrap gap-2">
                  {dateRangeOptions.slice(0, 4).map(option => (
                    <button
                      key={option}
                      className={`py-2 px-3 border rounded-lg text-sm ${
                        appliedFilters.dateRange === option 
                          ? 'bg-amber-50 border-amber-200 text-amber-700' 
                          : 'border-gray-200 text-gray-700'
                      }`}
                      onClick={() => {
                        if (appliedFilters.dateRange === option) {
                          removeFilter('dateRange');
                        } else {
                          applyFilter('dateRange', option);
                        }
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Applied filters section */}
            {Object.keys(appliedFilters).some(key => !!appliedFilters[key as keyof typeof appliedFilters]) && (
              <div className="mt-6 border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Applied Filters</h4>
                  <button 
                    onClick={() => setAppliedFilters({})}
                    className="text-xs text-brand-600 font-medium"
                  >
                    Clear All
                  </button>
                </div>
                {renderCompactFilterPills()}
              </div>
            )}
            
            {/* Footer buttons */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setIsMobileFilterSheetOpen(false)}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsMobileFilterSheetOpen(false);
                  // Trigger search if needed
                }}
                className="flex-1 py-3 bg-brand-600 text-white rounded-lg text-sm font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  // First, modify the applySmartSuggestion function to handle all types of suggestions
  const applySmartSuggestion = (suggestion: {
    id: string; 
    name: string; 
    description: string; 
    icon: any; 
    color: string; 
    filters: Record<string, any>;
  }) => {
    setAppliedFilters(prev => ({
      ...prev,
      ...suggestion.filters
    }));
    setActiveMode('filters');
    setShowAdvancedOptions(true);
  };

  // Update frequentlyUsedSuggestions to include all needed filter properties
  const frequentlyUsedSuggestions = [
    {
      id: 'excel-documents',
      name: 'Excel Documents',
      description: 'All Excel files across systems',
      icon: FileText,
      color: 'bg-green-50 text-green-700 border-green-100',
      filters: {
        fileType: ['Excel']
      }
    },
    {
      id: 'last-30-days',
      name: 'Last 30 Days',
      description: 'Documents from last month',
      icon: Clock,
      color: 'bg-blue-50 text-blue-700 border-blue-100',
      filters: {
        dateRange: 'Last 30 days'
      }
    },
    {
      id: 'client-docs',
      name: 'Client Documents',
      description: 'Documents tagged with client info',
      icon: User,
      color: 'bg-purple-50 text-purple-700 border-purple-100',
      filters: {
        clientId: '12345'
      }
    },
    {
      id: 'contract-docs',
      name: 'Contract Documents',
      description: 'Documents related to contracts',
      icon: FileText,
      color: 'bg-amber-50 text-amber-700 border-amber-100',
      filters: {
        tags: ['Contract']
      }
    }
  ];

  // Function to refresh smart suggestions
  const refreshSuggestions = () => {
    setShowSmartSuggestions(!showSmartSuggestions);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Document Search</h1>
        </div>
        
        {/* Search Modes Tabs with keyboard shortcuts - simplified to match screenshot */}
        <div className="inline-flex p-1 rounded-xl bg-white shadow-sm mb-6">
          <button 
            className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center ${
              activeMode === 'filters' 
                ? 'bg-brand-500 text-white' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            onClick={() => changeSearchMode('filters')}
          >
            <Filter size={16} className="mr-2" />
            <span>Filter Search</span>
            <kbd className="ml-2 py-0.5 px-1.5 text-xs bg-white bg-opacity-20 rounded">Alt+1</kbd>
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center ${
              activeMode === 'content' 
                ? 'bg-brand-500 text-white' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            onClick={() => changeSearchMode('content')}
          >
            <Search size={16} className="mr-2" />
            <span>Content Search</span>
            <kbd className="ml-2 py-0.5 px-1.5 text-xs bg-white bg-opacity-20 rounded">Alt+2</kbd>
          </button>
        </div>
        
        {/* Main Content Area with increased spacing */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Content Search Input - only shown in content mode */}
          {activeMode === 'content' && (
            <div className="p-6" ref={searchContainerRef}>
              <form onSubmit={handleSearch} className="relative">
                <div className="flex">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-brand-500" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search within document content..."
                      className="block w-full pl-12 pr-4 py-3 text-gray-700 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all duration-200"
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    className="ml-3 px-5 py-3 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    Search Content
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* PROFESSIONAL SEARCH SUGGESTIONS - Strategic placement above filters */}
          {activeMode === 'filters' && !Object.keys(appliedFilters).some(key => !!appliedFilters[key as keyof typeof appliedFilters]) && (
            <div className="px-6 pt-5 pb-3">
              <div className="flex items-center gap-2 mb-2.5">
                <Lightbulb size={14} className="text-amber-500" />
                <span className="text-xs font-medium text-gray-500">Try searching for:</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {(showSmartSuggestions ? smartFilterSuggestions : frequentlyUsedSuggestions).map(suggestion => (
                  <button
                    key={suggestion.id}
                    onClick={() => applySmartSuggestion(suggestion)}
                    className="inline-flex items-center h-8 px-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full text-xs font-medium text-gray-700 transition-colors"
                  >
                    <suggestion.icon size={12} className="mr-1.5 text-gray-500" />
                    {suggestion.name}
                  </button>
                ))}
                <button 
                  onClick={refreshSuggestions}
                  className="inline-flex items-center h-8 px-3 text-xs text-brand-600 hover:text-brand-800 hover:bg-brand-50 rounded-full transition-colors"
                >
                  <RefreshCw size={12} className="mr-1.5" />
                  More suggestions
                </button>
              </div>
            </div>
          )}
          
          {/* Applied Filters - for filter search mode - IMPROVED DESIGN */}
          {activeMode === 'filters' && Object.keys(appliedFilters).some(key => !!appliedFilters[key as keyof typeof appliedFilters]) && (
            <div className="px-6 pt-6 pb-4 flex flex-wrap gap-3">
              <div className="flex items-center mr-3 mb-1">
                <Filter size={16} className="text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Applied Filters:</span>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                {Object.entries(appliedFilters).map(([key, value]) => {
                  if (!value || (Array.isArray(value) && value.length === 0)) return null;
                  
                  let icon;
                  let label;
                  let bgColor;
                  
                  switch(key) {
                    case 'sourceSystem':
                      icon = <Database size={14} className="text-blue-600" />;
                      label = 'Source';
                      bgColor = 'bg-blue-50';
                      break;
                    case 'fileType':
                      icon = <FileText size={14} className="text-purple-600" />;
                      label = 'Type';
                      bgColor = 'bg-purple-50';
                      break;
                    case 'dateRange':
                      icon = <Calendar size={14} className="text-amber-600" />;
                      label = 'Date';
                      bgColor = 'bg-amber-50';
                      break;
                    default:
                      icon = <Filter size={14} />;
                      label = key;
                      bgColor = 'bg-gray-100';
                  }
                  
                  const displayValue = Array.isArray(value) ? value.join(', ') : value;
                  
                  return (
                    <div key={key} className={`inline-flex items-center text-sm px-3 py-2 rounded-lg ${bgColor} text-gray-700 shadow-sm`}>
                      <span className="mr-2">{icon}</span>
                      <span className="font-medium">{label}={displayValue}</span>
                      <button 
                        onClick={() => removeFilter(key as keyof typeof appliedFilters)} 
                        className="ml-2 text-gray-500 hover:text-gray-700 p-1 hover:bg-white hover:bg-opacity-50 rounded-full transition-colors"
                        aria-label={`Remove ${label} filter`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
                
                <button
                  onClick={() => setAppliedFilters({})}
                  className="inline-flex items-center text-sm px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <X size={14} className="mr-1.5" />
                  Clear All
                </button>
              </div>
            </div>
          )}
          
          {/* Filter Panel - redesigned with better spacing and organization */}
          {activeMode === 'filters' && (
            <div className="px-6 pb-6">
              {/* Header with filters title and action buttons */}
              <div className="flex items-center justify-between mb-5 pt-4 border-t border-gray-200">
                <h3 className="font-medium text-gray-800 flex items-center">
                  <Filter size={16} className="text-brand-500 mr-2" />
                  Select Filters
                </h3>
                
                <div className="flex items-center">
                  <button
                    onClick={handleSearch}
                    className="px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-all duration-200 shadow-sm"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
              
              {/* Tab navigation - improved with better spacing and visual hierarchy */}
              <div className="mb-6">
                <div className="flex border-b border-gray-200 gap-2">
                  <button
                    onClick={() => setActiveFilterTab('sources')}
                    className={`py-3 px-4 text-sm border-b-2 ${
                      activeFilterTab === 'sources' ? 'border-brand-500 text-brand-600 font-medium' : 'border-transparent text-gray-500'
                    } flex items-center transition-colors`}
                  >
                    <Database size={16} className="mr-2" />
                    Sources
                  </button>
                  <button
                    onClick={() => setActiveFilterTab('documents')}
                    className={`py-3 px-4 text-sm border-b-2 ${
                      activeFilterTab === 'documents' ? 'border-brand-500 text-brand-600 font-medium' : 'border-transparent text-gray-500'
                    } flex items-center transition-colors`}
                  >
                    <FileText size={16} className="mr-2" />
                    Types
                  </button>
                  <button
                    onClick={() => setActiveFilterTab('date')}
                    className={`py-3 px-4 text-sm border-b-2 ${
                      activeFilterTab === 'date' ? 'border-brand-500 text-brand-600 font-medium' : 'border-transparent text-gray-500'
                    } flex items-center transition-colors`}
                  >
                    <Calendar size={16} className="mr-2" />
                    Date
                  </button>
                  <button
                    onClick={() => setActiveFilterTab('client')}
                    className={`py-3 px-4 text-sm border-b-2 ${
                      activeFilterTab === 'client' ? 'border-brand-500 text-brand-600 font-medium' : 'border-transparent text-gray-500'
                    } flex items-center transition-colors`}
                  >
                    <User size={16} className="mr-2" />
                    Client
                  </button>
                </div>
              </div>
              
              {/* Tab content - with improved spacing and organization */}
              <div className="py-2 px-1">
                {/* Document Types Tab Content - improved */}
                {activeFilterTab === 'documents' && (
                  <div className="flex flex-wrap gap-3">
                    {fileTypeOptions.map(option => (
                      <button
                        key={option}
                        onClick={() => {
                          const currentTypes = appliedFilters.fileType ? 
                            (typeof appliedFilters.fileType === 'string' ? [appliedFilters.fileType] : [...appliedFilters.fileType as string[]]) : 
                            [];
                          
                          if (currentTypes.includes(option)) {
                            const newTypes = currentTypes.filter(t => t !== option);
                            if (newTypes.length === 0) {
                              removeFilter('fileType');
                            } else {
                              applyFilter('fileType', newTypes);
                            }
                          } else {
                            applyFilter('fileType', [...currentTypes, option]);
                          }
                        }}
                        className={`px-5 py-2.5 text-sm rounded-lg transition-colors ${
                          appliedFilters.fileType && 
                          (typeof appliedFilters.fileType === 'string' ? 
                            appliedFilters.fileType === option : 
                            (appliedFilters.fileType as string[]).includes(option))
                            ? 'bg-purple-100 text-purple-800 font-medium' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Sources tab content - improved */}
                {activeFilterTab === 'sources' && (
                  <div className="space-y-5">
                    <div className="bg-blue-50 rounded-lg p-4 mb-5">
                      <h4 className="text-sm font-medium text-blue-800 mb-1.5 flex items-center">
                        <Info size={14} className="mr-1.5" />
                        About Source Systems
                      </h4>
                      <p className="text-xs text-blue-700">
                        Source systems are the original platforms where documents are stored and managed. 
                        Selecting a specific source system will limit your search to only documents from that platform.
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      {/* Show all source systems from the response */}
                      {sourceSystemOptions.map(option => (
                        <button
                          key={option}
                          onClick={() => {
                            if (appliedFilters.sourceSystem === option) {
                              removeFilter('sourceSystem');
                            } else {
                              applyFilter('sourceSystem', option);
                            }
                          }}
                          className={`px-5 py-2.5 text-sm rounded-lg transition-colors ${
                            appliedFilters.sourceSystem === option 
                              ? 'bg-blue-100 text-blue-800 font-medium' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Date tab content - improved */}
                {activeFilterTab === 'date' && (
                  <div className="space-y-5">
                    <div className="flex flex-wrap gap-3">
                      {dateRangeOptions.slice(0, 5).map(option => (
                        <button
                          key={option}
                          onClick={() => {
                            if (appliedFilters.dateRange === option) {
                              removeFilter('dateRange');
                            } else {
                              applyFilter('dateRange', option);
                            }
                          }}
                          className={`px-5 py-2.5 text-sm rounded-lg transition-colors ${
                            appliedFilters.dateRange === option 
                              ? 'bg-amber-100 text-amber-800 font-medium' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => applyFilter('dateRange', 'Custom range')}
                        className={`px-5 py-2.5 text-sm rounded-lg transition-colors ${
                          appliedFilters.dateRange === 'Custom range' 
                            ? 'bg-amber-100 text-amber-800 font-medium' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Custom Range
                      </button>
                    </div>
                    
                    {appliedFilters.dateRange === 'Custom range' && (
                      <div className="grid grid-cols-2 gap-4 p-5 bg-gray-50 rounded-lg">
                        <div>
                          <label className="text-sm text-gray-700 mb-1.5 block font-medium">Start Date</label>
                          <input type="date" className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-brand-500 focus:border-brand-500" />
                        </div>
                        <div>
                          <label className="text-sm text-gray-700 mb-1.5 block font-medium">End Date</label>
                          <input type="date" className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-brand-500 focus:border-brand-500" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Search Results - with improved spacing */}
          <div className="border-t border-gray-200">
            <div className="p-6">
              {renderSearchResults()}
            </div>
          </div>
        </div>
        
        {/* Saved Searches - in a more spacious layout */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <Bookmark size={16} className="mr-2 text-brand-500" />
                Saved Searches
              </h3>
              <button 
                onClick={() => {
                  if (Object.keys(appliedFilters).some(key => !!appliedFilters[key as keyof typeof appliedFilters]) || 
                      searchQuery) {
                    setIsSaveSearchDialogOpen(true);
                  }
                }}
                className={`text-brand-600 hover:text-brand-800 transition-colors duration-200 flex items-center ${
                  !(Object.keys(appliedFilters).some(key => !!appliedFilters[key as keyof typeof appliedFilters]) || 
                    searchQuery) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Plus size={16} className="mr-1" />
                Save Current
              </button>
            </div>
            
            <ul className="space-y-2">
              {savedSearches.map(saved => (
                <li 
                  key={saved.id} 
                  className="text-gray-700 hover:bg-gray-50 p-3 rounded-lg flex items-center justify-between group cursor-pointer transition-colors"
                  onClick={() => loadSavedSearch(saved)}
                >
                  <div className="flex items-center">
                    {saved.icon}
                    <span className="ml-2 font-medium">{saved.name}</span>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 text-gray-400 hover:text-gray-700">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Help panel - simplified */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm p-6 border border-blue-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <Lightbulb size={16} className="text-amber-500 mr-2" />
              Search Tips
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <CheckCircle2 size={16} className="text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <span>Use <span className="px-1.5 py-0.5 bg-white rounded font-mono text-xs">quotes</span> for exact phrase matching</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 size={16} className="text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <span>Select multiple file types for broader results</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 size={16} className="text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <span>Save searches for quick access</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Mobile filters button (only visible on mobile) */}
      <div className="lg:hidden fixed bottom-4 right-4">
        <button
          onClick={() => setIsMobileFilterSheetOpen(true)}
          className="p-3 bg-brand-600 text-white rounded-full shadow-lg hover:bg-brand-700 focus:outline-none transition-colors"
        >
          <Filter size={20} />
        </button>
      </div>
      
      <MobileFilterBottomSheet />
      <SaveSearchDialog />
    </div>
  );
};

export default SearchUIRedesign; 