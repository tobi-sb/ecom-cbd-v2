'use client';

import Link from 'next/link';
import styles from '../styles.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFacebookF, 
  faInstagram, 
  faTwitter 
} from '@fortawesome/free-brands-svg-icons';
import { useState, useEffect } from 'react';

const Footer = () => {
  // Use state for the year to handle client-side rendering
  const [year, setYear] = useState('');
  
  // Set the year only on the client side
  useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerLogo}>
          <h3>Jungle CBD</h3>
          <p>Votre oasis de bien-être</p>
        </div>
        
        <div className={styles.footerLinks}>
          <h4>Navigation</h4>
          <ul>
            <li><Link href="/">Accueil</Link></li>
            <li><Link href="/products">Produits</Link></li>
            <li><Link href="/a-propos">À Propos</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>
        
        <div className={styles.footerLinks}>
          <h4>Informations</h4>
          <ul>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/shipping">Livraison</Link></li>
            <li><Link href="/legal">Mentions légales</Link></li>
            <li><Link href="/privacy">Politique de confidentialité</Link></li>
          </ul>
        </div>
        
        <div className={styles.footerSocial}>
          <h4>Suivez-nous</h4>
          <div className={styles.socialIcons}>
            <Link href="https://facebook.com">
              <FontAwesomeIcon icon={faFacebookF} />
            </Link>
            <Link href="https://instagram.com">
              <FontAwesomeIcon icon={faInstagram} />
            </Link>
            <Link href="https://twitter.com">
              <FontAwesomeIcon icon={faTwitter} />
            </Link>
          </div>
          <p>Contact: info@junglecbd.fr</p>
          <p>Tél: 01 23 45 67 89</p>
        </div>
      </div>
      
      <div className={styles.footerBottom}>
        <p>&copy; {year} Jungle CBD. Tous droits réservés.</p>
        <p className={styles.legalNotice}>Produits à base de CBD contenant moins de 0,3% de THC conformément à la législation européenne.</p>
      </div>
    </footer>
  );
};

export default Footer; 