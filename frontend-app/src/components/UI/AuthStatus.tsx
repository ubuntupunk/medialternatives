'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Avatar from '@/components/UI/Avatar';

interface AuthStatusProps {
  className?: string;
  showAvatar?: boolean;
}

/**
 * Authentication status component
 * Shows login/logout buttons and user info
 */
const AuthStatus: React.FC<AuthStatusProps> = ({ 
  className = '',
  showAvatar = true 
}) => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className={`auth-status ${className}`}>
        <div className="placeholder-glow">
          <span className="placeholder col-4"></span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={`auth-status ${className}`}>
        <Link href="/auth/login" className="btn btn-outline-primary btn-sm">
          <i className="bi bi-box-arrow-in-right me-1"></i>
          Admin Login
        </Link>
      </div>
    );
  }

  return (
    <div className={`auth-status d-flex align-items-center gap-2 ${className}`}>
      {showAvatar && (
        <Avatar
          name={user?.username || 'Admin'}
          size={32}
          className="border"
        />
      )}
      
      <div className="dropdown">
        <button
          className="btn btn-outline-secondary btn-sm dropdown-toggle"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          {user?.username || 'Admin'}
        </button>
        
        <ul className="dropdown-menu dropdown-menu-end">
          <li>
            <h6 className="dropdown-header">
              <i className="bi bi-person-circle me-1"></i>
              {user?.username}
            </h6>
          </li>
          <li><hr className="dropdown-divider" /></li>
          
          <li>
            <Link href="/profile" className="dropdown-item">
              <i className="bi bi-person me-2"></i>
              Profile
            </Link>
          </li>
          
          <li>
            <Link href="/avatar-demo" className="dropdown-item">
              <i className="bi bi-image me-2"></i>
              Avatar Manager
            </Link>
          </li>
          
          {user?.isAdmin && (
            <>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <span className="dropdown-item-text">
                  <i className="bi bi-shield-check me-2 text-success"></i>
                  <small className="text-success">Admin Access</small>
                </span>
              </li>
            </>
          )}
          
          <li><hr className="dropdown-divider" /></li>
          
          <li>
            <button
              onClick={logout}
              className="dropdown-item text-danger"
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              Sign Out
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AuthStatus;