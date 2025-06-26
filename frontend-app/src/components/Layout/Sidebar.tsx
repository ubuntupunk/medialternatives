import React from 'react';
import { SidebarProps } from '@/types';
import { LAYOUT_CONFIG } from '@/lib/constants';
import CategoryCloud from '../Widgets/CategoryCloud';
import AuthorWidget from '../Widgets/AuthorWidget';
import AdSenseWidget from '../Widgets/AdSenseWidget';

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
    <AdSenseWidget key="adsense" />
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