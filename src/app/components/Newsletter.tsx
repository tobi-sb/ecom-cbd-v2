'use client';

import { useState } from 'react';
import styles from '../styles.module.css';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email) {
      // Ici, on simulerait un appel API pour enregistrer l'email
      console.log(`Email soumis: ${email}`);
      setIsSubscribed(true);
      setEmail('');
      
      // Reset après 3 secondes
      setTimeout(() => {
        setIsSubscribed(false);
      }, 3000);
    }
  };

  return (
    <section className={styles.newsletter}>
      <div className={styles.newsletterContent}>
        <h2>Rejoignez la Tribu Jungle CBD</h2>
        <p>Inscrivez-vous à notre newsletter et recevez 10% de réduction sur votre première commande</p>
        
        {isSubscribed ? (
          <p style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>
            Merci pour votre inscription!
          </p>
        ) : (
          <form className={styles.newsletterForm} onSubmit={handleSubmit}>
            <input 
              type="email" 
              placeholder="Votre adresse email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className={`${styles.btnPrimary} ${styles.newsletterButton}`}>
              S&apos;inscrire
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default Newsletter; 