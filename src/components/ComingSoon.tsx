// ComingSoon.tsx (new file)
import React from 'react';

interface ComingSoonProps {
  title: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({ title }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black-100 dark:bg-black-800">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-black-900 dark:text-white mb-4">{title}</h1>
        <p className="text-xl text-black-600 dark:text-black-300">Coming Soon!</p>
      </div>
    </div>
  );
};