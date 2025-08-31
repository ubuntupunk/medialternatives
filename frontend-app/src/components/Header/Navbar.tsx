import React from 'react';
import Link from 'next/link';
import styles from '../../styles/components/navbar.module.css';

/**
 * Navigation Bar Component
 *
 * Main navigation component for the Media Alternatives website.
 * Provides responsive navigation with collapsible menu for mobile devices.
 * Includes links to main sections: About, Support, Case, Republish, Environment, and Handbook.
 *
 * @component
 * @returns {JSX.Element} The rendered navigation bar
 *
 * @example
 * ```tsx
 * import Navbar from '@/components/Header/Navbar';
 *
 * function Header() {
 *   return (
 *     <header>
 *       <Navbar />
 *     </header>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // The navbar automatically handles:
 * // - Responsive collapse on mobile
 * // - Bootstrap styling integration
 * // - Accessibility features (ARIA labels)
 * // - Active link highlighting
 * ```
 */
const Navbar: React.FC = () => {
  return (
    <nav className={`navbar navbar-expand-lg navbar-light ${styles.navbar}`}>
      <div className="container justify-content-center">
        <button
          className="navbar-toggler mx-auto"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link href="/about" className={`nav-link ${styles.navLink}`}>
                About
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/support" className={`nav-link ${styles.navLink}`}>
                Support
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/case" className={`nav-link ${styles.navLink}`}>
                Case
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/republish" className={`nav-link ${styles.navLink}`}>
                Republish
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/environment" className={`nav-link ${styles.navLink}`}>
                Environment
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/handbook" className={`nav-link ${styles.navLink}`}>
                Handbook
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
