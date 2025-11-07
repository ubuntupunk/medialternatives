'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileLayout({
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
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-body text-center p-5">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted">Checking authentication...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via requireAuth
  }

  return <>{children}</>;
}