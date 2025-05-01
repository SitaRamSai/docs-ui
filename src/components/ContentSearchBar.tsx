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
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            placeholder="Search file content..."
            className="flex-1 pl-10 pr-4 py-3 text-base text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={value}
            onChange={e => onChange(e.target.value)}
          />
          <button
            type="submit"
            className="ml-2 px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors duration-150 shadow-sm"
          >
            <Search className="w-4 h-4 mr-1.5" />
            <span>Search</span>
          </button>
        </div>

      </div>
    </form>
  );
};
