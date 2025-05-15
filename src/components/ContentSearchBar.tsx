import React from "react";
import { Search } from "lucide-react";
 
interface ContentSearchBarProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}
 
export const ContentSearchBar: React.FC<ContentSearchBarProps> = ({
  value,
  onChange,
  onSubmit,
}) => {
  return (
    <form
      className="w-full"
      onSubmit={e => {
        e.preventDefault();
        onSubmit();
      }}
      autoComplete="off"
    >
      <div className="flex flex-col w-full gap-3 items-center justify-center">
        <div className="flex items-center w-full relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            placeholder="Enter keywords to search within document content..."
            className="flex-1 pl-12 pr-4 py-3.5 text-base text-gray-900 placeholder-gray-500 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 bg-white shadow-sm"
            value={value}
            onChange={e => onChange(e.target.value)}
          />
          <button
            type="submit"
            className="ml-3 px-5 py-3.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors duration-150 shadow-sm"
          >
            <Search className="w-4 h-4 mr-2" />
            <span>Search Content</span>
          </button>
        </div>

        <div className="w-full flex items-center justify-between px-1">
          <div className="text-xs text-gray-500 flex items-center">
            <span className="text-gray-400">Examples:</span>
            <button 
              type="button" 
              onClick={() => onChange("insurance policy")}
              className="ml-2 text-blue-600 hover:text-blue-800 hover:underline"
            >
              insurance policy
            </button>
            <button 
              type="button" 
              onClick={() => onChange("claim form")}
              className="ml-2 text-blue-600 hover:text-blue-800 hover:underline"
            >
              claim form
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

