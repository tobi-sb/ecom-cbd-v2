'use client';

import { useState, useEffect, useRef } from 'react';
import styles from '../styles.module.css';
import './featured-products.css'; // Import des styles spécifiques pour les produits en vedette
import AddToCartNotification from './AddToCartNotification';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner,
  faCartPlus
} from '@fortawesome/free-solid-svg-icons';
import { getAllProducts } from '@/services/product.service';
import { Product } from '@/types/database.types';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [productsPerView, setProductsPerView] = useState(3); // Default to 3 products per view
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [lastX, setLastX] = useState(0); // Pour un défilement plus fluide
  const [dragDistance, setDragDistance] = useState(0); // Pour suivre la distance de défilement
  const [touchStartX, setTouchStartX] = useState(0); // Position initiale du toucher
  const [touchStartScrollLeft, setTouchStartScrollLeft] = useState(0); // Position de défilement initiale
  const [velocity, setVelocity] = useState(0); // Vitesse de défilement pour l'inertie
  const [lastMoveTime, setLastMoveTime] = useState(0); // Temps du dernier mouvement
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inertiaRef = useRef<number | null>(null); // Pour stocker l'ID de l'animation d'inertie
  const { addToCart } = useCart();

  // Fetch products from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all products
        const allProducts = await getAllProducts();
        
        // Filter products that are marked as featured
        const featuredProducts = allProducts.filter(product => product.is_featured);
        
        // If no featured products are available, fallback to products with Bestseller or Populaire tag
        if (featuredProducts.length === 0) {
          const popularProducts = allProducts.filter(p => p.tag === 'Bestseller' || p.tag === 'Populaire');
          setProducts(popularProducts.length > 0 ? popularProducts : allProducts.slice(0, 3));
        } else {
          setProducts(featuredProducts);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Update dimensions when window is resized
  useEffect(() => {
    const updateDimensions = () => {
      // We're no longer tracking containerWidth
      // Just keeping the ref for potential future use
    };
    
    // Call it once to initialize
    updateDimensions();
    
    // Add event listener
    window.addEventListener('resize', updateDimensions);
    
    // Cleanup
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Update productsPerView based on window size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width <= 767;
      const tablet = width > 767 && width <= 1023;
      
      setIsMobile(mobile);
      setIsTablet(tablet);
      
      if (mobile) {
        setProductsPerView(2); // 2 produits par ligne sur mobile
      } else if (tablet) {
        setProductsPerView(3); // 3 produits par ligne sur tablette
      } else {
        setProductsPerView(4); // 4 produits par ligne sur desktop
      }
    };

    // Initial calculation
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    // Stop propagation to prevent navigation when clicking the cart button
    e.preventDefault();
    e.stopPropagation();
    
    // Add the product to the cart
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price_3g || product.base_price || 0,
      image: product.image_url || '/images/placeholder-product.jpg',
      description: product.description
    });
    
    // Show notification
    setShowNotification(true);
  };
  
  // Fonction pour naviguer vers la page produit
  const navigateToProduct = (productId: string) => {
    // Vérifier si on est en train de faire défiler
    if (isDragging || dragDistance > 5) {
      return; // Ne pas naviguer si on est en train de faire défiler
    }
    
    // Navigation programmatique
    window.location.href = `/products/${productId}`;
  };

  // Fonction pour appliquer l'effet d'inertie
  const applyInertia = (initialVelocity: number) => {
    // Annuler toute animation d'inertie en cours
    if (inertiaRef.current !== null) {
      cancelAnimationFrame(inertiaRef.current);
    }
    
    // Facteur de décélération (plus petit = décélération plus lente)
    const deceleration = 0.95;
    let currentVelocity = initialVelocity;
    
    const animateInertia = () => {
      if (!containerRef.current || Math.abs(currentVelocity) < 0.5) {
        // Arrêter l'animation quand la vitesse devient négligeable
        return;
      }
      
      // Appliquer la vitesse actuelle au défilement
      containerRef.current.scrollLeft -= currentVelocity;
      
      // Réduire progressivement la vitesse
      currentVelocity *= deceleration;
      
      // Continuer l'animation
      inertiaRef.current = requestAnimationFrame(animateInertia);
    };
    
    // Démarrer l'animation
    inertiaRef.current = requestAnimationFrame(animateInertia);
  };
  
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // Annuler toute animation d'inertie en cours
    if (inertiaRef.current !== null) {
      cancelAnimationFrame(inertiaRef.current);
      inertiaRef.current = null;
    }
    
    if (!containerRef.current) return;
    setIsDragging(true);
    setLastX(e.touches[0].pageX);
    setTouchStartX(e.touches[0].pageX); // Enregistrer la position initiale du toucher
    setTouchStartScrollLeft(containerRef.current.scrollLeft); // Enregistrer la position de défilement initiale
    setDragDistance(0);
    setVelocity(0);
    setLastMoveTime(Date.now());
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    
    const currentTime = Date.now();
    const timeElapsed = currentTime - lastMoveTime;
    
    // Calculer la distance parcourue depuis le dernier mouvement
    const x = e.touches[0].pageX;
    const dx = x - lastX;
    setLastX(x);
    
    // Calculer la vitesse (distance / temps)
    // Limiter la vitesse maximale pour éviter les mouvements trop brusques
    const newVelocity = Math.max(Math.min(dx / (timeElapsed || 1) * 16, 30), -30);
    setVelocity(newVelocity);
    setLastMoveTime(currentTime);
    
    // Calculer la distance totale parcourue depuis le début du toucher
    const totalDx = x - touchStartX;
    
    // Mettre à jour la distance totale de glissement
    setDragDistance(prev => prev + Math.abs(dx));
    
    // Sur mobile, utiliser une approche différente pour le défilement
    if (isMobile) {
      // Calculer la nouvelle position de défilement directement à partir de la position initiale
      const newScrollLeft = touchStartScrollLeft - totalDx * 0.8;
      containerRef.current.scrollLeft = newScrollLeft;
    } else {
      // Sur desktop, utiliser l'approche incrémentale
      containerRef.current.scrollLeft -= dx * 0.3;
    }
    
    // Si le déplacement est significatif, empêcher le défilement de la page
    if (Math.abs(totalDx) > 10) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    // Sur mobile, appliquer l'effet d'inertie
    if (isMobile && containerRef.current) {
      // Appliquer l'inertie avec la vitesse actuelle
      applyInertia(velocity);
    }
    
    // Réinitialiser l'état de glissement
    setTimeout(() => {
      setIsDragging(false);
    }, 50);
  };

  // Mouse/Touch event handlers for dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setLastX(e.pageX);
    setDragDistance(0);
    // Changer le curseur pour indiquer que l'élément est en cours de glissement
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing';
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    
    // Calculer la distance parcourue depuis le dernier mouvement
    const x = e.pageX;
    const dx = x - lastX;
    setLastX(x);
    
    // Appliquer le défilement en fonction du mouvement avec une vitesse réduite (divisé par 2)
    containerRef.current.scrollLeft -= dx * 0.5;
    
    // Mettre à jour la distance totale de glissement
    setDragDistance(prev => prev + Math.abs(dx));
    
    // Empêcher la sélection de texte pendant le défilement
    e.preventDefault();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
  };
  
  if (loading) {
    return (
      <section className={styles.products} style={{ position: 'relative', zIndex: 1 }}>
        <div className={styles.sectionTitle}>
          <h2>Nos <span>Produits Phares</span></h2>
        </div>
        <div className={styles.loadingContainer}>
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          <p>Chargement des produits...</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.products} style={{ position: 'relative', zIndex: 1 }}>
      <div className={styles.sectionTitle}>
        <h2>Nos <span>Produits Phares</span></h2>
      </div>
      
      {/* Products display */}
      {products.length > 0 ? (
        <>
          {/* Custom Slider */}
          <div 
            className="slider-container"
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              position: 'relative',
              padding: '0',
              overflow: 'hidden', // Changé de 'auto' à 'hidden'
              paddingLeft: isMobile ? '10px' : isTablet ? '15px' : '20px',
              paddingRight: isMobile ? '10px' : isTablet ? '15px' : '20px',
            }}
          >
            {/* Slider wrapper - ce div sera celui qui gère le défilement */}
            <div
              ref={containerRef}
              className={isDragging ? 'slider-wrapper is-dragging' : 'slider-wrapper'}
              style={{
                display: 'flex',
                overflow: 'auto',
                scrollBehavior: isMobile ? 'auto' : 'smooth',
                WebkitOverflowScrolling: isMobile ? 'auto' : 'touch',
                msOverflowStyle: 'none', /* IE and Edge */
                scrollbarWidth: 'none', /* Firefox */
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
                scrollSnapType: isMobile ? 'none' : 'x mandatory',
                touchAction: 'pan-x',
                width: '100%',
                height: '100%',
                paddingBottom: '30px',
                transition: isMobile ? 'none' : 'all 0.3s ease'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Slider content */}
              <div 
                style={{
                  display: 'flex',
                  marginLeft: '0',
                  marginRight: '0',
                  paddingBottom: '30px',
                  width: '100%',
                  justifyContent: 'flex-start',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none'
                }}
              >
                {products.map((product, index) => (
                  <div 
                    key={product.id}
                    className={`featured-product-container ${index === 0 ? 'featured-product-container-first' : ''}`}
                    style={{
                      flex: `0 0 ${100 / productsPerView}%`,
                      boxSizing: 'border-box',
                      paddingRight: '20px',
                      scrollSnapAlign: 'start'
                    }}
                  >
                    <div 
                      className="featured-product-card-wrapper"
                      onClick={() => navigateToProduct(product.id)}
                    >
                      <div className="featured-product-card">
                        <div className="featured-product-image">
                          <Image 
                            src={product.image_url || '/images/placeholder-product.jpg'} 
                            alt={product.name}
                            width={300}
                            height={200}
                            style={{ objectFit: 'cover' }}
                          />
                          {product.tag && <div className="featured-product-tag">{product.tag}</div>}
                        </div>
                        <div className="featured-product-info">
                          <h3 className="featured-product-title">{product.name}</h3>
                          <p className="featured-product-description">
                            {product.description.length > 80 
                              ? `${product.description.substring(0, 80)}...` 
                              : product.description}
                          </p>
                          <div className="featured-product-price">
                            {product.discounted_price ? (
                              <div className="featured-product-price-container">
                                <span className="featured-product-price-original">
                                  {(product.price_3g || product.base_price || 0).toFixed(2)}€
                                </span>
                                <span className="featured-product-price-discount">
                                  {product.discounted_price.toFixed(2)}€
                                </span>
                              </div>
                            ) : (
                              <span className="featured-product-price-normal">
                                {(product.price_3g || product.base_price || 0).toFixed(2)}€
                              </span>
                            )}
                            <button 
                              className="featured-add-to-cart-btn" 
                              onClick={(e) => handleAddToCart(e, product)}
                              aria-label="Ajouter au panier"
                            >
                              <FontAwesomeIcon icon={faCartPlus} />
                              <span>Ajouter</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* View All Products Button */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '40px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            zIndex: 10
          }}>
            <Link 
              href="/products" 
              className={styles.btnPrimary}
              style={{
                padding: '10px 25px',
                fontSize: '15px',
                maxWidth: '280px',
                whiteSpace: 'nowrap',
                position: 'relative',
                zIndex: 10
              }}
            >
              Voir tous nos produits
            </Link>
          </div>
        </>
      ) : (
        <p className={styles.noProducts}>
          Aucun produit disponible pour le moment
        </p>
      )}

      {/* Add to Cart Notification */}
      <AddToCartNotification 
        show={showNotification} 
        onClose={() => setShowNotification(false)} 
      />
    </section>
  );
};

export default FeaturedProducts; 