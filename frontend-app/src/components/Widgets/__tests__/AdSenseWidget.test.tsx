/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdSenseWidget, { AdSenseFeed } from '../AdSenseWidget';
import { ADSENSE_CLIENT_ID, ADSENSE_SLOTS } from '@/lib/constants';

// Mock the window.adsbygoogle
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

describe('AdSenseWidget', () => {
  beforeEach(() => {
    // Reset DOM and window.adsbygoogle before each test
    document.head.innerHTML = '';
    delete (window as any).adsbygoogle;
    
    // Mock console.error to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders AdSense widget with correct attributes', () => {
    render(<AdSenseWidget />);
    
    const adsenseElement = screen.getByRole('banner', { hidden: true }) || 
                          document.querySelector('ins.adsbygoogle');
    
    expect(adsenseElement).toBeInTheDocument();
    expect(adsenseElement).toHaveAttribute('data-ad-client', ADSENSE_CLIENT_ID);
    expect(adsenseElement).toHaveAttribute('data-ad-slot', ADSENSE_SLOTS.MAIN);
    expect(adsenseElement).toHaveAttribute('data-ad-format', 'fluid');
    expect(adsenseElement).toHaveAttribute('data-ad-layout', 'in-article');
    expect(adsenseElement).toHaveAttribute('data-full-width-responsive', 'true');
  });

  it('renders with custom props', () => {
    const customSlot = '1234567890';
    const customClient = 'ca-pub-test';
    const customFormat = 'rectangle';
    const customLayout = 'text-only';
    
    render(
      <AdSenseWidget
        adSlot={customSlot}
        adClient={customClient}
        adFormat={customFormat}
        adLayout={customLayout}
      />
    );
    
    const adsenseElement = document.querySelector('ins.adsbygoogle');
    
    expect(adsenseElement).toHaveAttribute('data-ad-client', customClient);
    expect(adsenseElement).toHaveAttribute('data-ad-slot', customSlot);
    expect(adsenseElement).toHaveAttribute('data-ad-format', customFormat);
    expect(adsenseElement).toHaveAttribute('data-ad-layout', customLayout);
  });

  it('loads AdSense script when not already present', async () => {
    render(<AdSenseWidget />);
    
    await waitFor(() => {
      const scripts = document.querySelectorAll('script');
      const adsenseScript = Array.from(scripts).find(script => 
        script.src.includes('googlesyndication.com/pagead/js/adsbygoogle.js')
      );
      
      expect(adsenseScript).toBeInTheDocument();
      expect(adsenseScript).toHaveAttribute('async');
      expect(adsenseScript).toHaveAttribute('crossorigin', 'anonymous');
    });
  });

  it('does not load script multiple times', () => {
    // Mock existing script
    const existingScript = document.createElement('script');
    existingScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
    document.head.appendChild(existingScript);
    
    window.adsbygoogle = [];
    
    render(<AdSenseWidget />);
    
    const scripts = document.querySelectorAll('script[src*="adsbygoogle.js"]');
    expect(scripts).toHaveLength(1);
  });

  it('pushes ad to adsbygoogle when available', async () => {
    window.adsbygoogle = [];
    const pushSpy = jest.spyOn(window.adsbygoogle, 'push');
    
    render(<AdSenseWidget />);
    
    await waitFor(() => {
      expect(pushSpy).toHaveBeenCalledWith({});
    });
  });

  it('handles AdSense errors gracefully', async () => {
    window.adsbygoogle = {
      push: jest.fn(() => {
        throw new Error('AdSense error');
      })
    };
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<AdSenseWidget />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('AdSense error:', expect.any(Error));
    });
  });

  it('applies custom className', () => {
    const customClass = 'custom-adsense-class';
    render(<AdSenseWidget className={customClass} />);
    
    const widgetElement = document.querySelector('.adsense-widget');
    expect(widgetElement).toHaveClass(customClass);
  });

  it('clears existing ad content to prevent conflicts', async () => {
    // Create existing ins element
    const existingIns = document.createElement('ins');
    existingIns.className = 'adsbygoogle';
    existingIns.setAttribute('data-ad-slot', ADSENSE_SLOTS.MAIN);
    existingIns.innerHTML = 'existing content';
    document.body.appendChild(existingIns);
    
    window.adsbygoogle = [];
    const pushSpy = jest.spyOn(window.adsbygoogle, 'push');
    
    render(<AdSenseWidget />);
    
    await waitFor(() => {
      expect(pushSpy).toHaveBeenCalled();
      expect(existingIns.innerHTML).toBe('');
    });
    
    document.body.removeChild(existingIns);
  });
});

describe('AdSenseFeed', () => {
  it('renders with feed-specific configuration', () => {
    render(<AdSenseFeed />);
    
    const adsenseElement = document.querySelector('ins.adsbygoogle');
    
    expect(adsenseElement).toHaveAttribute('data-ad-slot', ADSENSE_SLOTS.FEED);
    expect(adsenseElement).toHaveAttribute('data-ad-layout', '-5c+cv+44-et+57');
    expect(adsenseElement).toHaveAttribute('data-ad-format', 'fluid');
  });

  it('accepts custom props except adSlot and adLayout', () => {
    const customClient = 'ca-pub-test';
    const customClass = 'feed-custom-class';
    
    render(<AdSenseFeed adClient={customClient} className={customClass} />);
    
    const adsenseElement = document.querySelector('ins.adsbygoogle');
    const widgetElement = document.querySelector('.adsense-widget');
    
    expect(adsenseElement).toHaveAttribute('data-ad-client', customClient);
    expect(widgetElement).toHaveClass(customClass);
    // Should still use feed-specific values
    expect(adsenseElement).toHaveAttribute('data-ad-slot', ADSENSE_SLOTS.FEED);
    expect(adsenseElement).toHaveAttribute('data-ad-layout', '-5c+cv+44-et+57');
  });
});