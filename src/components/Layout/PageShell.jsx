import React from 'react';

const PageShell = ({
  children,
  gap = '2.5rem',
  paddingBottom = '6rem',
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`animate-fade-in ${className}`.trim()}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap,
        paddingBottom,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default PageShell;
