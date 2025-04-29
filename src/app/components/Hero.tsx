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

const Hero = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);

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
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
        // Activer le son lorsqu'on commence la lecture
        videoRef.current.muted = false;
        setIsMuted(false);
      }
      setIsPlaying(!isPlaying);
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
    <section className={styles.hero} ref={heroRef}>
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
      
      <div className={styles.heroVideoWide} onClick={togglePlay}>
        <video 
          ref={videoRef}
          autoPlay={false}
          loop 
          muted 
          playsInline
          preload="auto"
          style={{ visibility: isClient && videoReady ? 'visible' : 'hidden' }}
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
  );
};

export default Hero; 