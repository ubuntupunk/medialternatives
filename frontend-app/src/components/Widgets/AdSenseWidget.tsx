"use client";

import React, { useEffect } from 'react';
import { AdSenseWidgetProps } from '@/types';
import { ADSENSE_CLIENT_ID, ADSENSE_SLOTS } from '@/lib/constants';

/**
 * AdSense widget component
 * Implements AdSense ads based on the original site's configuration
 */
const AdSenseWidget: React.FC<AdSenseWidgetProps> = ({
  adSlot = ADSENSE_SLOTS.MAIN,
  adClient = ADSENSE_CLIENT_ID,
  adFormat = 'fluid',
  adLayout = 'in-article',
  className = ''
}) => {
  useEffect(() => {
    // Load AdSense script if not already loaded
    if (typeof window !== 'undefined' && !window.adsbygoogle) {
      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }
    
    // Push ad after script is loaded
    const pushAd = () => {
      try {
        if (window.adsbygoogle && typeof window.adsbygoogle.push === 'function') {
          // Clear existing ad content to prevent "already have ads" error
          const insElement = document.querySelector(`ins.adsbygoogle[data-ad-slot="${adSlot}"]`);
          if (insElement) {
            insElement.innerHTML = '';
          }
          window.adsbygoogle.push({});
        }
      } catch (error) {
        console.error('AdSense error:', error);
      }
    };
    
    // Check if script is already loaded
    if (typeof window !== 'undefined' && window.adsbygoogle && typeof window.adsbygoogle.push === 'function') {
      pushAd();
    } else {
      // Wait for script to load
      const scriptLoadTimer = setTimeout(pushAd, 100);
      return () => clearTimeout(scriptLoadTimer);
    }
  }, [adClient, adSlot]);

  return (
    <div className={`widget adsense-widget ${className}`}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          textAlign: 'center',
          background: 'transparent'
        }}
        data-ad-layout={adLayout}
        data-ad-format={adFormat}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
      />
    </div>
  );
};

/**
 * AdSense Feed component for in-content ads
 * Uses the feed ad slot and specific layout
 */
export const AdSenseFeed: React.FC<Omit<AdSenseWidgetProps, 'adSlot' | 'adLayout'>> = (props) => {
  return (
    <AdSenseWidget
      {...props}
      adSlot={ADSENSE_SLOTS.FEED}
      adLayout="-5c+cv+44-et+57"
      adFormat="fluid"
    />
  );
};

export default AdSenseWidget;
