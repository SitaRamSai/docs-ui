import React from 'react';
import { FolderOpen } from 'lucide-react';

export const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center p-6 border-t border-gray-100">
      <div className="bg-gray-50 p-4 rounded-full mb-4">
        <FolderOpen className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
      <p className="text-sm text-gray-500 max-w-sm">
        Try adjusting your search or filter criteria to find what you're looking for
      </p>
    </div>
  );
};