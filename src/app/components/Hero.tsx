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
    if (videoRef.current) {
      try {
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          // Sur mobile, on doit utiliser une promesse pour gérer le play()
          const playPromise = videoRef.current.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                // Lecture démarrée avec succès
                // Activer le son lorsqu'on commence la lecture
                videoRef.current!.muted = false;
                setIsMuted(false);
              })
              .catch(error => {
                // La lecture automatique a été empêchée
                console.error('Erreur de lecture vidéo:', error);
                // Ne pas changer l'état isPlaying si la lecture a échoué
                return;
              });
          }
        }
        // Mettre à jour l'état uniquement si tout s'est bien passé
        setIsPlaying(!isPlaying);
      } catch (error) {
        console.error('Erreur lors de la gestion de la vidéo:', error);
      }
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
      
      <div 
        className={styles.heroVideoWide} 
        onClick={togglePlay}
        onTouchEnd={(e) => {
          // Empêcher le comportement par défaut qui peut causer des problèmes sur certains appareils mobiles
          e.preventDefault();
          togglePlay();
        }}
      >
        <video 
          ref={videoRef}
          autoPlay={false}
          loop 
          muted 
          playsInline
          preload="auto"
          style={{ visibility: isClient && videoReady ? 'visible' : 'visible' }}
          controlsList="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
          onError={(e) => console.error('Erreur vidéo:', e)}
        >
          <source src="https://test-tobi.s3.eu-north-1.amazonaws.com/version+final+finaliste+.mp4" type="video/mp4" />
        </video>
        
        {/* Icône de lecture centrale lorsque la vidéo est en pause */}
        {!isPlaying && (
          <div className={styles.centerPlayIcon}>
            <FontAwesomeIcon icon={faPlay} />
          </div>
        )}
        
        <div className={styles.videoControls}>
          <button className={styles.playPauseBtn} aria-label={isPlaying ? 'Pause' : 'Play'}>
            <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
          </button>
          
          <button 
            className={styles.muteBtn} 
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            <FontAwesomeIcon icon={isMuted ? faVolumeMute : faVolumeUp} />
          </button>
        </div>
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