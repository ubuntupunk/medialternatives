'use client';

import React, { useState } from 'react';

type TabId = 'documents' | 'media';

const tabs: { id: TabId; label: string }[] = [
  { id: 'documents', label: 'Documents' },
  { id: 'media', label: 'Media' },
];

const SlideshareEmbed = () => (
  <div style={{ maxWidth: '100%' }}>
    <iframe
      src="https://www.slideshare.net/slideshow/embed_code/key/kLOh1kOExSyFtU"
      title="Lewis v Media24 (2010) Anatomy of an Injustice"
      width="510"
      height="420"
      frameBorder="0"
      marginWidth="0"
      marginHeight="0"
      scrolling="no"
      style={{ border: '1px solid #CCC', marginBottom: '5px', maxWidth: '100%' }}
      allowFullScreen
    />
    <div style={{ marginBottom: '5px' }}>
      <strong>
        <a
          href="https://www.slideshare.net/slideshow/lewis-v-media24-2010-anatomy-of-an-injustice/288000289"
          title="lewis-v-media24-2010-anatomy-of-an-injustice"
          target="_blank"
          rel="noopener noreferrer"
        >
          lewis-v-media24-2010-anatomy-of-an-injustice
        </a>
      </strong>
      {' from '}
      <strong>
        <a
          href="https://www.slideshare.net/DavidRobertLewis"
          target="_blank"
          rel="noopener noreferrer"
        >
          DavidRobertLewis
        </a>
      </strong>
    </div>
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
