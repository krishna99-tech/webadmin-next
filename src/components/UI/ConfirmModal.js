'use client';

import React, { useEffect } from 'react';
import Button from './Button';
import { AlertTriangle, Trash2, Info } from 'lucide-react';

/**
 * Reusable confirmation modal. Replace window.confirm with styled UI.
 * @param {boolean} open
 * @param {string} title
 * @param {string} message
 * @param {string} variant - 'danger' | 'warning' | 'info'
 * @param {string} confirmLabel
 * @param {string} cancelLabel
 * @param {function} onConfirm
 * @param {function} onCancel
 * @param {boolean} loading
 */
export default function ConfirmModal({
  open,
  title = 'Confirm action',
  message = 'Are you sure?',
  variant = 'danger',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}) {
  useEffect(() => {
    const handleKey = (e) => {
      if (!open) return;
      if (e.key === 'Escape') onCancel?.();
      if (e.key === 'Enter' && !loading) onConfirm?.();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onCancel, onConfirm, loading]);

  if (!open) return null;

  const Icon = variant === 'danger' ? Trash2 : variant === 'warning' ? AlertTriangle : Info;
  const iconClass =
    variant === 'danger'
      ? 'bg-red-500/20 text-red-400'
      : variant === 'warning'
      ? 'bg-amber-500/20 text-amber-400'
      : 'bg-blue-500/20 text-blue-400';
  const confirmClass =
    variant === 'danger'
      ? '!bg-red-600 hover:!bg-red-500'
      : variant === 'warning'
      ? '!bg-amber-600 hover:!bg-amber-500'
      : '';

  return (
    <div
      className="confirm-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="confirm-modal-backdrop" onClick={onCancel} aria-hidden="true" />
      <div className="confirm-modal-card">
        <div className={`confirm-modal-icon ${iconClass}`}>
          <Icon size={24} />
        </div>
        <h3 id="confirm-modal-title" className="confirm-modal-title">
          {title}
        </h3>
        <p className="confirm-modal-message">{message}</p>
        <div className="confirm-modal-actions">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            className={confirmClass}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
