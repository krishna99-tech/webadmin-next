'use client';

import '../../app/globals.css';
import React from 'react';

const Input = ({
  label,
  id,
  className = '',
  error,
  hint,
  ...props
}) => {
  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}

      <input
        id={id}
        className={`input-field ${error ? 'input-error' : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : (hint ? `${id}-hint` : undefined)}
        {...props}
      />

      {error && <p id={`${id}-error`} className="input-error-text" role="alert">{error}</p>}
      {!error && hint && <p id={`${id}-hint`} className="input-hint">{hint}</p>}
    </div>
  );
};

export default Input;
