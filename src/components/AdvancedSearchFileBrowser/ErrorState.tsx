import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  error: Error;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center p-6 border-t border-gray-100">
      <div className="bg-red-50 p-4 rounded-full mb-4">
        <AlertCircle className="w-10 h-10 text-red-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading files</h3>
      <p className="text-sm text-red-500 mb-1 font-medium">{error.message}</p>
      <p className="text-xs text-gray-500">Please try again or contact support if the problem persists</p>
    </div>
  );
};