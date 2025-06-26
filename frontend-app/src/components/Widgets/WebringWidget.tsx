import React, { useEffect } from 'react';
import { WebringWidgetProps } from '@/types';

/**
 * Webring widget component
 * Displays links for a webring and loads an external script
 */
const WebringWidget: React.FC<WebringWidgetProps> = ({
  title = 'Webring',
  webringUrl = 'https://meshring.netlify.app/'
}) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `${webringUrl}/embed.js`;
    script.async = true;
    script.charset = 'utf-8';
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [webringUrl]);

  return (
    <div className="widget webring-widget">
      <h3 className="widget-title">{title}</h3>
      <div className="webring-banner">
        <p>Member of the <a href={webringUrl}>MuizenMesh Webring</a> webring</p>
        <a href={`${webringUrl}/prev`}>Previous</a>
        <a href={`${webringUrl}/random`}>Random</a>
        <a href={`${webringUrl}/next`}>Next</a>
      </div>
    </div>
  );
};

export default WebringWidget;
