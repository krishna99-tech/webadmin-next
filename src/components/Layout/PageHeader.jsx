import React from 'react';

const PageHeader = ({
  icon: Icon,
  title,
  subtitle,
  actions,
  badge,
}) => {
  return (
    <div className="page-header">
      <div
        className="flex-between"
        style={{
          alignItems: 'flex-end',
          gap: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {Icon && <Icon className="text-primary" size={22} />}
            <h2 className="section-title" style={{ margin: 0 }}>
              {title}
            </h2>
            {badge && <div>{badge}</div>}
          </div>
          {subtitle && (
            <p className="text-dim" style={{ fontSize: '0.875rem', margin: 0 }}>
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
