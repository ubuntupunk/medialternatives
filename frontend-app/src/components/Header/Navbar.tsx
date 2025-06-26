import React from 'react';
import Link from 'next/link';
import styles from '../../styles/components/navbar.module.css';

const Navbar: React.FC = () => {
  return (
    <nav className={`navbar navbar-expand-lg navbar-light ${styles.navbar}`}>
      <div className="container-fluid">
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link href="/" className={`nav-link active ${styles.navLink}`} aria-current="page">
                Home
              </Link>
            </li>
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
