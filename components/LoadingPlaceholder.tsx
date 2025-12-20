
import React from 'react';

const LoadingPlaceholder: React.FC = () => {
  return (
    <div className="bg-gray-800 p-2 rounded-lg shadow-lg animate-pulse flex flex-col aspect-[4/5] w-full">
      <div className="bg-gray-700 rounded-md w-full h-full"></div>
      <div className="mt-2 w-full bg-gray-700 h-8 rounded-md"></div>
    </div>
  );
};

export default LoadingPlaceholder;
