"use client";

import React from 'react';
import Link from 'next/link';
import styles from './Navigation.module.css';

interface NavigationProps {
  isMenuOpen: boolean;
}

const Navigation: React.FC<NavigationProps> = ({
  isMenuOpen
}) => {
  return (
    <nav id="site-navigation" className={`${styles.mainNavigation} container`} role="navigation">
      <div className={`${styles.blaskanMainMenu} ${isMenuOpen ? styles.active : ''}`}>
        <ul id="primary-menu" className={styles.menu}>
          <li className={styles.menuItem}>
            <Link href="/about">About</Link>
          </li>
          <li className={styles.menuItem}>
            <Link href="/support-us">Support Us</Link>
          </li>
          <li className={styles.menuItem}>
            <Link href="/case">Case</Link>
          </li>
          <li className={styles.menuItem}>
            <Link href="/republish">Republish</Link>
          </li>
          <li className={styles.menuItem}>
            <Link href="/environment">Environment</Link>
          </li>
          <li className={styles.menuItem}>
            <Link href="/handbook">Handbook</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
