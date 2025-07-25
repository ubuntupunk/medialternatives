// Example usage of WebringWidget with different themes and configurations

import React from 'react';
import WebringWidget from './WebringWidget';

// Example 1: Default theme
export const DefaultWidget = () => (
  <WebringWidget 
    title="Community Links"
    webringUrl="https://meshring.netlify.app"
  />
);

// Example 2: Minimal theme, small size
export const MinimalWidget = () => (
  <WebringWidget 
    title="Webring"
    theme="minimal"
    size="small"
    showDescription={false}
    webringUrl="https://meshring.netlify.app"
  />
);

// Example 3: Ocean theme, large size
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