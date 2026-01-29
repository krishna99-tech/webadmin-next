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
        {...props}
      />

      {error && <p className="input-error-text">{error}</p>}
      {!error && hint && <p className="input-hint">{hint}</p>}
    </div>
  );
};

export default Input;
