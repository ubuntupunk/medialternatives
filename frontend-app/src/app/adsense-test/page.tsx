import React from 'react';
import AdSenseWidget, { AdSenseFeed } from '@/components/Widgets/AdSenseWidget';
import { ADSENSE_CLIENT_ID, ADSENSE_SLOTS } from '@/lib/constants';

/**
 * AdSense Test Page
 * Manual testing page to verify AdSense widgets are working correctly
 */
export default function AdSenseTestPage() {
  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">AdSense Widget Test Page</h1>
          <p className="lead mb-5">
            This page tests the AdSense widgets to ensure they&apos;re loading and displaying correctly.
          </p>
        </div>
      </div>

      {/* Test Configuration Display */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title mb-0">AdSense Configuration</h3>
            </div>
            <div className="card-body">
              <dl className="row">
                <dt className="col-sm-3">Client ID:</dt>
                <dd className="col-sm-9"><code>{ADSENSE_CLIENT_ID}</code></dd>
                
                <dt className="col-sm-3">Main Slot:</dt>
                <dd className="col-sm-9"><code>{ADSENSE_SLOTS.MAIN}</code></dd>
                
                <dt className="col-sm-3">Feed Slot:</dt>
                <dd className="col-sm-9"><code>{ADSENSE_SLOTS.FEED}</code></dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Main AdSense Widget Test */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title mb-0">Main AdSense Widget</h3>
              <small className="text-muted">Default widget with main slot</small>
            </div>
            <div className="card-body">
              <div className="border p-3 bg-light">
                <AdSenseWidget />
              </div>
              <div className="mt-3">
                <small className="text-muted">
                  <strong>Expected:</strong> AdSense ad should load here with slot {ADSENSE_SLOTS.MAIN}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feed AdSense Widget Test */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title mb-0">Feed AdSense Widget</h3>
              <small className="text-muted">Specialized feed widget</small>
            </div>
            <div className="card-body">
              <div className="border p-3 bg-light">
                <AdSenseFeed />
              </div>
              <div className="mt-3">
                <small className="text-muted">
                  <strong>Expected:</strong> Feed-style AdSense ad should load here with slot {ADSENSE_SLOTS.FEED}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom AdSense Widget Test */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title mb-0">Custom AdSense Widget</h3>
              <small className="text-muted">Widget with custom properties</small>
            </div>
            <div className="card-body">
              <div className="border p-3 bg-light">
                <AdSenseWidget 
                  adSlot={ADSENSE_SLOTS.MAIN}
                  adFormat="rectangle"
                  adLayout="text-only"
                  className="custom-test-ad"
                />
              </div>
              <div className="mt-3">
                <small className="text-muted">
                  <strong>Expected:</strong> AdSense ad with custom format (rectangle, text-only)
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Information */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title mb-0">Debug Information</h3>
            </div>
            <div className="card-body">
              <h5>Browser Console Checks:</h5>
              <ol>
                <li>Open browser developer tools (F12)</li>
                <li>Check Console tab for any AdSense errors</li>
                <li>Look for AdSense script loading: <code>adsbygoogle.js</code></li>
                <li>Verify <code>window.adsbygoogle</code> array exists</li>
              </ol>
              
              <h5 className="mt-4">Network Tab Checks:</h5>
              <ol>
                <li>Look for requests to <code>googlesyndication.com</code></li>
                <li>Verify AdSense script loads successfully (200 status)</li>
                <li>Check for ad content requests</li>
              </ol>

              <h5 className="mt-4">Visual Checks:</h5>
              <ol>
                <li>AdSense containers should be visible above</li>
                <li>Ads should load within a few seconds</li>
                <li>No &quot;Ad blocked&quot; or error messages</li>
                <li>Responsive behavior on different screen sizes</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Script Check */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title mb-0">Runtime Script Check</h3>
            </div>
            <div className="card-body">
              <div id="script-status" className="alert alert-info">
                Checking AdSense script status...
              </div>
            </div>
          </div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{
        __html: `
          setTimeout(() => {
            const statusDiv = document.getElementById('script-status');
            if (statusDiv) {
              const hasScript = document.querySelector('script[src*="adsbygoogle.js"]');
              const hasAdsByGoogle = typeof window.adsbygoogle !== 'undefined';
              
              let status = '';
              if (hasScript) {
                status += '✅ AdSense script loaded\\n';
              } else {
                status += '❌ AdSense script not found\\n';
              }
              
              if (hasAdsByGoogle) {
                status += '✅ window.adsbygoogle available\\n';
                status += 'Array length: ' + window.adsbygoogle.length;
              } else {
                status += '❌ window.adsbygoogle not available';
              }
              
              statusDiv.innerHTML = '<pre>' + status + '</pre>';
              statusDiv.className = hasScript && hasAdsByGoogle ? 'alert alert-success' : 'alert alert-warning';
            }
          }, 2000);
        `
      }} />
    </div>
  );
}