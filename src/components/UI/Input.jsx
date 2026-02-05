import React from 'react';
import { Input as HeroUIInput } from '@heroui/react';

const Input = ({
  label,
  id,
  className = '',
  error,
  hint,
  startContent,
  endContent,
  size = 'md',
  variant = 'bordered',
  color = 'default',
  type = 'text',
  ...props
}) => {
  return (
    <HeroUIInput
      id={id}
      label={label}
      type={type}
      size={size}
      variant={variant}
      color={error ? 'danger' : color}
      errorMessage={error}
      description={hint}
      startContent={startContent}
      endContent={endContent}
      className={className}
      {...props}
    />
  );
};

export default Input;
