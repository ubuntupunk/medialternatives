import Link from 'next/link';

export default function TestRedirectPage() {
  return (
    <div className="container my-4">
      <h1>Test Legacy URL Redirects</h1>
      
      <div className="alert alert-info">
        <h4>Testing Legacy WordPress.com URLs</h4>
        <p>Click the links below to test if legacy URLs redirect properly:</p>
      </div>
      
      <div className="row">
        <div className="col-md-6">
          <h3>Legacy URLs (should redirect)</h3>
          <ul className="list-group">
            <li className="list-group-item">
              <a href="/2015/05/08/apartheid-the-nazis-and-mcebo-dlamini/" target="_blank">
                /2015/05/08/apartheid-the-nazis-and-mcebo-dlamini/
              </a>
              <br />
              <small className="text-muted">Should redirect to: /apartheid-the-nazis-and-mcebo-dlamini</small>
            </li>
          </ul>
        </div>
        
        <div className="col-md-6">
          <h3>Clean URLs (should work directly)</h3>
          <ul className="list-group">
            <li className="list-group-item">
              <Link href="/apartheid-the-nazis-and-mcebo-dlamini">
                /apartheid-the-nazis-and-mcebo-dlamini
              </Link>
              <br />
              <small className="text-muted">Direct clean URL</small>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="mt-4">
        <h3>API Test</h3>
        <p>Test the legacy URL lookup API:</p>
        <a 
          href="/api/test-legacy-url?year=2015&month=05&day=08&slug=apartheid-the-nazis-and-mcebo-dlamini" 
          target="_blank"
          className="btn btn-primary"
        >
          Test API Lookup
        </a>
      </div>
      
      <div className="mt-4">
        <h3>WordPress.com Source</h3>
        <p>Original WordPress.com URL:</p>
        <a 
          href="https://medialternatives.wordpress.com/2015/05/08/apartheid-the-nazis-and-mcebo-dlamini/" 
          target="_blank"
          className="btn btn-outline-secondary"
        >
          View Original Post
        </a>
      </div>
    </div>
  );
}