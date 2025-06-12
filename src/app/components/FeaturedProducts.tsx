'use client';

import { useState, useEffect, CSSProperties, useRef } from 'react';
import styles from '../styles.module.css';
import ProductCard from './ProductCard';
import AddToCartNotification from './AddToCartNotification';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronLeft,
  faChevronRight,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { getAllProducts } from '@/services/product.service';
import { Product } from '@/types/database.types';
import Link from 'next/link';

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [startIndex, setStartIndex] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [productsPerView, setProductsPerView] = useState(3); // Default to 3 products per view
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

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
      const mobile = width <= 576;
      const tablet = width > 576 && width <= 992;
      
      setIsMobile(mobile);
      setIsTablet(tablet);
      
      if (mobile) {
        setProductsPerView(1);
      } else if (tablet) {
        // Specifically for iPad mini and similar tablet sizes
        setProductsPerView(2);
      } else {
        setProductsPerView(3);
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

  const handleAddToCart = () => {
    setShowNotification(true);
  };

  // Add this style block at the end of the component before the return statement
  const mobileStyles = isMobile ? {
    productPrice: {
      display: 'flex',
      flexDirection: 'row' as const,
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%'
    } as CSSProperties,
    addToCartBtn: {
      marginTop: 0
    } as CSSProperties,
    price: {
      marginBottom: 0
    } as CSSProperties
  } : {};

  // Styles for tablet view
  const tabletStyles = isTablet ? {
    productCard: {
      maxWidth: '90%',
      width: '90%',
      margin: '0 auto',
      transform: 'none'
    } as CSSProperties
  } : {};

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
              padding: isMobile ? '0 15px' : isTablet ? '0 25px' : '0 60px',
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
                width: '100%'
              }}
            >
              {products.map((product) => (
                <div 
                  key={product.id}
                  style={{
                    flex: `0 0 ${100 / productsPerView}%`,
                    padding: isMobile ? '0 2%' : isTablet ? '0 8px' : '0 15px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    description={product.description}
                    price={product.price_3g || product.price_5g || product.price_10g || product.base_price || 0}
                    discounted_price={product.discounted_price}
                    base_price={product.base_price}
                    price_3g={product.price_3g}
                    price_5g={product.price_5g}
                    price_10g={product.price_10g}
                    image={product.image_url || '/images/placeholder-product.jpg'}
                    tag={product.tag}
                    onAddToCart={handleAddToCart}
                    customStyles={isMobile ? mobileStyles : isTablet ? tabletStyles : {}}
                  />
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