'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import styles from '../styles.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faEnvelope, faUser, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      await register(email, password);
      router.push('/'); // Redirect to homepage after successful registration
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Une erreur est survenue lors de l\'inscription.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1>Créer un compte</h1>
          <p>Rejoignez la communauté Jungle CBD</p>
        </div>

        {error && <div className={styles.authError}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.formGroup}>
            <label htmlFor="email">
              <FontAwesomeIcon icon={faEnvelope} /> Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="votre@email.com"
              className={styles.authInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">
              <FontAwesomeIcon icon={faLock} /> Mot de passe
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

          <div className={styles.termsAgreement}>
            <p>
              En créant un compte, vous acceptez nos{' '}
              <Link href="/terms">Conditions d'utilisation</Link> et notre{' '}
              <Link href="/privacy">Politique de confidentialité</Link>.
            </p>
          </div>

          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin /> Inscription en cours...
              </>
            ) : (
              'Créer mon compte'
            )}
          </button>
        </form>

        <div className={styles.authFooter}>
          <p>
            Vous avez déjà un compte ?{' '}
            <Link href="/login">Connectez-vous</Link>
          </p>
        </div>
      </div>
    </div>
  );
} 