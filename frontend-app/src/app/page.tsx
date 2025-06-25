import Link from "next/link";

export default function Home() {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="text-center mb-5">
            <h1 className="display-4 font-display">WordPress.com Headless CMS</h1>
            <p className="lead">Migration Project - Development Environment</p>
          </div>

          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">API Testing</h5>
                  <p className="card-text">
                    Test the WordPress.com API integration and verify data connectivity.
                  </p>
                  <Link href="/api-test" className="btn btn-primary me-2">
                    Test Real API
                  </Link>
                  <Link href="/api-test-mock" className="btn btn-outline-primary">
                    Mock Data
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Handbook</h5>
                  <p className="card-text">
                    Media Activist's Handbook (to be integrated).
                  </p>
                  <button className="btn btn-secondary" disabled>
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Blog Posts</h5>
                  <p className="card-text">
                    Main blog interface with posts from WordPress.com.
                  </p>
                  <button className="btn btn-secondary" disabled>
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Components</h5>
                  <p className="card-text">
                    UI components showcase and testing.
                  </p>
                  <button className="btn btn-secondary" disabled>
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 text-center">
            <h3>Project Status</h3>
            <div className="row mt-3">
              <div className="col-md-3">
                <div className="text-success">
                  <strong>Setup Complete</strong>
                  <br />
                  <small>Next.js + TypeScript + Bootstrap</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-success">
                  <strong>API Service</strong>
                  <br />
                  <small>WordPress.com integration</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-warning">
                  <strong>Components</strong>
                  <br />
                  <small>In development</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-secondary">
                  <strong>Deployment</strong>
                  <br />
                  <small>Pending</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}