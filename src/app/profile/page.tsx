'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import styles from '../styles.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Redirect if not authenticated and finished loading
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Chargement de votre profil...</p>
      </div>
    );
  }

  // If we're not loading and not authenticated, don't render anything
  // since useEffect will handle redirect
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.profileContainer}>
      
      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <h1>Mon Profil</h1>
          <div className={styles.profileAvatar}>
            <FontAwesomeIcon icon={faUser} size="2x" />
          </div>
        </div>

        <div className={styles.profileInfo}>
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>
              <FontAwesomeIcon icon={faEnvelope} /> Email
            </div>
            <div className={styles.infoValue}>{user?.email}</div>
          </div>

          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>
              <FontAwesomeIcon icon={faUser} /> ID Utilisateur
            </div>
            <div className={styles.infoValue}>{user?.id}</div>
          </div>
        </div>

        <div className={styles.profileActions}>
          <Link href="/change-password" className={styles.btnSecondary}>
            Changer mon mot de passe
          </Link>
          <button onClick={handleLogout} className={styles.btnSecondary}>
            <FontAwesomeIcon icon={faSignOutAlt} /> Déconnexion
          </button>
        </div>

        <div className={styles.profileOrders}>
          <h2>Mes Commandes</h2>
          <div className={styles.ordersList}>
            <p className={styles.noOrders}>
              Vous n&apos;avez pas encore passé de commande.
            </p>
            {/* Order history will be implemented here later */}
          </div>
        </div>
      </div>
    </div>
  );
} 