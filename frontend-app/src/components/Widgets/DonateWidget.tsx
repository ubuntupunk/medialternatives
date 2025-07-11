import React from 'react';
import { DonateWidgetProps } from '@/types';

/**
 * Donate widget component with a PayPal donate button
 */
const DonateWidget: React.FC<DonateWidgetProps> = ({
  title = 'Support Us',
  paypalHostedButtonId, // Changed from paypalEmail
  buttonText = 'Donate with PayPal'
}) => {
  if (!paypalHostedButtonId) {
    console.warn('PayPal hosted button ID is not provided for DonateWidget.');
    return null;
  }

  return (
    <div className="widget donate-widget">
      <h3 className="widget-title">{title}</h3>
      <div className="donate-button-container text-center">
        <form action="https://www.paypal.com/donate" method="post" target="_top">
          <input type="hidden" name="hosted_button_id" value={paypalHostedButtonId} />
          <input
            type="image"
            src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif"
            name="submit"
            title="PayPal - The safer, easier way to pay online!"
            alt={buttonText}
            style={{ border: 0 }}
            className="mx-auto d-block"
          />
          <img alt="" src="https://www.paypal.com/en_ZA/i/scr/pixel.gif" width="1" height="1" style={{ border: 0 }} />
        </form>
      </div>
    </div>
  );
};

export default DonateWidget;
