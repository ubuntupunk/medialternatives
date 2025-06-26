"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { HEADER_CONFIG } from '@/lib/constants';

interface CustomHeaderProps {
  imageUrl?: string;
  height?: number;
}

/**
 * Custom header image component
 * Uses a local header image.
 */
const CustomHeader: React.FC<CustomHeaderProps> = ({
  imageUrl,
  height = HEADER_CONFIG.DEFAULT_HEIGHT
}) => {
  const localHeaderImage = '/images/header.jpg'; // Path to the local header image
  const [headerImage, setHeaderImage] = useState<string | null>(imageUrl || localHeaderImage);

  useEffect(() => {
    // If an imageUrl prop is provided, use it. Otherwise, default to the local image.
    if (imageUrl) {
      setHeaderImage(imageUrl);
    } else {
      setHeaderImage(localHeaderImage);
    }
  }, [imageUrl]);

  // If no header image is available, don't render anything
  if (!headerImage) {
    return null;
  }

  return (
    <div 
      className="custom-header"
      style={{
        backgroundImage: `url(${headerImage})`,
        height: `${height}px`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
      role="img"
      aria-label="Header image"
    />
  );
};

export default CustomHeader;
