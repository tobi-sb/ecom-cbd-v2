'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    // Here you would typically send the form data to your backend
    // For now, we'll just simulate a successful submission
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch {
      // No need to capture the error object since we're not using it
      setError('Une erreur est survenue. Veuillez réessayer plus tard.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.contactContainer}>
      <div className={styles.contactHeader}>
        <h1>Contactez-nous</h1>
        <p>Nous sommes là pour répondre à toutes vos questions concernant nos produits CBD.</p>
      </div>

      <div className={styles.contactContent}>
        <div className={styles.contactInfo}>
          <div className={styles.infoCard}>
            <h3>Notre Adresse</h3>
            <p>123 Rue du CBD</p>
            <p>75000 Paris, France</p>
          </div>
          
          <div className={styles.infoCard}>
            <h3>Heures d&apos;Ouverture</h3>
            <p>Lundi - Vendredi: 9h - 18h</p>
            <p>Samedi: 10h - 16h</p>
            <p>Dimanche: Fermé</p>
          </div>
          
          <div className={styles.infoCard}>
            <h3>Contact</h3>
            <p>Email: contact@jungle-cbd.fr</p>
            <p>Téléphone: +33 1 23 45 67 89</p>
          </div>
        </div>

        <div className={styles.contactForm}>
          {submitted ? (
            <div className={styles.successMessage}>
              <h3>Merci pour votre message!</h3>
              <p>Nous vous répondrons dans les plus brefs délais.</p>
              <button 
                onClick={() => setSubmitted(false)}
                className={styles.newMessageBtn}
              >
                Envoyer un nouveau message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Nom</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Votre nom"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Votre email"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="subject">Sujet</label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionnez un sujet</option>
                  <option value="question">Question sur un produit</option>
                  <option value="order">Commande</option>
                  <option value="return">Retour</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Votre message"
                  rows={6}
                />
              </div>
              
              {error && <div className={styles.errorMessage}>{error}</div>}
              
              <button 
                type="submit" 
                className={styles.submitBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 