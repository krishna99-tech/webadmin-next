'use client';

import React from 'react';

const Card = ({
  children,
  className = '',
  noPadding = false,
  hoverable = true,
  loading = false,
  ...props
}) => {
  return (
    <div
      className={`
        card
        ${hoverable ? '' : '!transform-none !shadow-lg'}
        ${noPadding ? 'p-0' : ''}
        ${loading ? 'shimmer-effect' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <div className="min-h-[100px] flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : children}
    </div>
  );
};

export default Card;
