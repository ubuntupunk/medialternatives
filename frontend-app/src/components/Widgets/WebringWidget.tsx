import React from 'react';
import Image from 'next/image';
import { WebringWidgetProps } from '@/types';
import styles from './WebringWidget.module.css';

const WebringWidget: React.FC<WebringWidgetProps> = ({
  title = 'Webring',
  webringUrl = 'https://meshring.netlify.app'
}) => {
  return (
    <div className={`widget ${styles.webringWidget}`}>
      <h3 className={styles.widgetTitle}>{title}</h3>
      <div className={styles.webringContent}>
        <div className={styles.surferImageContainer}>
          <Image
            src="/images/surfer.jpg"
            alt="Surfer"
            width={60}
            height={60}
            className={styles.surferImage}
          />
        </div>
        <div className={styles.webringText}>
          <p className={styles.webringIntro}>Member of the</p>
          <h4 className={styles.webringName}>
            <a href={webringUrl}>MuizenMesh Webring</a>
          </h4>
          <p className={styles.webringMembers}>A community of independent websites</p>
        </div>
      </div>
      <div className={styles.webringNavigation}>
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
  );
};

export default WebringWidget;