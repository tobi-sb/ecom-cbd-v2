'use client';

import { useState, useEffect, useRef } from 'react';
import styles from '../styles.module.css';
import './featured-products.css'; // Import des styles spécifiques pour les produits en vedette
import AddToCartNotification from './AddToCartNotification';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronLeft,
  faChevronRight,
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
  const [startIndex, setStartIndex] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [productsPerView, setProductsPerView] = useState(3); // Default to 3 products per view
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
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
  
  // Handle navigation
  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  const handleNext = () => {
    // Ensure we don't go beyond the last card
    // Add a small buffer for tablets to ensure last card is fully visible
    const maxIndex = Math.max(0, products.length - productsPerView);
    if (startIndex < maxIndex) {
      setStartIndex(startIndex + 1);
    }
  };

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
            ref={containerRef}
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              position: 'relative',
              padding: '0',
              overflow: 'hidden',
            }}
          >
            {/* Navigation buttons */}
            {products.length > productsPerView && (
              <button 
                className={styles.sliderNav}
                onClick={handlePrev}
                disabled={startIndex === 0}
                style={{ 
                  position: 'absolute', 
                  left: isMobile ? '5px' : isTablet ? '10px' : '10px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  zIndex: 5 
                }}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
            )}
            
            {/* Slider content */}
            <div 
              style={{
                display: 'flex',
                transition: 'transform 0.4s ease',
                transform: `translateX(-${startIndex * (100 / productsPerView)}%)`,
                marginLeft: '0',
                marginRight: '0',
                paddingBottom: '30px',
                width: '100%',
                justifyContent: 'flex-start'
              }}
            >
              {products.map((product, index) => (
                <div 
                  key={product.id}
                  className={`featured-product-container ${index === 0 ? 'featured-product-container-first' : ''}`}
                  style={{
                    flex: `0 0 ${100 / productsPerView}%`,
                    boxSizing: 'border-box'
                  }}
                >
                  <Link href={`/products/${product.id}`} className="featured-product-link">
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
                  </Link>
                </div>
              ))}
            </div>
            
            {/* Navigation right button */}
            {products.length > productsPerView && (
              <button 
                className={styles.sliderNav}
                onClick={handleNext}
                disabled={startIndex >= products.length - productsPerView}
                style={{ 
                  position: 'absolute', 
                  right: isMobile ? '5px' : isTablet ? '10px' : '10px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  zIndex: 5 
                }}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            )}
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