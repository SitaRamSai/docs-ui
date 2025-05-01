import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  error: Error;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center p-4">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading files</h3>
      <p className="text-sm text-gray-500">{error.message}</p>
    </div>
  );
};