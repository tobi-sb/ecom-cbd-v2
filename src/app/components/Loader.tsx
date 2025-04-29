'use client';

import React from 'react';
import styles from '../styles.module.css';

interface LoaderProps {
  isLoading: boolean;
}

const Loader: React.FC<LoaderProps> = ({ isLoading }) => {
  if (!isLoading) return null;
  
  return (
    <div className={styles.loaderContainer}>
      <div className={styles.loader}>
        <div className={styles.loaderInner}></div>
      </div>
      <div className={styles.loaderText}>Chargement...</div>
    </div>
  );
};

export default Loader;
