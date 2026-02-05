import React from 'react';
import { Textarea as HeroUITextarea } from '@heroui/react';

const Textarea = ({
  label,
  placeholder,
  value,
  onChange,
  className = '',
  classNames,
  size = 'md',
  variant = 'bordered',
  color = 'default',
  ...props
}) => {
  return (
    <HeroUITextarea
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      size={size}
      variant={variant}
      color={color}
      className={className}
      classNames={classNames}
      {...props}
    />
  );
};

export default Textarea;
