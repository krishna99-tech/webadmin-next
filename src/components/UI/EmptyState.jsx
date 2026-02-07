import React from 'react';
import { Button } from '@heroui/react';

export default function EmptyState({
  icon: Icon,
  title = 'No data available',
  description = 'Your collection is currently empty.',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-divider/20 bg-content2/5 ${className}`}>
      {Icon && (
        <div className="mb-6 p-4 rounded-full bg-primary/10 text-primary ring-8 ring-primary/5">
          <Icon size={40} className="icon-glow" />
        </div>
      )}
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-dim max-w-xs mx-auto mb-8 font-medium italic">{description}</p>
      {actionLabel && onAction && (
        <Button 
          color="primary" 
          variant="flat" 
          onPress={onAction}
          className="font-black uppercase tracking-widest text-xs h-10 px-8"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
