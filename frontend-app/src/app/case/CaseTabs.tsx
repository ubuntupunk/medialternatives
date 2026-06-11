'use client';

import React, { useState } from 'react';

type TabId = 'documents' | 'media';

const tabs: { id: TabId; label: string }[] = [
  { id: 'documents', label: 'Documents' },
  { id: 'media', label: 'Media' },
];

const SlideshareEmbed = () => (
  <div className="ratio" style={{ maxWidth: '800px' }}>
    <iframe
      src="https://www.slideshare.net/slideshow/embed_code/key/kLOh1kOExSyFtU"
      title="Lewis v Media24 (2010) Anatomy of an Injustice"
      allowFullScreen
      style={{ border: '1px solid #CCC', borderRadius: '4px' }}
    />
  </div>
);

export default function CaseTabs({
  documentsContent,
}: {
  documentsContent: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<TabId>('documents');

  return (
    <div>
      <ul className="nav nav-tabs mb-4" role="tablist">
        {tabs.map((tab) => (
          <li className="nav-item" role="presentation" key={tab.id}>
            <button
              className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="tab-content">
        {activeTab === 'documents' && (
          <div className="tab-pane fade show active" role="tabpanel">
            {documentsContent}
          </div>
        )}
        {activeTab === 'media' && (
          <div className="tab-pane fade show active" role="tabpanel">
            <h2 className="mb-4">Media & Presentations</h2>

            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">
                  Lewis v Media24 (2010) Anatomy of an Injustice
                </h5>
                <p className="card-text text-muted">
                  An audit of judicial failure compiled from court transcripts in
                  Lewis v Media24 (2010)
                </p>
                <SlideshareEmbed />
                <div className="mt-2">
                  <a
                    href="https://www.slideshare.net/slideshow/lewis-v-media24-2010-anatomy-of-an-injustice/288000289"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-primary"
                  >
                    Open on SlideShare &rarr;
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
