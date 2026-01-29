'use client';

import React from 'react';

const Card = ({
  children,
  className = '',
  noPadding = false,
  hoverable = true,
  ...props
}) => {
  const baseClass = `
    relative
    bg-[var(--bg-card)]
    backdrop-blur-xl
    border border-[var(--border-color)]
    rounded-[var(--radius)]
    shadow-[var(--shadow-lg)]
    transition-all duration-300 ease-out
  `;

  const hoverClass = hoverable
    ? 'hover:-translate-y-1 hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)]'
    : '';

  return (
    <div
      className={`
        ${baseClass}
        ${hoverClass}
        ${noPadding ? '' : 'p-6'}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
