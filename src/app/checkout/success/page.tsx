'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faSpinner, faHome, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import styles from './page.module.css';

export default function CheckoutSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart, cart } = useCart();
  const sessionId = searchParams.get('session_id');
  const [hasCleared, setHasCleared] = useState(false);
  
  // Clear the cart when the success page loads
  useEffect(() => {
    if (!sessionId) {
      // Redirect to home if accessed directly without session_id
      router.push('/');
      return;
    }
    
    // Only clear the cart once when component mounts
    if (!hasCleared && cart.length > 0) {
      clearCart();
      setHasCleared(true);
    }
  }, [sessionId, router, clearCart, hasCleared, cart.length]);

  if (!sessionId) {
    return (
      <div className={styles.loading}>
        <FontAwesomeIcon icon={faSpinner} spin />
        <p>Redirection...</p>
      </div>
    );
  }

  return (
    <div className={styles.successContainer}>
      <div className={styles.successCard}>
        <div className={styles.successIcon}>
          <FontAwesomeIcon icon={faCheckCircle} className={styles.checkIcon} />
        </div>
        
        <h1>Commande Confirmée!</h1>
        
        <p className={styles.orderNumber}>
          Numéro de commande: <span>#{sessionId.substring(0, 8)}</span>
        </p>
        
        <p className={styles.thankYou}>
          Merci pour votre achat! Votre commande a été traitée avec succès.
        </p>
        
        <p className={styles.emailInfo}>
          Un email de confirmation a été envoyé à l'adresse fournie lors de votre commande avec tous les détails.
        </p>
        
        <div className={styles.shippingInfo}>
          <h2>Prochaines étapes</h2>
          <p>Votre commande sera traitée et expédiée dans les 1 à 3 jours ouvrables.</p>
          <p>Vous recevrez un email de confirmation d'expédition avec un numéro de suivi dès que votre colis sera en route.</p>
        </div>
        
        <div className={styles.actionButtons}>
          <Link href="/" className={styles.homeButton}>
            <FontAwesomeIcon icon={faHome} />
            Retour à l'accueil
          </Link>
          
          <Link href="/products" className={styles.shopButton}>
            <FontAwesomeIcon icon={faBoxOpen} />
            Continuer vos achats
          </Link>
        </div>
        
        <div className={styles.support}>
          <p>
            Besoin d'aide? Contactez notre <Link href="/contact">service client</Link>
          </p>
        </div>
      </div>
    </div>
  );
} 