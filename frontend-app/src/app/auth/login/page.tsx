'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
        } catch (error) {
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
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow">
              <div className="card-body p-4">
                {/* Site Logo/Header */}
                <div className="text-center mb-4">
                  <Image
                    src="/images/dav-icon.png"
                    alt="Medialternatives"
                    width={80}
                    height={80}
                    className="mb-3"
                  />
                  <h2 className="h4 text-primary">Medialternatives</h2>
                  <p className="text-muted small">Admin Access</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
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
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
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
                </form>

                {/* Additional Info */}
                <div className="mt-4 text-center">
                  <small className="text-muted">
                    <i className="bi bi-shield-check me-1"></i>
                    Secure access to admin features
                  </small>
                </div>

                {/* Back to Site */}
                <div className="mt-3 text-center">
                  <a href="/" className="text-decoration-none small">
                    <i className="bi bi-arrow-left me-1"></i>
                    Back to Medialternatives
                  </a>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="text-center mt-3">
              <small className="text-muted">
                <i className="bi bi-info-circle me-1"></i>
                This area is restricted to authorized users only
              </small>
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