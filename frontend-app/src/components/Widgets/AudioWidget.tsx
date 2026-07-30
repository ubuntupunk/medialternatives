'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface AudioWidgetProps {
  audioId?: string;
  username?: string;
  title?: string;
  className?: string;
  width?: number;
  height?: number;
  theme?: 'light' | 'dark';
  showCover?: boolean;
  showFooter?: boolean;
  showAuthor?: boolean;
  showWatermark?: boolean;
}

const AudioWidget: React.FC<AudioWidgetProps> = ({
  audioId = '1872083023586308',
  username = 'ubuntupunk',
  title = 'Listen on Audio.com',
  className = '',
  width = 500,
  height = 235,
  theme = 'light',
  showCover = true,
  showFooter = true,
  showAuthor = true,
  showWatermark = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (scriptLoaded) return;

    const existingScript = document.querySelector(
      'script[src="https://audio.com/embed.js"]'
    ) as HTMLScriptElement | null;

    if (existingScript) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://audio.com/embed.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      const el = document.querySelector(
        'script[src="https://audio.com/embed.js"]'
      );
      if (el && scriptLoaded) {
        el.remove();
      }
    };
  }, [scriptLoaded]);

  const embedUrl = new URL(
    `https://audio.com/embed/v2/audio/${audioId}`
  );
  embedUrl.searchParams.set('theme', theme);
  embedUrl.searchParams.set('layout', 'fixed');
  embedUrl.searchParams.set('cover', showCover.toString());
  embedUrl.searchParams.set('footer', showFooter.toString());
  embedUrl.searchParams.set('author', showAuthor.toString());
  embedUrl.searchParams.set('watermark', showWatermark.toString());

  return (
    <div className={`widget audio-widget ${className}`}>
      <h3 className="widget-title">{title}</h3>
      <div className="audio-embed-container" ref={containerRef}>
        <div style={{ width: `${width}px`, maxWidth: '100%' }}>
          <iframe
            src={embedUrl.toString()}
            style={{
              display: 'block',
              borderRadius: '1px',
              border: 'none',
              height: `${height}px`,
              width: `${width}px`,
              maxWidth: '100%',
            }}
            loading="lazy"
            data-audiocom-embed
          ></iframe>
          <a
            href={`https://audio.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textAlign: 'center',
              display: 'block',
              color: '#A4ABB6',
              fontSize: '12px',
              fontFamily: 'sans-serif',
              lineHeight: '16px',
              marginTop: '8px',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            @{username}
          </a>
        </div>
      </div>
    </div>
  );
};

export default AudioWidget;