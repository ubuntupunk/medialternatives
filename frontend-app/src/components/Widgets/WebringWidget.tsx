import React from 'react';
import { WebringWidgetProps } from '@/types';
import styles from './WebringWidget.module.css';

const WebringWidget: React.FC<WebringWidgetProps> = ({
  title = 'Webring',
  webringUrl = 'https://meshring.netlify.app'
}) => {
  return (
    <div className={`widget ${styles.webringWidget}`}>
      <h3 className={styles.widgetTitle}>{title}</h3>
      <div className={styles.webringBanner}>
        <div className={styles.webringImage}>
          <img 
            src="https://meshring.netlify.app/assets/meshring.png" 
            alt="MuizenMesh Webring" 
            className={styles.webringLogo}
          />
        </div>
        <p className={styles.webringDescription}>
          Member of the <a href={webringUrl}>MuizenMesh Webring</a>
        </p>
        <div className={styles.webringLinks}>
          <a href={`${webringUrl}/prev`} className={styles.webringLink}>
            &larr; Previous
          </a>
          <a href={`${webringUrl}/random`} className={styles.webringLink}>
            Random
          </a>
          <a href={`${webringUrl}/next`} className={styles.webringLink}>
            Next &rarr;
          </a>
        </div>
      </div>
    </div>
  );
};

export default WebringWidget;