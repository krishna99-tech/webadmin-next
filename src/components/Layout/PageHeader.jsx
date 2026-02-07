import React from 'react';
import { Card, CardBody } from '@heroui/react';

const PageHeader = ({
  icon: Icon,
  title,
  subtitle,
  actions,
  badge,
}) => {
  return (
    <Card className="admin-page-header" radius="lg">
      <CardBody className="py-6 px-8">
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
              {Icon && (
                <div className="admin-page-icon">
                  <Icon size={22} strokeWidth={2.5} />
                </div>
              )}
              <h2 className="section-title" style={{ margin: 0 }}>
                {title}
              </h2>
              {badge && <div>{badge}</div>}
            </div>
            {subtitle && (
              <div className="text-dim" style={{ fontSize: '0.875rem', margin: 0, marginTop: '0.25rem' }}>
                {typeof subtitle === 'string' ? <p style={{ margin: 0 }}>{subtitle}</p> : subtitle}
              </div>
            )}
          </div>

          {actions && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {actions}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default PageHeader;
