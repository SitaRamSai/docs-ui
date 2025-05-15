import React from 'react';
import { ChevronRight, File, FileText } from 'lucide-react';
import { cn } from '../utils/cn';

interface ContentSearchResult {
  score: number;
  document: {
    metadata: {
      source: string;
    };
    text: string;
    id: string;
  };
}

interface ContentSearchResultsProps {
  results: ContentSearchResult[];
  query: string;
  isLoading: boolean;
  onResultSelect?: (result: ContentSearchResult) => void;
}

// Extract file name from source path
const getFileName = (source: string): string => {
  if (!source) return 'Unknown document';
  const parts = source.split('/');
  return parts[parts.length - 1] || 'Unknown document';
};

// Format score as percentage
const formatScore = (score: number): string => {
  return `${Math.round(score * 100)}%`;
};

// Highlight query matches in text
const HighlightedText = ({ text, query }: { text: string; query: string }) => {
  if (!query.trim()) return <>{text}</>;

  const regex = new RegExp(`(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-200 px-0.5 rounded">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
};

const ContentSearchResults: React.FC<ContentSearchResultsProps> = ({
  results,
  query,
  isLoading,
  onResultSelect
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <FileText className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No matching content found</h3>
        <p className="mt-2 text-sm text-gray-500">
          Try using different keywords or broadening your search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden rounded-lg divide-y divide-gray-200">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Results
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Found {results.length} results matching "{query}"
        </p>
      </div>
      <div>
        {results.map((result, index) => (
          <div 
            key={result.document.id}
            className={cn(
              "px-4 py-5 sm:p-6 hover:bg-gray-50 cursor-pointer",
              index !== results.length - 1 && "border-b border-gray-200"
            )}
            onClick={() => onResultSelect && onResultSelect(result)}
          >
            <div className="flex items-start">
              {/* Left side - icon and score */}
              <div className="mr-4 flex-shrink-0">
                <div className="flex flex-col items-center">
                  <div className="p-2 bg-blue-50 rounded-full">
                    <File className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="mt-2 text-xs font-medium text-gray-500">
                    Match: <span className="text-blue-600">{formatScore(result.score)}</span>
                  </div>
                </div>
              </div>
              
              {/* Right side - content */}
              <div className="flex-1 min-w-0">
                {/* Source file */}
                <div className="text-sm font-medium text-gray-900 truncate mb-2">
                  {getFileName(result.document.metadata.source)}
                </div>
                
                {/* Text content with highlighting */}
                <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-800 whitespace-pre-wrap break-words">
                  <HighlightedText text={result.document.text} query={query} />
                </div>
                
                {/* Action button */}
                <div className="mt-2 flex justify-end">
                  <button 
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View document <ChevronRight className="ml-1 h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentSearchResults; 