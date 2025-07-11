import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import { readFileSync } from 'fs';
import { join } from 'path';

export const metadata: Metadata = {
  title: 'Legal Document Archive - Medialternatives',
  description: 'Comprehensive archive of legal documents from the Lewis v Media24 case, including court transcripts, affidavits, and correspondence.',
  keywords: 'legal documents, Lewis v Media24, court transcripts, press freedom, South Africa',
};

export default function LegalArchivePage() {
  // Read the markdown content
  const markdownPath = join(process.cwd(), 'src/content/legal-archive.md');
  const markdownContent = readFileSync(markdownPath, 'utf8');

  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          {/* Archive Navigation Header */}
          <nav aria-label="Legal Archive Navigation" className="mb-5">
            <div className="card border-0 bg-light">
              <div className="card-body p-4">
                <h5 className="card-title text-center mb-3">
                  <i className="bi bi-archive me-2"></i>
                  Legal Document Archive
                </h5>
                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  <Link href="/case" className="btn btn-outline-primary btn-sm">
                    <i className="bi bi-file-text me-1"></i>
                    Case Overview
                  </Link>
                  <span className="btn btn-primary btn-sm">
                    <i className="bi bi-folder-open me-1"></i>
                    Document Archive
                  </span>
                  <Link href="/legal-archive-timeline" className="btn btn-outline-primary btn-sm">
                    <i className="bi bi-clock-history me-1"></i>
                    Timeline View
                  </Link>
                </div>
                <div className="text-center mt-3">
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Comprehensive legal documentation from the Lewis v Media24 case
                  </small>
                </div>
              </div>
            </div>
          </nav>

          <div className="legal-archive-content">
            <ReactMarkdown
              components={{
                h1: ({ ...props }) => <h1 className="display-4 mb-4 text-center" {...props} />,
                h2: ({ ...props }) => <h2 className="h3 mt-5 mb-3 border-bottom pb-2" {...props} />,
                h3: ({ ...props }) => <h3 className="h4 mt-4 mb-3" {...props} />,
                h4: ({ ...props }) => <h4 className="h5 mt-3 mb-2" {...props} />,
                p: ({ ...props }) => <p className="mb-3 lh-lg" {...props} />,
                a: ({ ...props }) => {
                  const href = props.href || '';
                  if (href.startsWith('/legal-archive/')) {
                    return (
                      <a 
                        {...props} 
                        className="btn btn-outline-primary btn-sm me-2 mb-2 d-inline-flex align-items-center"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className="bi bi-file-earmark-pdf me-1"></i>
                        {props.children}
                      </a>
                    );
                  }
                  return (
                    <a 
                      {...props} 
                      className="text-decoration-none"
                      target={href.startsWith('http') ? '_blank' : undefined}
                      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    />
                  );
                },
                ul: ({ ...props }) => <ul className="list-unstyled ms-3" {...props} />,
                li: ({ ...props }) => <li className="mb-2" {...props} />,
                blockquote: ({ ...props }) => (
                  <blockquote className="blockquote border-start border-primary border-4 ps-3 my-4" {...props} />
                ),
                code: ({ ...props }) => (
                  <code className="bg-light px-2 py-1 rounded" {...props} />
                ),
                pre: ({ ...props }) => (
                  <pre className="bg-light p-3 rounded overflow-auto" {...props} />
                ),
              }}
            >
              {markdownContent}
            </ReactMarkdown>
          </div>

          {/* Archive Statistics */}
          <div className="row mt-5 pt-4 border-top">
            <div className="col-md-3 text-center mb-3">
              <div className="h4 text-primary">32</div>
              <div className="small text-muted">Total Documents</div>
            </div>
            <div className="col-md-3 text-center mb-3">
              <div className="h4 text-primary">114.79 MB</div>
              <div className="small text-muted">Archive Size</div>
            </div>
            <div className="col-md-3 text-center mb-3">
              <div className="h4 text-primary">96.9%</div>
              <div className="small text-muted">Validation Rate</div>
            </div>
            <div className="col-md-3 text-center mb-3">
              <div className="h4 text-primary">3</div>
              <div className="small text-muted">Backup Locations</div>
            </div>
          </div>

          {/* Archive Features */}
          <div className="row mt-4">
            <div className="col-md-6 mb-3">
              <div className="card border-0 bg-light h-100">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="bi bi-shield-check text-success me-2"></i>
                    Verified Integrity
                  </h5>
                  <p className="card-text small">
                    All documents include SHA256 hash verification and PDF structure validation.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <div className="card border-0 bg-light h-100">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="bi bi-cloud-check text-primary me-2"></i>
                    Multiple Backups
                  </h5>
                  <p className="card-text small">
                    Documents stored in repository with cold storage backups on pCloud and IceDrive.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Research and Academic Use */}
          <div className="alert alert-success mt-4">
            <h6 className="alert-heading">
              <i className="bi bi-mortarboard me-2"></i>
              Research and Academic Use
            </h6>
            <p className="mb-2 small">
              Researchers, journalists, and academics are encouraged to use these documents for:
            </p>
            <ul className="mb-2 small">
              <li>Media law studies</li>
              <li>Press freedom research</li>
              <li>South African legal history</li>
              <li>Case study analysis</li>
              <li>Academic publications</li>
            </ul>
            <p className="mb-0 small">
              <strong>Please cite appropriately when using these materials in academic or professional work.</strong>
            </p>
          </div>

          {/* Legal Notice */}
          <div className="alert alert-info mt-4">
            <h6 className="alert-heading">
              <i className="bi bi-info-circle me-2"></i>
              Legal Notice
            </h6>
            <p className="mb-0 small">
              These documents are authentic legal records made available in the public interest. 
              They represent actual court proceedings, legal correspondence, and official documentation. 
              For official legal purposes, always refer to original court records.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}