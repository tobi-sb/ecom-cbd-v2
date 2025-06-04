'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles.module.css';

interface AddToCartNotificationProps {
  show: boolean;
  onClose: () => void;
}

const AddToCartNotification = ({ show, onClose }: AddToCartNotificationProps) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className={styles.notification} style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: '#4CAF50',
      color: 'white',
      padding: '15px 20px',
      borderRadius: '5px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      zIndex: 9999,
      animation: 'slideIn 0.3s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <FontAwesomeIcon icon={faCheck} />
        <span>Produit ajouté au panier avec succès!</span>
      </div>
      <Link href="/cart" style={{
        marginLeft: '15px',
        backgroundColor: 'white',
        color: '#4CAF50',
        padding: '5px 10px',
        borderRadius: '3px',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        textDecoration: 'none'
      }}>
        Voir le panier
      </Link>
    </div>
  );
};

export default AddToCartNotification; 