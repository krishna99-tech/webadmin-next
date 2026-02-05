import React from 'react';
import { Avatar as HeroUIAvatar, AvatarGroup } from '@heroui/react';

const Avatar = ({
  src,
  name,
  size = 'md',
  className = '',
  isBordered = true,
  color = 'primary',
  fallback,
  ...props
}) => {
  return (
    <HeroUIAvatar
      src={src}
      name={name}
      size={size}
      className={className}
      isBordered={isBordered}
      color={color}
      fallback={fallback}
      {...props}
    />
  );
};

Avatar.Group = AvatarGroup;

export default Avatar;
