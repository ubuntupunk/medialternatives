'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function AvatarDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { requireAuth, isLoading, isAuthenticated } = useAuth();
  
  // Require authentication for this layout
  requireAuth();

  if (isLoading) {
    return (
      <div className="container mt-4">
        <div className="text-center p-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via requireAuth
  }

  return <>{children}</>;
}