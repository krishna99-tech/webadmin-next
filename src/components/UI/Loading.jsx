import React from 'react';
import { Spinner } from '@heroui/react';

const Loading = ({ 
  size = 'lg', 
  color = 'primary', 
  label = 'Loading...',
  className = '',
  fullScreen = false 
}) => {
  const content = (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <Spinner size={size} color={color} />
      {label && <p className="text-sm text-gray-400">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;
