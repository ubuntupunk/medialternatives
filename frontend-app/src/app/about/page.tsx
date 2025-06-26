import Image from "next/image";
import Link from "next/link";

export default function About() {
  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">About This Project</h1>
          <p className="lead">
            WordPress.com Headless CMS Migration - A modern React/Next.js frontend consuming content from WordPress.com via their public API.
          </p>
        </div>
      </div>

      <div className="row mt-5">
        <div className="col-12">
          <h2>Project Status</h2>
          <div className="row mt-3">
            <div className="col-md-3">
              <div className="text-success">
                <strong>Setup</strong>
                <br />
                <small>Complete</small>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-success">
                <strong>Components</strong>
                <br />
                <small>Basic components created</small>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-success">
                <strong>WordPress.com API</strong>
                <br />
                <small>Connected & Ready</small>
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

      <div className="row mt-5">
        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">
                <Image
                  src="/next.svg"
                  alt="Next.js logo"
                  width={100}
                  height={20}
                  className="mb-2"
                />
              </h5>
              <p className="card-text">
                Main blog interface with posts from WordPress.com.
              </p>
              <Link href="/" className="btn btn-primary">
                View Blog
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">🧩 Components</h5>
              <p className="card-text">
                UI components showcase and testing.
              </p>
              <Link href="/components" className="btn btn-primary">
                View Components
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">📖 Handbook</h5>
              <p className="card-text">
                Media Activist's Handbook integration.
              </p>
              <button className="btn btn-secondary" disabled>
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-5">
        <div className="col-12">
          <h2>Technology Stack</h2>
          <div className="row mt-3">
            <div className="col-md-6">
              <h5>Frontend</h5>
              <ul>
                <li>React 18</li>
                <li>Next.js 14 with App Router</li>
                <li>TypeScript</li>
                <li>Bootstrap 5</li>
                <li>CSS Modules</li>
              </ul>
            </div>
            <div className="col-md-6">
              <h5>Backend</h5>
              <ul>
                <li>WordPress.com (davidrobertlewis5.wordpress.com)</li>
                <li>WordPress.com Public REST API</li>
                <li>Google Analytics 4</li>
                <li>AdSense Integration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-5">
        <div className="col-12">
          <h2>Features</h2>
          <div className="row mt-3">
            <div className="col-md-6">
              <h5>Migrated from WordPress</h5>
              <ul>
                <li>✅ Bootstrap responsive layout</li>
                <li>✅ Custom typography (Copse, Quattrocento, Revalia)</li>
                <li>✅ Header image support</li>
                <li>✅ Post cards and grid layout</li>
                <li>✅ Category cloud widget</li>
                <li>✅ Author widget</li>
                <li>✅ AdSense integration</li>
                <li>✅ Pagination</li>
              </ul>
            </div>
            <div className="col-md-6">
              <h5>Modern Enhancements</h5>
              <ul>
                <li>⚡ Static generation with ISR</li>
                <li>🖼️ Next.js Image optimization</li>
                <li>🔒 Enhanced security headers</li>
                <li>📱 Improved mobile performance</li>
                <li>🎯 Better SEO capabilities</li>
                <li>⚙️ Component-based architecture</li>
                <li>🔧 TypeScript for better DX</li>
                <li>📊 Vercel Analytics integration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-5 mb-5">
        <div className="col-12 text-center">
          <Link href="/" className="btn btn-primary btn-lg">
            ← Back to Blog
          </Link>
        </div>
      </div>
    </div>
  );
}