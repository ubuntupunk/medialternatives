"use client";

import React from 'react';
import Image from 'next/image';

export interface CreativeCommonsWidgetProps {
  title?: string;
  className?: string;
}

/**
 * Creative Commons copyright widget component
 * Displays Creative Commons license information for South Africa 2.5 license
 */
const CreativeCommonsWidget: React.FC<CreativeCommonsWidgetProps> = ({
  title = 'Creative Commons Licence',
  className = ''
}) => {
  return (
    <div className={`widget creative-commons-widget ${className}`} style={{ marginTop: '30px' }}>
      <h3 className="widget-title">{title}</h3>
      <div className="cc-license-content">
        <div className="cc-license-image" style={{ marginBottom: '10px', textAlign: 'center' }}>
          <a 
            href="https://creativecommons.org/licenses/by-nc-nd/2.5/za/"
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Image
              src="/images/88x31.png"
              alt="Creative Commons Attribution-NonCommercial-NoDerivs 2.5 South Africa License"
              width={88}
              height={31}
              style={{ border: 'none' }}
            />
          </a>
        </div>
        <p style={{ fontSize: '0.85em', lineHeight: '1.4' }}>
          This work is licensed under a{' '}
          <a 
            href="https://creativecommons.org/licenses/by-nc-nd/2.5/za/"
            target="_blank" 
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            Creative Commons Attribution-NonCommercial-NoDerivs 2.5 South Africa License
          </a>.
        </p>
      </div>
    </div>
  );
};

export default CreativeCommonsWidget;