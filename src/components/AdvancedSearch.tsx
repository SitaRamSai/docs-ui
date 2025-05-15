import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, X, Filter } from 'lucide-react';
import useFileStore from '../store/fileStore';

interface FilterState {
    author: string;
    fileType: string;
    dateRange: {
        from: string;
        to: string;
    };
    size: {
        min: string;
        max: string;
    };
    sourceSystem: string;
}

const AdvancedSearch: React.FC = () => {
    const [query, setQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<FilterState>({
        author: '',
        fileType: '',
        dateRange: {
            from: '',
            to: '',
        },
        size: {
            min: '',
            max: '',
        },
        sourceSystem: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setShowFilters(true);
        // Implement search logic here
    };

    const clearFilters = () => {
        setFilters({
            author: '',
            fileType: '',
            dateRange: {
                from: '',
                to: '',
            },
            size: {
                min: '',
                max: '',
            },
            sourceSystem: '',
        });
    };

    return (
        <div className="w-full px-4 py-6">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search files..."
                        className="w-full px-4 py-3 pl-12 pr-10 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                        <Filter className="h-5 w-5" />
                    </button>
                </div>
            </form>

            {/* Filters */}
            {showFilters && (
                <div className="max-w-3xl mx-auto mt-4 bg-white rounded-lg shadow-lg border border-gray-200">
                    <div className="p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                            <button
                                onClick={clearFilters}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                Clear all
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Author Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Author
                                </label>
                                <input
                                    type="text"
                                    value={filters.author}
                                    onChange={(e) =>
                                        setFilters({ ...filters, author: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="Filter by author"
                                />
                            </div>

                            {/* File Type Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    File Type
                                </label>
                                <select
                                    value={filters.fileType}
                                    onChange={(e) =>
                                        setFilters({ ...filters, fileType: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="">All Types</option>
                                    <option value="claim">Claim</option>
                                    <option value="document">Document</option>
                                    <option value="image">Image</option>
                                </select>
                            </div>

                            {/* Date Range */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Date Range
                                </label>
                                <div className="flex space-x-2">
                                    <input
                                        type="date"
                                        value={filters.dateRange.from}
                                        onChange={(e) =>
                                            setFilters({
                                                ...filters,
                                                dateRange: { ...filters.dateRange, from: e.target.value },
                                            })
                                        }
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    <input
                                        type="date"
                                        value={filters.dateRange.to}
                                        onChange={(e) =>
                                            setFilters({
                                                ...filters,
                                                dateRange: { ...filters.dateRange, to: e.target.value },
                                            })
                                        }
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Size Range */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    File Size (MB)
                                </label>
                                <div className="flex space-x-2">
                                    <input
                                        type="number"
                                        value={filters.size.min}
                                        onChange={(e) =>
                                            setFilters({
                                                ...filters,
                                                size: { ...filters.size, min: e.target.value },
                                            })
                                        }
                                        placeholder="Min"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    <input
                                        type="number"
                                        value={filters.size.max}
                                        onChange={(e) =>
                                            setFilters({
                                                ...filters,
                                                size: { ...filters.size, max: e.target.value },
                                            })
                                        }
                                        placeholder="Max"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Source System */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Source System
                                </label>
                                <select
                                    value={filters.sourceSystem}
                                    onChange={(e) =>
                                        setFilters({ ...filters, sourceSystem: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="">All Systems</option>
                                    <option value="genius">Genius</option>
                                    <option value="legacy">Legacy</option>
                                    <option value="dragon">Dragon</option>
                                    <option value="ivos">IVOS</option>
                                </select>
                            </div>
                        </div>

                        {/* Apply Filters Button */}
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => {
                                    // Implement filter application logic here
                                    console.log('Applying filters:', filters);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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

export default AdvancedSearch;