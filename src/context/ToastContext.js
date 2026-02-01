'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', message, duration = 4000 }) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, message }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message, type = 'info') => addToast({ type, message }), [addToast]);
  const success = useCallback((message) => addToast({ type: 'success', message }), [addToast]);
  const error = useCallback((message) => addToast({ type: 'error', message }), [addToast]);
  const warning = useCallback((message) => addToast({ type: 'warning', message }), [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast, success, error, warning }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;
  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map(t => (
        <div
          key={t.id}
          role="alert"
          className={`toast toast-${t.type} animate-slideInRight`}
          onClick={() => onRemove(t.id)}
        >
          <span className="toast-message">{t.message}</span>
          <button
            type="button"
            className="toast-dismiss"
            aria-label="Dismiss"
            onClick={(e) => { e.stopPropagation(); onRemove(t.id); }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toast: (m) => console.info(m),
      success: (m) => console.info(m),
      error: (m) => console.error(m),
      warning: (m) => console.warn(m),
    };
  }
  return ctx;
}
