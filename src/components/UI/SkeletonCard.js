'use client';

import React from 'react';

/**
 * Skeleton placeholder for stat cards / content loading.
 */
export default function SkeletonCard({ lines = 2, className = '' }) {
  return (
    <div className={`card card-skeleton ${className}`}>
      <div className="flex items-center gap-4">
        <div className="skeleton-pulse w-14 h-14 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton-pulse h-3 w-24 rounded" />
          <div className="skeleton-pulse h-8 w-16 rounded" />
          {lines >= 3 && <div className="skeleton-pulse h-3 w-32 rounded" />}
        </div>
      </div>
    </div>
  );
}
