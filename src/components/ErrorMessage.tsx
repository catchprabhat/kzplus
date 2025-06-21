import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
      <div className="flex items-center">
        <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 mr-2" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Error</h3>
          <p className="text-sm text-red-700 dark:text-red-400 mt-1">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-4 bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 text-red-800 dark:text-red-300 px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Retry
          </button>
        )}
      </div>
    </div>
  );
};