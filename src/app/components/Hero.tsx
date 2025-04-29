'use client';

import Image from 'next/image';
import styles from '../styles.module.css';
import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlay, 
  faPause, 
  faVolumeUp, 
  faVolumeMute 
} from '@fortawesome/free-solid-svg-icons';
import Loader from './Loader';

const Hero = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // État pour le loader

  // Effet de parallaxe lors du défilement
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current && window.innerWidth > 992) {  // Uniquement sur les écrans plus grands
        const scrollPosition = window.scrollY;
        // On crée un effet subtil de parallaxe en déplaçant légèrement le fond
        const yPos = scrollPosition * 0.3; // Ajuster le facteur pour contrôler l'intensité
        heroRef.current.style.backgroundPositionY = `calc(50% + ${yPos}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Utiliser useEffect pour détecter le côté client
  const [isClient, setIsClient] = useState(false);
  // Masquer la vidéo jusqu'à ce que le poster soit prêt
  const [videoReady, setVideoReady] = useState(false);
  
  // Précharger l'image de fond du Hero
  useEffect(() => {
    if (!isClient) return;
    
    // Utiliser l'API Image du navigateur pour précharger l'image
    const bgImage = new window.Image();
    bgImage.src = '/images/image_test/image_test11.jpg';
    
    bgImage.onload = () => {
      // L'image de fond est chargée
      setIsLoading(false);
    };
    
    bgImage.onerror = () => {
      // En cas d'erreur, on affiche quand même le contenu
      console.error('Erreur lors du chargement de l\'image de fond');
      setIsLoading(false);
    };
    
    // Timeout de sécurité pour éviter un blocage infini
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 5000); // 5 secondes maximum d'attente
    
    return () => clearTimeout(timeout);
  }, [isClient]);
  
  // Vérifier si l'écran est de taille mobile ou tablette
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

  // Détecter quand nous sommes côté client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Utiliser une image statique comme poster pour la vidéo
  // Uniquement exécuté côté client pour éviter les erreurs d'hydratation
  useEffect(() => {
    if (!isClient) return;
    
    // Appliquer directement l'image statique comme poster
    if (videoRef.current) {
      videoRef.current.setAttribute('poster', '/images/capture_1745947510794.png');
      setVideoReady(true);
    }
    
  }, [isClient]); // Dépend de isClient pour s'assurer qu'il s'exécute uniquement côté client

  const togglePlay = () => {
    if (!videoRef.current) return;
    
    try {
      if (isPlaying) {
        // Si la vidéo est en cours de lecture, on la met en pause
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        // Si la vidéo est en pause, on la lance
        // Utiliser une promesse pour gérer correctement la lecture sur mobile
        const playPromise = videoRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // La lecture a démarré avec succès
              setIsPlaying(true);
              // Désactiver le mode muet
              if (videoRef.current) {
                videoRef.current.muted = false;
                setIsMuted(false);
              }
            })
            .catch(error => {
              console.error('Erreur de lecture vidéo:', error);
              // Réinitialiser l'état en cas d'erreur
              setIsPlaying(false);
            });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la gestion de la vidéo:', error);
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent div's onClick
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <>
      {/* Loader qui s'affiche pendant le chargement de l'image de fond */}
      <Loader isLoading={isLoading} />
      
      <section 
        className={`${styles.hero} ${!isLoading ? styles.heroVisible : ''}`} 
        ref={heroRef} 
        style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.5s ease-in-out' }}>

      <div className={styles.heroContent}>
        <div className={styles.heroLogoContainer}>
          <Image 
            src="/images/logo_carre.png" 
            alt="Jungle CBD Logo" 
            width={0}
            height={0}
            sizes="100vw"
            className={styles.heroLogo}
            priority
            style={{ 
              backgroundColor: 'transparent',
              width: '100%',
              height: 'auto',
              maxHeight: '400px'
            }}
          />
        </div>
      </div>
      
      <div className={styles.heroVideoWide}>
        {/* Utiliser une balise video avec les contrôles natifs pour une meilleure compatibilité mobile */}
        <video 
          ref={videoRef}
          controls
          loop 
          playsInline
          preload="auto"
          poster="/images/capture_1745947510794.png"
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px' }}
        >
          <source src="https://test-tobi.s3.eu-north-1.amazonaws.com/version+final+finaliste+.mp4" type="video/mp4" />
          Votre navigateur ne prend pas en charge la lecture vidéo.
        </video>
        {/* Les contrôles natifs du navigateur sont utilisés à la place des contrôles personnalisés */}
      </div>

      
      {/* Description pour mobile et tablette uniquement */}
      {isMobile && isClient && (
        <div className={styles.heroMobileDescription}>
          <p>Découvrez notre gamme de produits CBD de qualité supérieure, cultivés avec soin au cœur de la jungle pour vous offrir une expérience naturelle exceptionnelle. Nos produits sont rigoureusement testés pour garantir leur pureté et leur efficacité.</p>
        </div>
      )}
      
      <div className={styles.heroBlurBottom}></div>
    </section>
    </>
  );
};

export default Hero; 