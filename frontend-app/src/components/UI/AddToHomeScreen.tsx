"use client";

import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface AddToHomeScreenProps {
  className?: string;
}

/**
 * Add to Home Screen component
 * Shows a bottom popup on mobile devices prompting users to install the PWA
 */
const AddToHomeScreen: React.FC<AddToHomeScreenProps> = ({ className = '' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running on iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Check if already dismissed
    const dismissed = localStorage.getItem('addToHomeScreenDismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);

    // Don't show if already installed or recently dismissed
    if (standalone || (dismissed && dismissedTime > oneDayAgo)) {
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a short delay
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    // For iOS devices, show manual instructions
    if (iOS && !standalone) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('addToHomeScreenDismissed', Date.now().toString());
  };

  // Don't show if already installed or no prompt available
  if (!showPrompt || isStandalone || (!deferredPrompt && !isIOS)) {
    return null;
  }

  return (
    <div 
      className={`add-to-home-screen-popup ${className}`}
      style={{
        position: 'fixed',
        bottom: '0',
        left: '0',
        right: '0',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e9ecef',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
        padding: '1rem',
        zIndex: 1050,
        transform: showPrompt ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s ease-in-out'
      }}
    >
      <div className="container">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center">
            <div className="me-3">
              <svg 
                width="24" 
                height="24" 
                fill="currentColor" 
                viewBox="0 0 16 16"
                style={{ color: '#0d6efd' }}
              >
                <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5z"/>
              </svg>
            </div>
            <div>
              <div 
                style={{
                  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#212529',
                  marginBottom: '2px'
                }}
              >
                Install Medialternatives
              </div>
              <div 
                style={{
                  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                  fontSize: '12px',
                  color: '#6c757d'
                }}
              >
                {isIOS 
                  ? 'Tap Share → Add to Home Screen' 
                  : 'Get quick access from your home screen'
                }
              </div>
            </div>
          </div>
          
          <div className="d-flex gap-2">
            <button
              onClick={handleDismiss}
              className="btn btn-sm btn-outline-secondary"
              style={{
                fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                fontSize: '12px',
                padding: '0.25rem 0.75rem'
              }}
            >
              Not now
            </button>
            
            {!isIOS && (
              <button
                onClick={handleInstallClick}
                className="btn btn-sm btn-primary"
                style={{
                  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                  fontSize: '12px',
                  padding: '0.25rem 0.75rem',
                  fontWeight: '600'
                }}
              >
                Install
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToHomeScreen;