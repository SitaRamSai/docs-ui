import React, { useState, useEffect, useRef } from 'react';
import { 
    Database, 
    Search, 
    FileText, 
    Filter, 
    Calendar, 
    ChevronDown, 
    Tag, 
    ChevronRight,
    X,
    SlidersHorizontal,
    Layers,
    Info,
    AlertCircle,
    Plus,
    Minus
} from 'lucide-react';
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

// Available document types
const DOCUMENT_TYPES = [
    { id: 'pdf', name: 'PDF Document' },
    { id: 'doc', name: 'Word Document' },
    { id: 'img', name: 'Image File' },
    { id: 'xls', name: 'Excel Spreadsheet' }
];

// Available date ranges
const DATE_RANGES = [
    { id: 'today', name: 'Today' },
    { id: 'yesterday', name: 'Yesterday' },
    { id: 'week', name: 'Last 7 days' },
    { id: 'month', name: 'Last 30 days' },
    { id: 'quarter', name: 'Last 90 days' },
    { id: 'year', name: 'This year' },
    { id: 'custom', name: 'Custom range' }
];

// Component for each collapsible filter section
const FilterAccordion = ({ 
    title, 
    icon, 
    children, 
    isOpen, 
    onToggle,
    badgeCount = null
}: { 
    title: string; 
    icon: React.ReactNode; 
    children: React.ReactNode; 
    isOpen: boolean; 
    onToggle: () => void;
    badgeCount?: number | null;
}) => {
    return (
        <div className="mb-3 bg-white/90 dark:bg-slate-800/90 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between px-4 py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
                <div className="flex items-center gap-3">
                    <div className="text-brand-500 dark:text-brand-400">
                        {icon}
                    </div>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{title}</span>
                    {badgeCount !== null && (
                        <span className="px-2 py-0.5 bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 text-xs rounded-full">
                            {badgeCount}
                        </span>
                    )}
                </div>
                <div className="text-slate-400 dark:text-slate-500 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                    <ChevronRight size={18} />
                </div>
            </button>
            {isOpen && (
                <div className="px-4 pb-4 pt-1">
                    {children}
                </div>
            )}
        </div>
    );
};

// Component for each applied filter pill/tag
const FilterPill = ({ 
    label, 
    value, 
    icon, 
    color = "brand", 
    onRemove 
}: { 
    label: string; 
    value: string; 
    icon: React.ReactNode; 
    color?: string; 
    onRemove: () => void;
}) => {
    const colors: Record<string, string> = {
        brand: "bg-brand-50/50 border-brand-100 text-brand-800 dark:bg-brand-900/30 dark:border-brand-800/40 dark:text-brand-300",
        blue: "bg-blue-50/50 border-blue-100 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800/40 dark:text-blue-300",
        purple: "bg-purple-50/50 border-purple-100 text-purple-800 dark:bg-purple-900/30 dark:border-purple-800/40 dark:text-purple-300",
        amber: "bg-amber-50/50 border-amber-100 text-amber-800 dark:bg-amber-900/30 dark:border-amber-800/40 dark:text-amber-300",
        emerald: "bg-emerald-50/50 border-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-800/40 dark:text-emerald-300"
    };
    
    const iconColors: Record<string, string> = {
        brand: "text-brand-600 dark:text-brand-400",
        blue: "text-blue-600 dark:text-blue-400",
        purple: "text-purple-600 dark:text-purple-400",
        amber: "text-amber-600 dark:text-amber-400",
        emerald: "text-emerald-600 dark:text-emerald-400"
    };
    
    return (
        <div className={`inline-flex items-center text-xs px-3 py-1.5 rounded-md border ${colors[color]}`}>
            <span className={`mr-1.5 ${iconColors[color]}`}>{icon}</span>
            <span>{label}:</span>
            <span className="font-medium ml-1">{value}</span>
            <button 
                onClick={onRemove} 
                className="ml-2 p-0.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                aria-label={`Remove ${label} filter`}
            >
                <X size={12} />
            </button>
        </div>
    );
};

