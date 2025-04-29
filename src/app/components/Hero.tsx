'use client';

import Image from 'next/image';
import styles from '../styles.module.css';
import { useState, useRef, useEffect } from 'react';
import Loader from './Loader';
import { FaPlay } from 'react-icons/fa';

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // État pour le loader
  const [isClient, setIsClient] = useState(false); // État pour détecter le côté client
  const [isPlaying, setIsPlaying] = useState(false); // État pour la lecture vidéo

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

  // Détecter le côté client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Précharger l'image de fond du Hero
  useEffect(() => {
    if (!isClient) return;
    
    // Utiliser l'API Image du navigateur pour précharger l'image
    const bgImage = new window.Image();
    bgImage.src = '/images/image_test/image_test4.jpg';
    
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

  // Gérer la lecture/pause de la vidéo - version avec son activé sur tous les appareils
  const togglePlay = () => {
    if (!videoRef.current) return;
    
    try {
      if (videoRef.current.paused) {
        // Désactiver le mode muet avant de lancer la vidéo
        videoRef.current.muted = false;
        
        // Lancer la vidéo
        videoRef.current.play()
          .then(() => {
            setIsPlaying(true);
            console.log('Vidéo lancée avec succès, son activé');
            
            // Vérifier que le son est bien activé
            if (videoRef.current && videoRef.current.muted) {
              videoRef.current.muted = false;
              console.log('Son activé après vérification');
            }
          })
          .catch(error => {
            console.error('Erreur de lecture vidéo:', error.message);
            
            // En cas d'erreur, essayer de lire en muet puis activer le son après
            if (videoRef.current) {
              videoRef.current.muted = true;
              videoRef.current.play()
                .then(() => {
                  setIsPlaying(true);
                  console.log('Vidéo lancée en muet après erreur');
                  
                  // Essayer d'activer le son après un court délai
                  setTimeout(() => {
                    if (videoRef.current) {
                      videoRef.current.muted = false;
                      console.log('Son activé après délai');
                    }
                  }, 1000);
                })
                .catch(secondError => {
                  console.error('Erreur lors de la seconde tentative:', secondError.message);
                });
            }
          });
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Erreur lors de la manipulation de la vidéo:', error);
    }
  };

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
          {/* Lecteur vidéo personnalisé avec bouton play au centre */}
          <div className={styles.customVideoPlayer}>
            <video 
              ref={videoRef}
              muted
              playsInline
              preload="metadata"
              poster="/images/capture_1745947510794.png"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px' }}
              onClick={togglePlay}
            >
              {/* Utiliser l'URL AWS S3 avec les bons paramètres */}
              <source 
                src="https://test-tobi.s3.eu-north-1.amazonaws.com/video.mp4" 
                type="video/mp4" 
              />
              Votre navigateur ne prend pas en charge la lecture vidéo.
            </video>
            
            {/* Bouton play au centre - toujours visible */}
            {!isPlaying && (
              <div className={styles.centerPlayIcon} onClick={togglePlay}>
                <FaPlay />
              </div>
            )}
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