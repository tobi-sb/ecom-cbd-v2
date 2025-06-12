'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { resetPassword } from '@/services/auth.service';
import styles from '../styles.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faSpinner, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await resetPassword(email);
      setIsSuccess(true);
    } catch (err: unknown) {
      console.error('Password reset error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'envoi du lien de réinitialisation.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1>Mot de passe oublié</h1>
          <p>Nous vous enverrons un lien pour réinitialiser votre mot de passe</p>
        </div>

        {error && <div className={styles.authError}>{error}</div>}

        {isSuccess ? (
          <div className={styles.authSuccess}>
            <FontAwesomeIcon icon={faCheckCircle} size="3x" />
            <h2>Email envoyé !</h2>
            <p>
              Un lien de réinitialisation de mot de passe a été envoyé à <strong>{email}</strong>.
              Veuillez vérifier votre boîte de réception et suivre les instructions.
            </p>
            <Link href="/login" className={styles.btnPrimary}>
              Retour à la connexion
            </Link>
          </div>
        ) : (
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

            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin /> Envoi en cours...
                </>
              ) : (
                'Envoyer le lien de réinitialisation'
              )}
            </button>
          </form>
        )}

        <div className={styles.authFooter}>
          <p>
            <Link href="/login">Retour à la connexion</Link>
          </p>
        </div>
      </div>
    </div>
  );
} 