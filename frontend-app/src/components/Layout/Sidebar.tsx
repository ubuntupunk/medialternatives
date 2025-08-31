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

/**
 * Sidebar Component
 *
 * Displays a collection of widgets in the sidebar area of the application.
 * Includes search, author info, categories, ads, donation, webring, and creative commons widgets.
 * Automatically filters out ads on dashboard pages.
 *
 * @component
 * @param {SidebarProps} props - The component props
 * @returns {JSX.Element} The rendered sidebar
 *
 * @example
 * ```tsx
 * <Sidebar
 *   className="custom-sidebar"
 *   widgets={[
 *     <SearchWidget key="search" />,
 *     <AuthorWidget key="author" authorId={1} />
 *   ]}
 * />
 * ```
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
