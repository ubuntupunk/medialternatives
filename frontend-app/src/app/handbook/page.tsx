import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import styles from './handbook.module.css';

export const metadata: Metadata = {
  title: 'Media Activist\'s Handbook | Medialternatives',
  description: 'This handbook contains coursework, essays and case histories drawn from the South African resistance to the apartheid regime. A must read for any serious student of alternative and mainstream media.',
  keywords: 'media activism, handbook, South Africa, apartheid, resistance, alternative media',
  authors: [{ name: 'David Robert Lewis' }],
  openGraph: {
    title: 'Media Activist\'s Handbook',
    description: 'Essential reading for media activists and students of alternative media',
    type: 'website',
  },
};

const HandbookPage: React.FC = () => {
  return (
    <div className={styles.handbook}>
      {/* Hero Section */}
      <section className={`${styles.heroSection} py-5`}>
        <div className="container">
          <div className="row">
            <div className="col-12 col-md-7 pt-5 mb-5 align-self-center">
              <div className="promo pe-md-3 pe-lg-5">
                <h1 className="headline mb-3 text-balance">
                  The Media Activist Handbook
                </h1>
                <div className="subheadline mb-4 text-pretty">
                  This handbook contains coursework, essays and case histories drawn from the South African resistance to the apartheid regime. A must read for any serious student of alternative and mainstream media.
                </div>
                
                <div className="cta-holder row gx-md-3 gy-3 gy-md-0">
                  <div className="col-12 col-md-auto">
                    <Link 
                      href="https://415657395513.gumroad.com/l/bvzna" 
                      className="btn btn-primary w-100"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download with Gumroad
                    </Link>
                  </div>
                  <div className="col-12 col-md-auto">
                    <a className="btn btn-secondary w-100" href="#benefits-section">
                      Learn More
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-12 col-md-5 mb-5 align-self-center">
              <div className={`${styles.bookCoverHolder} text-center position-relative`}>
                <img 
                  className={`img-fluid ${styles.bookCover}`}
                  src="/images/handbook-cover.jpg" 
                  alt="Media Activist's Handbook cover"
                />
                <div className={styles.bookBadge}>
                  New<br />Release
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits-section" className={`${styles.benefitsSection} py-5`}>
        <div className="container py-5">
          <h2 className="section-heading text-center mb-3">What Will You Get From This Book?</h2>
          <div className="section-intro text-center mb-5 mx-auto" style={{ maxWidth: '800px' }}>
            Benefits of reading the Media Activist handbook.
          </div>
          
          <div className="row text-center">
            <div className="col-12 col-md-6 col-lg-4 mb-5">
              <div className={styles.benefitItem}>
                <div className={styles.iconHolder}>
                  <i className="fas fa-bullhorn fa-3x"></i>
                </div>
                <h5 className={`${styles.benefitTitle} text-balance`}>Media Strategy</h5>
                <div className={`${styles.benefitDesc} text-pretty`}>
                  Learn proven strategies for effective media activism and communication campaigns.
                </div>
              </div>
            </div>
            
            <div className="col-12 col-md-6 col-lg-4 mb-5">
              <div className={styles.benefitItem}>
                <div className={styles.iconHolder}>
                  <i className="fas fa-history fa-3x"></i>
                </div>
                <h5 className={styles.benefitTitle}>Historical Context</h5>
                <div className={styles.benefitDesc}>
                  Understand the historical context of media resistance during apartheid South Africa.
                </div>
              </div>
            </div>
            
            <div className="col-12 col-md-6 col-lg-4 mb-5">
              <div className={styles.benefitItem}>
                <div className={styles.iconHolder}>
                  <i className="fas fa-users fa-3x"></i>
                </div>
                <h5 className={styles.benefitTitle}>Case Studies</h5>
                <div className={styles.benefitDesc}>
                  Real-world case studies and examples from successful media activism campaigns.
                </div>
              </div>
            </div>
            
            <div className="col-12 col-md-6 col-lg-4 mb-5">
              <div className={styles.benefitItem}>
                <div className={styles.iconHolder}>
                  <i className="fas fa-newspaper fa-3x"></i>
                </div>
                <h5 className={styles.benefitTitle}>Alternative Media</h5>
                <div className={styles.benefitDesc}>
                  Explore the role and impact of alternative media in social movements.
                </div>
              </div>
            </div>
            
            <div className="col-12 col-md-6 col-lg-4 mb-5">
              <div className={styles.benefitItem}>
                <div className={styles.iconHolder}>
                  <i className="fas fa-graduation-cap fa-3x"></i>
                </div>
                <h5 className={styles.benefitTitle}>Educational Resource</h5>
                <div className={styles.benefitDesc}>
                  Comprehensive coursework and essays for students and educators.
                </div>
              </div>
            </div>
            
            <div className="col-12 col-md-6 col-lg-4 mb-5">
              <div className={styles.benefitItem}>
                <div className={styles.iconHolder}>
                  <i className="fas fa-fist-raised fa-3x"></i>
                </div>
                <h5 className={styles.benefitTitle}>Resistance Tactics</h5>
                <div className={styles.benefitDesc}>
                  Learn about effective resistance tactics and their application in media activism.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Preview Section */}
      <section className={`${styles.contentSection} py-5`}>
        <div className="container">
          <h2 className="section-heading text-center mb-5">What&apos;s Inside</h2>
          
          <div className="row">
            <div className="col-12 col-lg-8 mx-auto">
              <div className="content-preview">
                <div className={`${styles.chapter} mb-4 p-4`}>
                  <h4 className={styles.chapterTitle}>Chapter 1: Understanding Media Power</h4>
                  <p className={styles.chapterDesc}>
                    An introduction to the role of media in society and how it can be leveraged for social change.
                  </p>
                </div>
                
                <div className={`${styles.chapter} mb-4 p-4`}>
                  <h4 className={styles.chapterTitle}>Chapter 2: Historical Resistance</h4>
                  <p className={styles.chapterDesc}>
                    Case studies from the South African anti-apartheid movement and lessons for modern activists.
                  </p>
                </div>
                
                <div className={`${styles.chapter} mb-4 p-4`}>
                  <h4 className={styles.chapterTitle}>Chapter 3: Alternative Media Strategies</h4>
                  <p className={styles.chapterDesc}>
                    Building and maintaining alternative media platforms for grassroots movements.
                  </p>
                </div>
                
                <div className={`${styles.chapter} mb-4 p-4`}>
                  <h4 className={styles.chapterTitle}>Chapter 4: Digital Activism</h4>
                  <p className={styles.chapterDesc}>
                    Leveraging digital tools and social media for effective activism campaigns.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className={`${styles.ctaSection} text-white py-5`}>
        <div className="container text-center">
          <h2 className="mb-4">Ready to Start Your Media Activism Journey?</h2>
          <p className="lead mb-4">
            Download the handbook today and join the movement for alternative media.
          </p>
          <Link 
            href="https://415657395513.gumroad.com/l/bvzna" 
            className="btn btn-light btn-lg"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fas fa-download me-2"></i>
            Download Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HandbookPage;