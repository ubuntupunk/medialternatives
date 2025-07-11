import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import { readFileSync } from 'fs';
import { join } from 'path';
import Link from 'next/link';
import './timeline.css';

export const metadata: Metadata = {
  title: 'Legal Archive Timeline - Medialternatives',
  description: 'Comprehensive timeline of the 18-year Lewis v Media24 legal saga spanning multiple courts and jurisdictions (2006-2024).',
  keywords: 'legal timeline, Lewis v Media24, court cases, legal saga, South Africa law',
};

export default function LegalArchiveTimelinePage() {
  // Read the markdown content
  const markdownPath = join(process.cwd(), 'src/content/legal-archive-timeline.md');
  const markdownContent = readFileSync(markdownPath, 'utf8');

  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-12">
          {/* Navigation */}
          <nav aria-label="Legal Archive Navigation" className="mb-4">
            <div className="d-flex gap-2 flex-wrap">
              <Link href="/case" className="btn btn-outline-secondary btn-sm">
                <i className="bi bi-arrow-left me-1"></i>
                Case Overview
              </Link>
              <Link href="/legal-archive" className="btn btn-outline-secondary btn-sm">
                <i className="bi bi-folder me-1"></i>
                Document Archive
              </Link>
              <span className="btn btn-primary btn-sm">
                <i className="bi bi-clock-history me-1"></i>
                Timeline View
              </span>
            </div>
          </nav>

          {/* Timeline Phase Slider */}
          <div className="timeline-phases mb-5">
            <h3 className="h5 mb-3 text-center">Legal Saga Timeline (2006-2024)</h3>
            <div className="row g-0">
              <div className="col-2">
                <div className="phase-card bg-danger text-white text-center p-3 h-100 d-flex flex-column justify-content-center">
                  <div className="fw-bold small">Phase 1</div>
                  <div className="small">2006</div>
                  <div className="tiny">Initial Dispute</div>
                </div>
              </div>
              <div className="col-2">
                <div className="phase-card bg-warning text-dark text-center p-3 h-100 d-flex flex-column justify-content-center">
                  <div className="fw-bold small">Phase 2</div>
                  <div className="small">2009-2010</div>
                  <div className="tiny">Labour Court</div>
                </div>
              </div>
              <div className="col-2">
                <div className="phase-card bg-info text-white text-center p-3 h-100 d-flex flex-column justify-content-center">
                  <div className="fw-bold small">Phase 3</div>
                  <div className="small">2011-2014</div>
                  <div className="tiny">Appeals</div>
                </div>
              </div>
              <div className="col-2">
                <div className="phase-card bg-primary text-white text-center p-3 h-100 d-flex flex-column justify-content-center">
                  <div className="fw-bold small">Phase 4</div>
                  <div className="small">2014-2015</div>
                  <div className="tiny">Constitutional</div>
                </div>
              </div>
              <div className="col-2">
                <div className="phase-card bg-secondary text-white text-center p-3 h-100 d-flex flex-column justify-content-center">
                  <div className="fw-bold small">Phase 5</div>
                  <div className="small">2016-2018</div>
                  <div className="tiny">Criminal</div>
                </div>
              </div>
              <div className="col-2">
                <div className="phase-card bg-success text-white text-center p-3 h-100 d-flex flex-column justify-content-center">
                  <div className="fw-bold small">Phase 6</div>
                  <div className="small">2019-2024</div>
                  <div className="tiny">Documentation</div>
                </div>
              </div>
            </div>
            <div className="text-center mt-2">
              <small className="text-muted">
                <i className="bi bi-arrow-left-right me-1"></i>
                18-year legal saga across multiple courts and jurisdictions
              </small>
            </div>
          </div>

          {/* Timeline Content */}
          <div className="legal-timeline-content">
            <ReactMarkdown
              components={{
                h1: ({ ...props }) => <h1 className="display-4 mb-4 text-center border-bottom pb-3" {...props} />,
                h2: ({ ...props }) => <h2 className="h3 mt-5 mb-3 text-primary" {...props} />,
                h3: ({ ...props }) => <h3 className="h4 mt-4 mb-3 border-start border-primary border-3 ps-3" {...props} />,
                h4: ({ ...props }) => <h4 className="h5 mt-3 mb-2 text-secondary" {...props} />,
                h5: ({ ...props }) => <h5 className="h6 mt-3 mb-2 fw-bold" {...props} />,
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
                li: ({ ...props }) => <li className="mb-2 position-relative" {...props} />,
                blockquote: ({ ...props }) => (
                  <blockquote className="blockquote border-start border-warning border-4 ps-3 my-4 bg-light p-3 rounded" {...props} />
                ),
                code: ({ ...props }) => (
                  <code className="bg-light px-2 py-1 rounded" {...props} />
                ),
                pre: ({ ...props }) => (
                  <pre className="bg-light p-3 rounded overflow-auto" {...props} />
                ),
                // Custom styling for timeline sections
                hr: ({ ...props }) => (
                  <hr className="my-5 border-2 border-primary" {...props} />
                ),
              }}
            >
              {markdownContent}
            </ReactMarkdown>
          </div>

          {/* Timeline Statistics */}
          <div className="row mt-5 pt-4 border-top">
            <div className="col-6 col-md-2 text-center mb-3">
              <div className="h4 text-primary">18</div>
              <div className="small text-muted">Years Span</div>
            </div>
            <div className="col-6 col-md-2 text-center mb-3">
              <div className="h4 text-primary">6</div>
              <div className="small text-muted">Legal Phases</div>
            </div>
            <div className="col-6 col-md-2 text-center mb-3">
              <div className="h4 text-primary">32</div>
              <div className="small text-muted">Documents</div>
            </div>
            <div className="col-6 col-md-2 text-center mb-3">
              <div className="h4 text-warning">6</div>
              <div className="small text-muted">Missing Cases</div>
            </div>
            <div className="col-6 col-md-2 text-center mb-3">
              <div className="h4 text-success">4</div>
              <div className="small text-muted">Legal Areas</div>
            </div>
            <div className="col-6 col-md-2 text-center mb-3">
              <div className="h4 text-info">Multiple</div>
              <div className="small text-muted">Jurisdictions</div>
            </div>
          </div>

          {/* Missing Documentation Alert */}
          <div className="alert alert-warning mt-4">
            <h6 className="alert-heading">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Incomplete Archive
            </h6>
            <p className="mb-2">
              This timeline reveals significant gaps in the legal documentation. Critical missing cases include:
            </p>
            <ul className="mb-0 small">
              <li>Labour Appeal Court proceedings (2011-2012)</li>
              <li>Constitutional Court filing (2014-2015)</li>
              <li>SAHRC case files (2014-2016)</li>
              <li>Equality Court case (2015)</li>
              <li>LASA proceedings outcome (2018)</li>
              <li>Unfiled corruption case materials</li>
            </ul>
          </div>

          {/* Legal Areas Breakdown */}
          <div className="row mt-4">
            <div className="col-md-3 mb-3">
              <div className="card border-0 bg-primary text-white h-100">
                <div className="card-body text-center">
                  <i className="bi bi-newspaper display-6 mb-2"></i>
                  <h6 className="card-title">Media Law</h6>
                  <p className="card-text small">Press freedom, copyright, journalistic rights</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card border-0 bg-success text-white h-100">
                <div className="card-body text-center">
                  <i className="bi bi-balance-scale display-6 mb-2"></i>
                  <h6 className="card-title">Constitutional Law</h6>
                  <p className="card-text small">Fair trial, equality, expression rights</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card border-0 bg-danger text-white h-100">
                <div className="card-body text-center">
                  <i className="bi bi-shield-exclamation display-6 mb-2"></i>
                  <h6 className="card-title">Criminal Law</h6>
                  <p className="card-text small">Perjury, corruption, misconduct</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card border-0 bg-info text-white h-100">
                <div className="card-body text-center">
                  <i className="bi bi-building display-6 mb-2"></i>
                  <h6 className="card-title">Administrative Law</h6>
                  <p className="card-text small">Judicial conduct, regulatory oversight</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Footer */}
          <div className="d-flex justify-content-between mt-5 pt-4 border-top">
            <Link href="/case" className="btn btn-outline-primary">
              <i className="bi bi-arrow-left me-2"></i>
              Back to Case Overview
            </Link>
            <Link href="/legal-archive" className="btn btn-primary">
              View Document Archive
              <i className="bi bi-arrow-right ms-2"></i>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}