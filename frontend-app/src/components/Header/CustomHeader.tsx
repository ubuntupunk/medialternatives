"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { wordpressApi } from '@/services/wordpress-api';
import { HEADER_CONFIG } from '@/lib/constants';

interface CustomHeaderProps {
  imageUrl?: string;
  height?: number;
}

/**
 * Custom header image component
 * Fetches header image from WordPress.com or uses fallback
 */
const CustomHeader: React.FC<CustomHeaderProps> = ({
  imageUrl,
  height = HEADER_CONFIG.DEFAULT_HEIGHT
}) => {
  const [headerImage, setHeaderImage] = useState<string | null>(imageUrl || null);

  useEffect(() => {
    // If no image URL is provided, try to fetch from WordPress.com
    if (!imageUrl) {
      const fetchHeaderImage = async () => {
        try {
          const siteInfo = await wordpressApi.getSiteInfo();
          
          if (siteInfo?.options?.header_image) {
            setHeaderImage(siteInfo.options.header_image);
          } else if (siteInfo?.header_image) {
            setHeaderImage(siteInfo.header_image);
          } else {
            // Use fallback image
            setHeaderImage(HEADER_CONFIG.FALLBACK_IMAGE);
          }
        } catch (error) {
          console.error('Error fetching header image:', error);
          // Use fallback image on error
          setHeaderImage(HEADER_CONFIG.FALLBACK_IMAGE);
        }
      };
      
      fetchHeaderImage();
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