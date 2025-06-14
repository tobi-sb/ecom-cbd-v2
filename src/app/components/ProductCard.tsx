'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '@/contexts/CartContext';
import { useState, useEffect } from 'react';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  discounted_price?: number | null;
  base_price?: number;
  image: string;
  tag?: string;
  onAddToCart?: () => void;
  customStyles?: {
    productCard?: React.CSSProperties;
    productPrice?: React.CSSProperties;
    price?: React.CSSProperties;
    addToCartBtn?: React.CSSProperties;
  };
}

const ProductCard = ({ 
  id, 
  name, 
  description, 
  price, 
  discounted_price,
  base_price,
  image, 
  tag,
  onAddToCart,
  customStyles = {}
}: ProductCardProps) => {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [truncatedDescription, setTruncatedDescription] = useState('');
  const [screenSize, setScreenSize] = useState('mobile');
  
  // Déterminer le prix à afficher
  const displayPrice = base_price && base_price > 0 ? base_price : price;
  
  // Déterminer si le produit a un prix réduit
  const hasDiscount = discounted_price !== null && discounted_price !== undefined && discounted_price > 0;
  
  // Déterminer le prix à afficher dans le panier (le prix réduit s'il existe)
  const cartPrice = hasDiscount ? discounted_price : displayPrice;

  // Détecter la taille de l'écran et ajuster la troncature
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let charLimit = 60; // Mobile par défaut
      let screenType = 'mobile';
      
      if (width > 1023) {
        charLimit = 120; // Desktop
        screenType = 'desktop';
      } else if (width > 767) {
        charLimit = 90; // Tablette
        screenType = 'tablet';
      }
      
      setScreenSize(screenType);
      
      // Tronquer la description
      if (description.length > charLimit) {
        setTruncatedDescription(`${description.substring(0, charLimit)}...`);
      } else {
        setTruncatedDescription(description);
      }
    };
    
    // Exécuter au chargement et lors du redimensionnement
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [description]);

  const handleAddToCart = (e: React.MouseEvent) => {
    // Stop propagation to prevent navigation when clicking the cart button
    e.preventDefault();
    e.stopPropagation();
    
    setAdding(true);
    
    // Add the product to the cart
    addToCart({
      id,
      name,
      price: cartPrice,
      image,
      description
    });
    
    // Show feedback for a short time
    setTimeout(() => {
      setAdding(false);
      onAddToCart?.();
    }, 500);
  };

  return (
    <>
      <Link href={`/products/${id}`} className="product-card-link-fixed">
        <div className="product-card-fixed" style={customStyles.productCard}>
          <div className="product-image-fixed">
            <Image 
              src={image} 
              alt={name}
              width={300}
              height={150}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
            {tag && <div className="product-tag-fixed">{tag}</div>}
          </div>
          <div className="product-info-fixed">
            <h3 className="product-title-fixed">{name}</h3>
            <p className={`product-description-fixed ${screenSize}-description`}>{truncatedDescription}</p>
            <div className="product-price-fixed" style={customStyles.productPrice}>
              {hasDiscount ? (
                <div className="product-price-container-fixed">
                  <span className="product-price-original-fixed">
                    {displayPrice.toFixed(2)}€
                  </span>
                  <span className="product-price-discount-fixed">
                    {discounted_price?.toFixed(2)}€
                  </span>
                </div>
              ) : (
                <span className="product-price-normal-fixed" style={customStyles.price}>
                  {displayPrice.toFixed(2)}€
                </span>
              )}
              <button 
                className="add-to-cart-btn-fixed" 
                onClick={handleAddToCart}
                aria-label="Ajouter au panier"
                disabled={adding}
                style={customStyles.addToCartBtn}
              >
                <FontAwesomeIcon icon={faCartPlus} />
                <span>Ajouter</span>
              </button>
            </div>
          </div>
        </div>
      </Link>
    </>
  );
};

export default ProductCard; 