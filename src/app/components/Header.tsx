'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '../styles.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingCart, 
  faBars, 
  faXmark 
} from '@fortawesome/free-solid-svg-icons';

const Header = () => {
  const pathname = usePathname();
  const [cartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const headerRef = useRef<HTMLElement>(null);

  // Vérifier si l'écran est de taille mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 992);
    };
    
    // Vérifier au chargement
    checkMobile();
    
    // Ajouter un écouteur pour redimensionnement
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  // Gérer l'animation de la barre de navigation lors du défilement
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Déterminer si l'utilisateur défile vers le haut ou vers le bas
      const isScrollingDown = currentScrollY > lastScrollY;
      
      // Ne pas cacher la barre de navigation si nous sommes en haut de la page
      if (currentScrollY < 50) {
        setIsVisible(true);
      } else {
        setIsVisible(!isScrollingDown);
      }
      
      // Mettre à jour la dernière position connue
      lastScrollY = currentScrollY;
      ticking = false;
    };
    
    // Optimiser les performances avec requestAnimationFrame
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    // Ajouter un écouteur pour le défilement avec optimisation
    window.addEventListener('scroll', onScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Empêcher le défilement du body quand le menu mobile est ouvert
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    // Nettoyer l'effet quand le composant est démonté
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [mobileMenuOpen]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header 
      ref={headerRef}
      className={`${styles.header} ${isVisible ? styles.headerVisible : styles.headerHidden}`}>
      <div className={styles.logoContainer}>
        <Link href="/">
          <h1 className={styles.logoText}>
            <span className={styles.logoYellow}>CBD</span>
            <span className={styles.logoWhite}>jungle</span>
          </h1>
        </Link>
      </div>
      
      {/* Navigation principale (desktop) */}
      <nav className={styles.mainNav}>
        <ul>
          <li>
            <Link href="/" className={pathname === '/' ? styles.active : ''}>
              Accueil
            </Link>
          </li>
          <li>
            <Link href="/products" className={pathname === '/products' ? styles.active : ''}>
              Produits
            </Link>
          </li>
          <li>
            <Link href="/about" className={pathname === '/about' ? styles.active : ''}>
              À propos
            </Link>
          </li>
          <li>
            <Link href="/contact" className={pathname === '/contact' ? styles.active : ''}>
              Contact
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className={styles.headerActions}>
        <div className={styles.cart}>
          <Link href="/cart">
            <FontAwesomeIcon icon={faShoppingCart} />
            <span className={styles.cartCount}>{cartCount}</span>
          </Link>
        </div>
        
        {/* Hamburger menu pour mobile (affiché uniquement sur mobile) */}
        {isMobile && (
          <button 
            className={styles.mobileMenuToggle} 
            onClick={toggleMobileMenu}
            aria-label="Menu mobile"
          >
            <FontAwesomeIcon icon={mobileMenuOpen ? faXmark : faBars} />
          </button>
        )}
      </div>
      
      {/* Overlay du menu mobile (affiché uniquement quand le menu est ouvert) */}
      {isMobile && (
        <div 
          className={styles.mobileMenuOverlay} 
          onClick={toggleMobileMenu}
          style={{ display: mobileMenuOpen ? 'block' : 'none' }}
        ></div>
      )}
      
      {/* Menu mobile (affiché uniquement sur mobile et quand il est ouvert) */}
      {isMobile && (
        <div 
          className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.mobileMenuOpen : ''} ${isVisible ? styles.mobileMenuVisible : ''}`}
        >
          <nav>
            <ul>
              <li>
                <Link 
                  href="/" 
                  className={pathname === '/' ? styles.active : ''}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link 
                  href="/products" 
                  className={pathname === '/products' ? styles.active : ''}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Produits
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className={pathname === '/about' ? styles.active : ''}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className={pathname === '/contact' ? styles.active : ''}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header; 