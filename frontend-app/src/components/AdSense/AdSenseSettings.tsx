'use client';

import React, { useState } from 'react';

interface AdSenseSettingsProps {
  className?: string;
}

export default function AdSenseSettings({ className = '' }: AdSenseSettingsProps) {
  const [settings, setSettings] = useState({
    autoAds: true,
    personalizedAds: false,
    restrictedAds: false,
    adBlockingRecovery: true
  });

  const handleSettingChange = (setting: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <h5 className="card-title mb-0">
          <i className="bi bi-gear me-2"></i>
          AdSense Settings
        </h5>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-12">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="autoAds"
                checked={settings.autoAds}
                onChange={(e) => handleSettingChange('autoAds', e.target.checked)}
              />
              <label className="form-check-label" htmlFor="autoAds">
                Auto ads
                <small className="text-muted d-block">
                  Let AdSense automatically place ads on your site
                </small>
              </label>
            </div>
          </div>

          <div className="col-12">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="personalizedAds"
                checked={settings.personalizedAds}
                onChange={(e) => handleSettingChange('personalizedAds', e.target.checked)}
              />
              <label className="form-check-label" htmlFor="personalizedAds">
                Personalized ads
                <small className="text-muted d-block">
                  Show personalized ads based on user behavior
                </small>
              </label>
            </div>
          </div>

          <div className="col-12">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="restrictedAds"
                checked={settings.restrictedAds}
                onChange={(e) => handleSettingChange('restrictedAds', e.target.checked)}
              />
              <label className="form-check-label" htmlFor="restrictedAds">
                Restricted ads
                <small className="text-muted d-block">
                  Limit ads to family-safe content only
                </small>
              </label>
            </div>
          </div>

          <div className="col-12">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="adBlockingRecovery"
                checked={settings.adBlockingRecovery}
                onChange={(e) => handleSettingChange('adBlockingRecovery', e.target.checked)}
              />
              <label className="form-check-label" htmlFor="adBlockingRecovery">
                Ad blocking recovery
                <small className="text-muted d-block">
                  Show alternative content when ads are blocked
                </small>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-top">
          <div className="d-flex gap-2">
            <button className="btn btn-primary btn-sm">
              <i className="bi bi-save me-1"></i>
              Save Settings
            </button>
            <button className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-arrow-clockwise me-1"></i>
              Reset to Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}