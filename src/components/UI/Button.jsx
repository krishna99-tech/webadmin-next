import React from 'react';
import { Button as HeroUIButton } from '@heroui/react';
import { Spinner } from '@heroui/react';

const Button = ({
  children,
  variant = 'solid',
  color = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  startContent,
  endContent,
  ...props
}) => {
  return (
    <HeroUIButton
      variant={variant}
      color={color}
      size={size}
      className={className}
      isDisabled={loading || disabled}
      isLoading={loading}
      startContent={loading ? undefined : startContent}
      endContent={loading ? undefined : endContent}
      spinner={<Spinner size="sm" />}
      {...props}
    >
      {children}
    </HeroUIButton>
  );
};

export default Button;
