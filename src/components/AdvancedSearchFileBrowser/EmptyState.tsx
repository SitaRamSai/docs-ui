import React from 'react';
import { FolderOpen } from 'lucide-react';

export const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center p-4">
      <FolderOpen className="w-12 h-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
      <p className="text-sm text-gray-500">
        Try adjusting your search or filter criteria
      </p>
    </div>
  );
};