import React from 'react';
import Image from 'next/image';
import { generateInitialsAvatar, getInitials } from '@/utils/avatarUtils';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: number;
  className?: string;
  alt?: string;
  showTooltip?: boolean;
  onClick?: () => void;
}

/**
 * Avatar component with automatic fallback to generated initials
 * Can be used throughout the application for consistent avatar display
 */
const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'User',
  size = 48,
  className = '',
  alt,
  showTooltip = false,
  onClick
}) => {
  // Validate and sanitize the src prop
  let validSrc = src;
  
  // Check if src is malformed (object, contains curly braces, etc.)
  if (src && (typeof src !== 'string' || src.includes('{') || src.includes('}'))) {
    console.warn('Invalid avatar src detected, using fallback:', src);
    validSrc = undefined;
  }
  
  // Generate fallback avatar if no valid src provided
  const avatarSrc = validSrc || generateInitialsAvatar(name, { size });
  const altText = alt || `${name}'s avatar`;
  
  const avatarElement = (
    <Image
      src={avatarSrc}
      alt={altText}
      width={size}
      height={size}
      className={`rounded-circle ${className} ${onClick ? 'cursor-pointer' : ''}`}
      style={{ objectFit: 'cover' }}
      onClick={onClick}
      onError={(e) => {
        // Fallback to generated avatar on error
        const target = e.target as HTMLImageElement;
        target.src = generateInitialsAvatar(name, { size });
      }}
    />
  );

  if (showTooltip) {
    return (
      <div 
        className="d-inline-block" 
        data-bs-toggle="tooltip" 
        data-bs-placement="top" 
        title={name}
      >
        {avatarElement}
      </div>
    );
  }

  return avatarElement;
};

export default Avatar;