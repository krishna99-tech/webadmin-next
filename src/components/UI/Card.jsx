import React from 'react';
import { Card as HeroUICard, CardHeader, CardBody, CardFooter } from '@heroui/react';

const Card = ({
  children,
  className = '',
  noPadding = false,
  hoverable = true,
  loading = false,
  variant = 'bordered',
  header,
  footer,
  ...props
}) => {
  return (
    <HeroUICard
      className={`${hoverable ? 'hover:scale-[1.02] transition-transform duration-200' : ''} ${className}`}
      shadow={variant === 'elevated' ? 'lg' : variant === 'flat' ? 'none' : 'sm'}
      radius="lg"
      {...props}
    >
      {loading ? (
        <CardBody className="min-h-[100px] flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </CardBody>
      ) : (
        <>
          {header && <CardHeader>{header}</CardHeader>}
          <CardBody className={noPadding ? 'p-0' : ''}>{children}</CardBody>
          {footer && <CardFooter>{footer}</CardFooter>}
        </>
      )}
    </HeroUICard>
  );
};

export default Card;
