import React from 'react';
import type { Column } from '../../types/search';

interface LoadingPlaceholderProps {
  count: number;
  columns: Column[];
}

export const LoadingPlaceholder: React.FC<LoadingPlaceholderProps> = ({ count, columns }) => {
  return (
    <div className="animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex border-b border-gray-100 hover:bg-gray-50 py-0.5">
          {columns.map((column) => (
            <div
              key={column.id}
              className="px-6 py-4"
              style={{ width: column.width, minWidth: column.minWidth }}
            >
              <div className="h-4 bg-gray-200 rounded-md w-3/4 mb-1" />
              {column.id === 'filename' && (
                <div className="h-3 bg-gray-100 rounded-md w-1/2 mt-2" />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};