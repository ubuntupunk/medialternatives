import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function UnauthorizedPage() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="text-center">
              {/* Site Logo */}
              <Image
                src="/images/dav-icon.png"
                alt="Medialternatives"
                width={100}
                height={100}
                className="mb-4"
              />
              
              {/* Error Message */}
              <div className="mb-4">
                <i className="bi bi-shield-exclamation text-warning" style={{ fontSize: '4rem' }}></i>
              </div>
              
              <h1 className="h2 text-danger mb-3">Access Denied</h1>
              
              <p className="text-muted mb-4">
                You don&apos;t have permission to access this area. 
                This section is restricted to authorized administrators only.
              </p>
              
              {/* Action Buttons */}
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Link href="/auth/login" className="btn btn-primary">
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Sign In
                </Link>
                
                <Link href="/" className="btn btn-outline-secondary">
                  <i className="bi bi-house me-2"></i>
                  Go Home
                </Link>
              </div>
              
              {/* Additional Info */}
              <div className="mt-5 p-3 bg-white rounded border">
                <h6 className="text-primary mb-2">
                  <i className="bi bi-info-circle me-2"></i>
                  Need Access?
                </h6>
                <p className="small text-muted mb-0">
                  If you believe you should have access to this area, 
                  please contact the site administrator.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}