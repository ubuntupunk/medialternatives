import React from 'react';
import { DonateWidgetProps } from '@/types';
import styles from './DonateWidgetImproved.module.css';

const DonateWidgetImproved: React.FC<DonateWidgetProps> = ({
  title = 'Support Our Work',
  paypalHostedButtonId,
  buttonText = 'Donate Now'
}) => {
  if (!paypalHostedButtonId) {
    console.warn('PayPal hosted button ID is not provided for DonateWidgetImproved.');
    return null;
  }

  return (
    <div className={styles.widget}>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>
          Your support helps us continue creating free, independent content.
        </p>
        <div className={styles.buttonWrapper}>
          <form action="https://www.paypal.com/donate" method="post" target="_top">
            <input type="hidden" name="hosted_button_id" value={paypalHostedButtonId} />
            <button type="submit" className={styles.donateButton}>
              <span className={styles.buttonIcon}>♥</span>
              {buttonText}
            </button>
          </form>
        </div>
        <p className={styles.secureText}>
          <svg className={styles.lockIcon} viewBox="0 0 24 24" width="14" height="14">
            <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
          </svg>
          Secure payment via PayPal
        </p>
      </div>
    </div>
  );
};

export default DonateWidgetImproved;
