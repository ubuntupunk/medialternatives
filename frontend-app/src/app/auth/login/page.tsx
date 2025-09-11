'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

function LoginForm() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/profile';

  // Check if already authenticated
  useEffect(() => {
    const checkAuth = () => {
      const authCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-session='));
      
      if (authCookie) {
        try {
          const sessionData = JSON.parse(decodeURIComponent(authCookie.split('=')[1]));
          if (Date.now() < sessionData.expires) {
            // Already authenticated, redirect
            router.push(callbackUrl);
            return;
          }
        } catch {
          // Invalid session, continue with login
        }
      }
    };

    checkAuth();
  }, [router, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful, redirect
        router.push(callbackUrl);
        router.refresh(); // Refresh to update middleware
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark py-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-11 col-sm-8 col-md-6 col-lg-4 col-xl-3">
            <div className="card shadow login-card" style={{ margin: '0 auto' }}>
              <div className="card-body d-flex flex-column" style={{ minHeight: '320px', paddingTop: '2.5rem' }}>
                {/* Site Logo/Header */}
                <div className="text-center mb-3">
                  <Image
                    src="/images/dav-icon.png"
                    alt="Medialternatives"
                    width={70}
                    height={70}
                    className="mb-2"
                  />
                  <h2 className="h4 text-primary mb-1">Medialternatives</h2>
                  <p className="text-muted small mb-0">Admin Access</p>
                </div>

                {/* Login Form - takes available space */}
                <div className="flex-grow-1 d-flex flex-column">
                  <form onSubmit={handleSubmit} className="flex-grow-1 d-flex flex-column">
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">
                        <i className="bi bi-lock me-2"></i>
                        Admin Password
                      </label>
                      <div className="input-group">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className={`form-control ${error ? 'is-invalid' : ''}`}
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter admin password"
                          required
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary border-start-0"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                          title={showPassword ? 'Hide password' : 'Show password'}
                          style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
                        >
                          <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                        </button>
                      </div>
                      {error && (
                        <div className="invalid-feedback d-block">
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          {error}
                        </div>
                      )}
                    </div>

                    {/* Sign In Button - positioned at bottom of form */}
                    <div className="mt-auto">
                      <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={isLoading || !password.trim()}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Signing in...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-box-arrow-in-right me-2"></i>
                            Sign In
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Back to Site */}
                <div className="mt-3 text-center">
                  <Link href="/" className="btn btn-outline-secondary btn-sm px-3">
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Medialternatives
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}