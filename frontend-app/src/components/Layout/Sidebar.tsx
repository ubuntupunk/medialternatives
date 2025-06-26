import React from 'react';
import { SidebarProps } from '@/types';
import { LAYOUT_CONFIG } from '@/lib/constants';
import CategoryCloud from '../Widgets/CategoryCloud';
import AuthorWidget from '../Widgets/AuthorWidget';
import AdSenseWidget from '../Widgets/AdSenseWidget';
import DonateWidget from '../Widgets/DonateWidget';

/**
 * Sidebar component that displays widgets
 */
const Sidebar: React.FC<SidebarProps> = ({
  className = '',
  widgets = []
}) => {
  // Default widgets if none provided
  const defaultWidgets = widgets.length > 0 ? widgets : [
    <AuthorWidget key="author" authorId={1} />,
    <CategoryCloud key="categories" />,
    <AdSenseWidget key="adsense" />,
    <DonateWidget key="donate" paypalEmail={process.env.NEXT_PUBLIC_PAYPAL_EMAIL || ''} />
  ];

  return (
    <aside 
      id="secondary" 
      className={`widget-area ${LAYOUT_CONFIG.SIDEBAR_COLUMN_CLASS} ${className}`}
      role="complementary"
    >
      {defaultWidgets.map((widget, index) => (
        <React.Fragment key={`widget-${index}`}>
          {widget}
        </React.Fragment>
      ))}
    </aside>
  );
};

export default Sidebar;
