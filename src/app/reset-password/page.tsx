'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updatePassword } from '@/services/auth.service';
import { supabase } from '@/lib/supabase';
import styles from '../styles.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faSpinner, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

export default function ResetPasswordPage() {
  // No need for router here since we're not navigating programmatically
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidLink, setIsValidLink] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        setIsValidLink(false);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate password match
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setIsLoading(true);

    try {
      await updatePassword(password);
      setIsSuccess(true);
    } catch (err: Error | unknown) {
      console.error('Password update error:', err);
      if (err instanceof Error) {
        setError(err.message || 'Une erreur est survenue lors de la réinitialisation du mot de passe.');
      } else {
        setError('Une erreur est survenue lors de la réinitialisation du mot de passe.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidLink) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <h1>Lien invalide</h1>
            <p>Le lien de réinitialisation de mot de passe est invalide ou a expiré.</p>
          </div>
          <div className={styles.authFooter}>
            <Link href="/forgot-password" className={styles.btnPrimary}>
              Demander un nouveau lien
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1>Réinitialisation du mot de passe</h1>
          <p>Créez un nouveau mot de passe pour votre compte</p>
        </div>

        {error && <div className={styles.authError}>{error}</div>}

        {isSuccess ? (
          <div className={styles.authSuccess}>
            <FontAwesomeIcon icon={faCheckCircle} size="3x" />
            <h2>Mot de passe mis à jour !</h2>
            <p>
              Votre mot de passe a été modifié avec succès.
              Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
            </p>
            <Link href="/login" className={styles.btnPrimary}>
              Se connecter
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div className={styles.formGroup}>
              <label htmlFor="password">
                <FontAwesomeIcon icon={faLock} /> Nouveau mot de passe
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Créez un mot de passe sécurisé"
                className={styles.authInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">
                <FontAwesomeIcon icon={faLock} /> Confirmer le mot de passe
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Répétez votre mot de passe"
                className={styles.authInput}
              />
            </div>

            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin /> Mise à jour en cours...
                </>
              ) : (
                'Réinitialiser le mot de passe'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 