/**
 * WebringWidget Examples and Usage Patterns
 *
 * This file contains example implementations of the WebringWidget component
 * with different themes, sizes, and configuration options.
 * Use these examples as reference for implementing the widget in your application.
 *
 * @example
 * ```tsx
 * import { DefaultWidget, OceanWidget } from '@/components/widgets-extra/examples';
 *
 * // Use in your component
 * <DefaultWidget />
 * <OceanWidget />
 * ```
 */

import React from 'react';
import WebringWidget from './WebringWidget';

/**
 * Default Webring Widget Example
 *
 * Basic implementation with default theme and standard configuration.
 * Shows the most common usage pattern.
 *
 * @component
 * @returns {JSX.Element} WebringWidget with default configuration
 * @example
 * ```tsx
 * <DefaultWidget />
 * ```
 */
export const DefaultWidget = () => (
  <WebringWidget
    title="Community Links"
    webringUrl="https://meshring.netlify.app"
  />
);

/**
 * Minimal Webring Widget Example
 *
 * Compact widget with minimal theme, small size, and no description.
 * Perfect for sidebar implementations where space is limited.
 *
 * @component
 * @returns {JSX.Element} WebringWidget with minimal configuration
 * @example
 * ```tsx
 * <MinimalWidget />
 * ```
 */
export const MinimalWidget = () => (
  <WebringWidget
    title="Webring"
    theme="minimal"
    size="small"
    showDescription={false}
    webringUrl="https://meshring.netlify.app"
  />
);

/**
 * Ocean Theme Webring Widget Example
 *
 * Large widget with ocean theme and full description.
 * Showcases the ocean color scheme with larger size for better visibility.
 *
 * @component
 * @returns {JSX.Element} WebringWidget with ocean theme and large size
 * @example
 * ```tsx
 * <OceanWidget />
 * ```
 */
export const OceanWidget = () => (
  <WebringWidget
    title="MuizenMesh Community"
    theme="ocean"
    size="large"
    webringUrl="https://meshring.netlify.app"
  />
);

// Example 4: Sunset theme, no image
export const SunsetWidget = () => (
  <WebringWidget 
    title="Community Sites"
    theme="sunset"
    showImage={false}
    webringUrl="https://meshring.netlify.app"
  />
);

// Example 5: Dark theme
export const DarkWidget = () => (
  <WebringWidget 
    title="MuizenMesh Webring"
    theme="dark"
    webringUrl="https://meshring.netlify.app"
  />
);

// Example 6: Custom styling with className
export const CustomWidget = () => (
  <WebringWidget 
    title="Custom Styled"
    theme="ocean"
    className="my-custom-webring"
    webringUrl="https://meshring.netlify.app"
  />
);

// Example showcase component
export const WidgetShowcase = () => (
  <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
    <div>
      <h3>Default Theme</h3>
      <DefaultWidget />
    </div>
    
    <div>
      <h3>Minimal Theme (Small)</h3>
      <MinimalWidget />
    </div>
    
    <div>
      <h3>Ocean Theme (Large)</h3>
      <OceanWidget />
    </div>
    
    <div>
      <h3>Sunset Theme (No Image)</h3>
      <SunsetWidget />
    </div>
    
    <div>
      <h3>Dark Theme</h3>
      <DarkWidget />
    </div>
    
    <div>
      <h3>Custom Styled</h3>
      <CustomWidget />
    </div>
  </div>
);