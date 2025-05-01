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
        <div key={i} className="flex border-b border-gray-200">
          {columns.map((column) => (
            <div
              key={column.id}
              className="px-6 py-4"
              style={{ width: column.width, minWidth: column.minWidth }}
            >
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};