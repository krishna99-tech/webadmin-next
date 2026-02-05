import React from 'react';
import { Select as HeroUISelect, SelectItem } from '@heroui/react';

const Select = ({
  label,
  placeholder,
  value,
  onChange,
  options = [],
  className = '',
  size = 'md',
  variant = 'bordered',
  color = 'default',
  ...props
}) => {
  const selectedKeys = value !== undefined && value !== null ? [String(value)] : [];

  const handleSelectionChange = (keys) => {
    if (!onChange) return;
    const first = Array.from(keys || [])[0];
    onChange({ target: { value: first } });
  };

  return (
    <HeroUISelect
      label={label}
      placeholder={placeholder}
      selectedKeys={selectedKeys}
      onSelectionChange={handleSelectionChange}
      size={size}
      variant={variant}
      color={color}
      className={className}
      {...props}
    >
      {options.map((option) => (
        <SelectItem key={String(option.value)} value={String(option.value)}>
          {option.label}
        </SelectItem>
      ))}
    </HeroUISelect>
  );
};

export default Select;