interface AdvancedSearchPageProps {
    onSetSidebarFilters: (filters: React.ReactNode) => void;
}

const AdvancedSearchPage: React.FC<AdvancedSearchPageProps> = ({ onSetSidebarFilters }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'metadata' | 'content'>('metadata');
    // State for content search bar
    const [contentSearchQuery, setContentSearchQuery] = useState('');
    const [tempContentSearchQuery, setTempContentSearchQuery] = useState('');
    // State for selected source system
    const [sourceSystem, setSourceSystem] = useState('genius');
    // State for document type
    const [documentType, setDocumentType] = useState('');
    // State for date range
    const [dateRange, setDateRange] = useState('');
    // State for tags
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    // Track if content search has been executed
    const [hasSearchedContent, setHasSearchedContent] = useState(false);
    // Custom date range
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    // New state for accordion open/closed
    const [openSections, setOpenSections] = useState({
        source: true,
        document: false,
        date: false,
        tags: false
    });
    
    // New state for modal filters on mobile
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    
    // Tracking active filter count
    const getActiveFilterCount = () => {
        let count = 0;
        if (sourceSystem !== 'genius') count++; // Only count if not the default
        if (documentType) count++;
        if (dateRange) count++;
        if (selectedTags.length > 0) count++;
        if (activeTab === 'content' && contentSearchQuery) count++;
        return count;
    };
    
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

    // Function to toggle section open/closed
    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };
    
    // Clear all filters function
    const clearAllFilters = () => {
        setSourceSystem('genius');
        setDocumentType('');
        setDateRange('');
        setSelectedTags([]);
        if (activeTab === 'content') {
            setContentSearchQuery('');
            setTempContentSearchQuery('');
            setHasSearchedContent(false);
        }
    };
    
    // Toggle tag selection
    const toggleTag = (tag: string) => {
        setSelectedTags(tags => 
            tags.includes(tag) 
                ? tags.filter(t => t !== tag) 
                : [...tags, tag]
        );
    };

    // Build sidebar filters based on current state
    const renderSidebarFilters = () => {
        return (
            <>
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                        Advanced Search
                    </h3>
                </div>
                
                {/* Search Type Selector */}
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Search Type</p>
                    <div className="flex flex-col gap-2 bg-white/70 dark:bg-slate-800/60 rounded-lg p-3 border border-white/30 dark:border-slate-700 shadow-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="radio" 
                                name="searchType" 
                                checked={activeTab === 'metadata'} 
                                onChange={() => setActiveTab('metadata')}
                                className="h-4 w-4 text-brand-600 border-slate-300 focus:ring-brand-500 dark:bg-slate-700 dark:border-slate-600"
                            />
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-brand-500" />
                                <span className="text-sm">Metadata Search</span>
                            </div>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="radio" 
                                name="searchType" 
                                checked={activeTab === 'content'} 
                                onChange={() => setActiveTab('content')}
                                className="h-4 w-4 text-brand-600 border-slate-300 focus:ring-brand-500 dark:bg-slate-700 dark:border-slate-600"
                            />
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-brand-500" />
                                <span className="text-sm">Content Search</span>
                            </div>
                        </label>
                    </div>
                </div>
                
                {activeTab === 'content' && (
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Content Search</p>
                        <div className="bg-white/70 dark:bg-slate-800/60 rounded-lg p-3 border border-white/30 dark:border-slate-700 shadow-sm">
                            <ContentSearchBar
                                value={tempContentSearchQuery}
                                onChange={setTempContentSearchQuery}
                                onSubmit={handleContentSearch}
                            />
                        </div>
                    </div>
                )}
                
                {/* Source System */}
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Source System</p>
                    <div className="bg-white/70 dark:bg-slate-800/60 rounded-lg p-3 border border-white/30 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-2 w-full">
                            <Database className="h-4 w-4 text-brand-500 flex-shrink-0" />
                            <select
                                value={sourceSystem}
                                onChange={(e) => setSourceSystem(e.target.value)}
                                className="flex-1 text-sm border-0 p-0 focus:ring-0 focus:outline-none bg-transparent font-medium text-slate-800 dark:text-slate-200"
                            >
                                {SOURCE_SYSTEMS.map(system => (
                                    <option key={system.id} value={system.id}>{system.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                        </div>
                    </div>
                </div>
                
                {/* Document Type */}
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Document Type</p>
                    <div className="bg-white/70 dark:bg-slate-800/60 rounded-lg p-3 border border-white/30 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-2 w-full">
                            <FileText className="h-4 w-4 text-brand-500 flex-shrink-0" />
                            <select
                                value={documentType}
                                onChange={(e) => setDocumentType(e.target.value)}
                                className="flex-1 text-sm border-0 p-0 focus:ring-0 focus:outline-none bg-transparent font-medium text-slate-800 dark:text-slate-200"
                            >
                                <option value="">All Document Types</option>
                                {DOCUMENT_TYPES.map(type => (
                                    <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                        </div>
                    </div>
                </div>
                
                {/* Date Range */}
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Date Range</p>
                    <div className="bg-white/70 dark:bg-slate-800/60 rounded-lg p-3 border border-white/30 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-2 w-full">
                            <Calendar className="h-4 w-4 text-brand-500 flex-shrink-0" />
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="flex-1 text-sm border-0 p-0 focus:ring-0 focus:outline-none bg-transparent font-medium text-slate-800 dark:text-slate-200"
                            >
                                <option value="">Any Time</option>
                                {DATE_RANGES.map(range => (
                                    <option key={range.id} value={range.id}>{range.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                        </div>
                    </div>
                    
                    {dateRange === 'custom' && (
                        <div className="mt-2 space-y-2">
                            <div className="flex flex-col space-y-1">
                                <label className="text-xs text-slate-500 dark:text-slate-400">Start Date</label>
                                <input 
                                    type="date" 
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-brand-500 focus:border-brand-500"
                                />
                            </div>
                            <div className="flex flex-col space-y-1">
                                <label className="text-xs text-slate-500 dark:text-slate-400">End Date</label>
                                <input 
                                    type="date" 
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-brand-500 focus:border-brand-500"
                                />
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Tags */}
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tags</p>
                    <div className="flex flex-wrap gap-2">
                        <button 
                            onClick={() => setSelectedTags(tags => tags.includes('work') ? tags.filter(t => t !== 'work') : [...tags, 'work'])}
                            className={`badge ${selectedTags.includes('work') ? 'bg-brand-600 text-white' : ''}`}
                        >
                            Work
                        </button>
                        <button 
                            onClick={() => setSelectedTags(tags => tags.includes('personal') ? tags.filter(t => t !== 'personal') : [...tags, 'personal'])}
                            className={`badge ${selectedTags.includes('personal') ? 'bg-emerald-600 text-white' : 'bg-emerald-600/15 text-emerald-400'}`}
                        >
                            Personal
                        </button>
                        <button 
                            onClick={() => setSelectedTags(tags => tags.includes('finance') ? tags.filter(t => t !== 'finance') : [...tags, 'finance'])}
                            className={`badge ${selectedTags.includes('finance') ? 'bg-fuchsia-600 text-white' : 'bg-fuchsia-600/15 text-fuchsia-400'}`}
                        >
                            Finance
                        </button>
                        <button 
                            onClick={() => setSelectedTags(tags => tags.includes('important') ? tags.filter(t => t !== 'important') : [...tags, 'important'])}
                            className={`badge ${selectedTags.includes('important') ? 'bg-amber-600 text-white' : 'bg-amber-600/15 text-amber-400'}`}
                        >
                            Important
                        </button>
                    </div>
                </div>
                
                {/* Apply Filters Button */}
                <button 
                    onClick={testDirectApiCall}
                    className="w-full inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg py-2.5 font-medium shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/70 transition mt-4"
                >
                    <Search className="h-4 w-4" />
                    Apply Filters
                </button>
            </>
        );
    };
    
    // Set sidebar filters on component mount
    useEffect(() => {
        onSetSidebarFilters(renderSidebarFilters());
    }, [
        activeTab, 
        sourceSystem, 
        documentType, 
        dateRange, 
        startDate, 
        endDate, 
        selectedTags, 
        tempContentSearchQuery, 
        contentSearchQuery,
        hasSearchedContent
    ]);
 
    return (
        <div className="space-y-6">
            {/* Page header with tabs */}
            <div className="bg-white/70 dark:bg-slate-800/60 rounded-xl p-6 border border-white/30 dark:border-slate-800 shadow-glass">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="p-2.5 rounded-md bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 mr-3">
                            <Search size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Advanced Document Search</h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                {activeTab === 'metadata' 
                                    ? 'Filter and find specific documents from the selected source system' 
                                    : 'Search for specific content within document text'}
                            </p>
                        </div>
                    </div>
                    
                    {/* Mobile filter toggle button */}
                    <button 
                        className="md:hidden inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 shadow-sm"
                        onClick={() => setShowMobileFilters(true)}
                    >
                        <SlidersHorizontal size={16} />
                        <span className="text-sm font-medium">Filters</span>
                        {getActiveFilterCount() > 0 && (
                            <span className="px-1.5 py-0.5 bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 text-xs rounded-full">
                                {getActiveFilterCount()}
                            </span>
                        )}
                    </button>
                </div>
                
                {/* Search type tabs */}
                <div className="mt-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('metadata')}
                            className={`px-4 py-3 font-medium text-sm border-b-2 flex items-center gap-2 ${
                                activeTab === 'metadata'
                                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                            <Filter size={16} />
                            Metadata Search
                        </button>
                        <button
                            onClick={() => setActiveTab('content')}
                            className={`ml-6 px-4 py-3 font-medium text-sm border-b-2 flex items-center gap-2 ${
                                activeTab === 'content'
                                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                            <FileText size={16} />
                            Content Search
                        </button>
                    </div>
                </div>
                
                {/* Applied filters */}
                <div className="mt-4 flex flex-wrap gap-2">
                    {activeTab === 'content' && contentSearchQuery && (
                        <FilterPill
                            label="Content Query"
                            value={contentSearchQuery.length > 30 ? `${contentSearchQuery.substring(0, 30)}...` : contentSearchQuery}
                            icon={<FileText size={14} />}
                            color="emerald"
                            onRemove={() => {
                                setContentSearchQuery('');
                                setTempContentSearchQuery('');
                                setHasSearchedContent(false);
                            }}
                        />
                    )}
                    
                    {sourceSystem !== 'genius' && (
                        <FilterPill
                            label="Source"
                            value={SOURCE_SYSTEMS.find(system => system.id === sourceSystem)?.name || sourceSystem}
                            icon={<Database size={14} />}
                            onRemove={() => setSourceSystem('genius')}
                        />
                    )}
                    
                    {documentType && (
                        <FilterPill
                            label="Type"
                            value={DOCUMENT_TYPES.find(type => type.id === documentType)?.name || documentType}
                            icon={<FileText size={14} />}
                            color="blue"
                            onRemove={() => setDocumentType('')}
                        />
                    )}
                    
                    {dateRange && (
                        <FilterPill
                            label="Date"
                            value={dateRange === 'custom' ? 'Custom Range' : DATE_RANGES.find(range => range.id === dateRange)?.name || ''}
                            icon={<Calendar size={14} />}
                            color="purple"
                            onRemove={() => {
                                setDateRange('');
                                setStartDate('');
                                setEndDate('');
                            }}
                        />
                    )}
                    
                    {selectedTags.length > 0 && (
                        <FilterPill
                            label="Tags"
                            value={selectedTags.join(', ')}
                            icon={<Tag size={14} />}
                            color="amber"
                            onRemove={() => setSelectedTags([])}
                        />
                    )}
                    
                    {getActiveFilterCount() > 0 && (
                        <button
                            onClick={clearAllFilters}
                            className="text-xs px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                        >
                            Clear all
                        </button>
                    )}
                </div>
            </div>

            {/* Desktop layout - filter accordions and results */}
            <div className="hidden md:flex gap-6">
                {/* Removed the left side filter accordions since they're now in the sidebar */}
                
                {/* Full width search results */}
                <div className="flex-1 bg-white/70 dark:bg-slate-800/60 rounded-xl p-6 border border-white/30 dark:border-slate-800 shadow-glass">
                    {activeTab === 'content' && !hasSearchedContent && (
                        <div className="mb-6">
                            <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-3">Content Search</h3>
                            <ContentSearchBar
                                value={tempContentSearchQuery}
                                onChange={setTempContentSearchQuery}
                                onSubmit={handleContentSearch}
                            />
                        </div>
                    )}
                    
                    {activeTab === 'metadata' ? (
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
                            showFilters={false}
                            enableMultiSelect={true}
                            className="h-[calc(100vh-280px)]"
                        />
                    ) : (
                        hasSearchedContent ? (
                            <AdvancedSearchFileBrowser
                                initialQuery={{
                                    query: [
                                        {
                                            key: "sourceSystem",
                                            type: "matches",
                                            value: sourceSystem
                                        },
                                        {
                                            key: "content",
                                            type: "contains",
                                            value: contentSearchQuery
                                        }
                                    ],
                                    count: 10,
                                    offset: 0,
                                    projection: ["id", "filename", "contentType", "createdAt", "clientId", "fileType", "sourceSystem"]
                                }}
                                onFileSelect={(file) => console.log("Selected file:", file)}
                                onPageChange={(offset) => console.log("Page changed:", offset)}
                                itemsPerPage={10}
                                showFilters={false}
                                enableMultiSelect={true}
                                className="h-[calc(100vh-280px)]"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-[calc(100vh-320px)]">
                                <div className="text-center">
                                    <div className="p-4 rounded-full bg-slate-100/70 dark:bg-slate-700/30 mx-auto mb-4 w-20 h-20 flex items-center justify-center">
                                        <FileText className="h-10 w-10 text-slate-400 dark:text-slate-500" />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Enter your search query</h3>
                                    <p className="text-slate-500 dark:text-slate-400 max-w-md">
                                        Use the search box to find documents containing specific text
                                    </p>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
            
            {/* Mobile layout - results only (filters in modal) */}
            <div className="md:hidden">
                <div className="bg-white/70 dark:bg-slate-800/60 rounded-xl p-6 border border-white/30 dark:border-slate-800 shadow-glass">
                    {activeTab === 'content' && !hasSearchedContent ? (
                        <div className="mb-4">
                            <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-3">Content Search</h3>
                            <ContentSearchBar
                                value={tempContentSearchQuery}
                                onChange={setTempContentSearchQuery}
                                onSubmit={handleContentSearch}
                            />
                        </div>
                    ) : null}
                    
                    {activeTab === 'metadata' ? (
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
                            showFilters={false}
                            enableMultiSelect={true}
                            className="h-[calc(100vh-380px)]"
                        />
                    ) : (
                        hasSearchedContent ? (
                            <AdvancedSearchFileBrowser
                                initialQuery={{
                                    query: [
                                        {
                                            key: "sourceSystem",
                                            type: "matches",
                                            value: sourceSystem
                                        },
                                        {
                                            key: "content",
                                            type: "contains",
                                            value: contentSearchQuery
                                        }
                                    ],
                                    count: 10,
                                    offset: 0,
                                    projection: ["id", "filename", "contentType", "createdAt", "clientId", "fileType", "sourceSystem"]
                                }}
                                onFileSelect={(file) => console.log("Selected file:", file)}
                                onPageChange={(offset) => console.log("Page changed:", offset)}
                                itemsPerPage={10}
                                showFilters={false}
                                enableMultiSelect={true}
                                className="h-[calc(100vh-380px)]"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-[calc(100vh-420px)]">
                                <div className="text-center">
                                    <div className="p-4 rounded-full bg-slate-100/70 dark:bg-slate-700/30 mx-auto mb-4 w-20 h-20 flex items-center justify-center">
                                        <FileText className="h-10 w-10 text-slate-400 dark:text-slate-500" />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Enter your search query</h3>
                                    <p className="text-slate-500 dark:text-slate-400 max-w-md">
                                        Use the search box to find documents containing specific text
                                    </p>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
            
            {/* Mobile filter modal */}
            {showMobileFilters && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowMobileFilters(false)}></div>
                    <div className="absolute inset-0 md:max-w-md ml-auto bg-white dark:bg-slate-900 animate-slide-in-right overflow-auto">
                        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 z-10">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Search Filters</h2>
                                <button 
                                    onClick={() => setShowMobileFilters(false)}
                                    className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            
                            {/* Tabs in mobile modal */}
                            <div className="mt-4 flex border rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setActiveTab('metadata')}
                                    className={`flex-1 py-2 text-sm font-medium ${
                                        activeTab === 'metadata'
                                            ? 'bg-brand-600 text-white'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                    }`}
                                >
                                    Metadata Search
                                </button>
                                <button
                                    onClick={() => setActiveTab('content')}
                                    className={`flex-1 py-2 text-sm font-medium ${
                                        activeTab === 'content'
                                            ? 'bg-brand-600 text-white'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                    }`}
                                >
                                    Content Search
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-4 space-y-4">
                            {/* Content search in mobile modal */}
                            {activeTab === 'content' && (
                                <div className="bg-white/70 dark:bg-slate-800/60 rounded-lg p-4 border border-white/30 dark:border-slate-700 shadow-sm">
                                    <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-3">Content Search</h3>
                                    <ContentSearchBar
                                        value={tempContentSearchQuery}
                                        onChange={setTempContentSearchQuery}
                                        onSubmit={handleContentSearch}
                                    />
                                </div>
                            )}
                            
                            {/* Mobile filter accordions - same as desktop but in modal */}
                            <FilterAccordion
                                title="Source System"
                                icon={<Database size={18} />}
                                isOpen={openSections.source}
                                onToggle={() => toggleSection('source')}
                                badgeCount={sourceSystem !== 'genius' ? 1 : null}
                            >
                                <div className="space-y-2">
                                    {SOURCE_SYSTEMS.map(system => (
                                        <label key={system.id} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="sourceSystem"
                                                checked={sourceSystem === system.id}
                                                onChange={() => setSourceSystem(system.id)}
                                                className="h-4 w-4 text-brand-600 border-slate-300 focus:ring-brand-500 dark:bg-slate-700 dark:border-slate-600"
                                            />
                                            <span className="text-sm text-slate-800 dark:text-slate-200">{system.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </FilterAccordion>
                            
                            <FilterAccordion
                                title="Document Type"
                                icon={<FileText size={18} />}
                                isOpen={openSections.document}
                                onToggle={() => toggleSection('document')}
                                badgeCount={documentType ? 1 : null}
                            >
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="documentType"
                                            checked={documentType === ''}
                                            onChange={() => setDocumentType('')}
                                            className="h-4 w-4 text-brand-600 border-slate-300 focus:ring-brand-500 dark:bg-slate-700 dark:border-slate-600"
                                        />
                                        <span className="text-sm text-slate-800 dark:text-slate-200">All Document Types</span>
                                    </label>
                                    {DOCUMENT_TYPES.map(type => (
                                        <label key={type.id} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="documentType"
                                                checked={documentType === type.id}
                                                onChange={() => setDocumentType(type.id)}
                                                className="h-4 w-4 text-brand-600 border-slate-300 focus:ring-brand-500 dark:bg-slate-700 dark:border-slate-600"
                                            />
                                            <span className="text-sm text-slate-800 dark:text-slate-200">{type.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </FilterAccordion>
                            
                            <FilterAccordion
                                title="Date Range"
                                icon={<Calendar size={18} />}
                                isOpen={openSections.date}
                                onToggle={() => toggleSection('date')}
                                badgeCount={dateRange ? 1 : null}
                            >
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="dateRange"
                                            checked={dateRange === ''}
                                            onChange={() => setDateRange('')}
                                            className="h-4 w-4 text-brand-600 border-slate-300 focus:ring-brand-500 dark:bg-slate-700 dark:border-slate-600"
                                        />
                                        <span className="text-sm text-slate-800 dark:text-slate-200">Any Time</span>
                                    </label>
                                    {DATE_RANGES.map(range => (
                                        <label key={range.id} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="dateRange"
                                                checked={dateRange === range.id}
                                                onChange={() => setDateRange(range.id)}
                                                className="h-4 w-4 text-brand-600 border-slate-300 focus:ring-brand-500 dark:bg-slate-700 dark:border-slate-600"
                                            />
                                            <span className="text-sm text-slate-800 dark:text-slate-200">{range.name}</span>
                                        </label>
                                    ))}
                                </div>
                                
                                {dateRange === 'custom' && (
                                    <div className="mt-3 space-y-3">
                                        <div>
                                            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Start Date</label>
                                            <input 
                                                type="date" 
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="w-full text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-brand-500 focus:border-brand-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">End Date</label>
                                            <input 
                                                type="date" 
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="w-full text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-brand-500 focus:border-brand-500"
                                            />
                                        </div>
                                    </div>
                                )}
                            </FilterAccordion>
                            
                            <FilterAccordion
                                title="Tags"
                                icon={<Tag size={18} />}
                                isOpen={openSections.tags}
                                onToggle={() => toggleSection('tags')}
                                badgeCount={selectedTags.length || null}
                            >
                                <div className="flex flex-wrap gap-2">
                                    <button 
                                        onClick={() => toggleTag('work')}
                                        className={`badge ${selectedTags.includes('work') ? 'bg-brand-600 text-white' : ''}`}
                                    >
                                        Work
                                    </button>
                                    <button 
                                        onClick={() => toggleTag('personal')}
                                        className={`badge ${selectedTags.includes('personal') ? 'bg-emerald-600 text-white' : 'bg-emerald-600/15 text-emerald-400'}`}
                                    >
                                        Personal
                                    </button>
                                    <button 
                                        onClick={() => toggleTag('finance')}
                                        className={`badge ${selectedTags.includes('finance') ? 'bg-fuchsia-600 text-white' : 'bg-fuchsia-600/15 text-fuchsia-400'}`}
                                    >
                                        Finance
                                    </button>
                                    <button 
                                        onClick={() => toggleTag('important')}
                                        className={`badge ${selectedTags.includes('important') ? 'bg-amber-600 text-white' : 'bg-amber-600/15 text-amber-400'}`}
                                    >
                                        Important
                                    </button>
                                </div>
                            </FilterAccordion>
                        </div>
                        
                        {/* Modal footer with buttons */}
                        <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 flex gap-3">
                            <button
                                onClick={clearAllFilters}
                                className="flex-1 py-2.5 text-sm font-medium border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800"
                            >
                                Reset
                            </button>
                            <button
                                onClick={() => {
                                    testDirectApiCall();
                                    setShowMobileFilters(false);
                                }}
                                className="flex-1 py-2.5 text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white rounded-lg"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedSearchPage;
