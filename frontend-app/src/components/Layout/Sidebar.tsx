'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProps } from '@/types';
import { LAYOUT_CONFIG } from '@/lib/constants';
import SearchWidget from '../Widgets/SearchWidget';
import CategoryCloudEnhanced from '../Widgets/CategoryCloudEnhanced';
import AuthorWidget from '../Widgets/AuthorWidget';
import AdSenseWidget from '../Widgets/AdSenseWidget';
import CreativeCommonsWidget from '../Widgets/CreativeCommonsWidget';
import DonateWidget from '../Widgets/DonateWidget';
import WebringWidget from '../widgets-extra/WebringWidget';

/*
 * Sidebar component that displays widgets
 */
const Sidebar: React.FC<SidebarProps> = ({
  className = '',
  widgets = []
}) => {
  const pathname = usePathname();
  const isDashboardPage = pathname.startsWith('/dashboard');

  // Default widgets if none provided
  const defaultWidgets = widgets.length > 0 ? widgets : [
    <SearchWidget key="search" />,
    <AuthorWidget key="author" authorId={1} />,
    <CategoryCloudEnhanced key="categories" />,
    !isDashboardPage && <AdSenseWidget key="adsense" />,
    <DonateWidget key="donate" paypalHostedButtonId={process.env.NEXT_PUBLIC_PAYPAL_HOSTED_BUTTON_ID || ''} />,
    <WebringWidget key="webring" />,
    <CreativeCommonsWidget key="creative-commons" />
  ].filter(Boolean); // Filter out false values

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
