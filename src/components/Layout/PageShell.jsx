import React from 'react';

const PageShell = ({
  children,
  gap = '2rem',
  paddingBottom = '6rem',
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`admin-page-shell animate-fade-in ${className}`.trim()}
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
