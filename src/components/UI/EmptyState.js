'use client';

import React from 'react';
import Button from './Button';

/**
 * Reusable empty state with icon, title, description, optional CTA.
 */
export default function EmptyState({
  icon: Icon,
  title = 'No data yet',
  description = 'Get started by adding your first item.',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`empty-state ${className}`}>
      {Icon && (
        <div className="empty-state-icon">
          <Icon size={32} strokeWidth={1.5} />
        </div>
      )}
      <p className="empty-state-title">{title}</p>
      <p className="empty-state-desc">{description}</p>
      {actionLabel && onAction && (
        <Button className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
