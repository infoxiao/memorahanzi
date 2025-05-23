
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center my-4">
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} border-blue-500 border-t-transparent`}
      ></div>
      {text && <p className="mt-2 text-sm text-gray-400">{text}</p>}
    </div>
  );
};
