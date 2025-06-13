'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '../styles.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingCart, 
  faBars, 
  faXmark,
  faUserShield,
  faUser,
  faSignInAlt
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

const Header = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const headerRef = useRef<HTMLElement>(null);
  const { isAuthenticated, isAdmin } = useAuth();
  const { getItemsCount } = useCart();

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

  const cartCount = getItemsCount();

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
            <Link href="/a-propos" className={pathname === '/a-propos' ? styles.active : ''}>
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
        
        {/* Authentication Links - Visible only on desktop */}
        {!isMobile && isAuthenticated ? (
          <Link href="/profile" className={styles.userLink} title="Mon Profil" style={{ color: 'white' }}>
            <FontAwesomeIcon icon={faUser} />
          </Link>
        ) : !isMobile && (
          <Link href="/login" className={styles.authLink} title="Se connecter" style={{ color: 'white' }}>
            <FontAwesomeIcon icon={faSignInAlt} />
          </Link>
        )}
        
        {/* Admin Link - Only show if user is admin and not on mobile */}
        {!isMobile && isAuthenticated && isAdmin && (
          <Link href="/admin" className={styles.adminLink} title="Administration">
            <FontAwesomeIcon icon={faUserShield} />
          </Link>
        )}
        
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
                  href="/a-propos" 
                  className={pathname === '/a-propos' ? styles.active : ''}
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
              <li>
                <Link 
                  href="/cart" 
                  className={pathname === '/cart' ? styles.active : ''}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FontAwesomeIcon icon={faShoppingCart} style={{ marginRight: '10px' }} />
                  Panier ({cartCount})
                </Link>
              </li>
              
              {/* Authentication Links for Mobile */}
              {isAuthenticated ? (
                <>
                  <li>
                    <Link 
                      href="/profile" 
                      className={pathname === '/profile' ? styles.active : ''}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <FontAwesomeIcon icon={faUser} style={{ marginRight: '10px' }} />
                      Mon Profil
                    </Link>
                  </li>
                  {/* Admin Link - Only show if user is admin */}
                  {isAdmin && (
                    <li>
                      <Link 
                        href="/admin" 
                        className={pathname.startsWith('/admin') ? styles.active : ''}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <FontAwesomeIcon icon={faUserShield} style={{ marginRight: '10px' }} />
                        Admin
                      </Link>
                    </li>
                  )}
                </>
              ) : (
                <>
                  <li>
                    <Link 
                      href="/login" 
                      className={pathname === '/login' ? styles.active : ''}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <FontAwesomeIcon icon={faSignInAlt} style={{ marginRight: '10px', color: 'white' }} />
                      Se connecter
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header; 