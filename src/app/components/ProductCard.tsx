'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from '../styles.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  discounted_price?: number | null;
  base_price?: number;
  price_3g?: number;
  price_5g?: number;
  price_10g?: number;
  price_30g?: number;
  price_50g?: number;
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
  price_3g,
  price_5g,
  price_10g,
  price_30g,
  price_50g,
  image, 
  tag,
  onAddToCart,
  customStyles = {}
}: ProductCardProps) => {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);

  // Déterminer si c'est un produit avec un prix de base ou des prix au gramme
  const hasWeightPricing = price_3g && price_3g > 0 || price_5g && price_5g > 0 || 
                         price_10g && price_10g > 0 || price_30g && price_30g > 0 || price_50g && price_50g > 0;
  
  // Déterminer le prix à afficher
  const displayPrice = base_price && base_price > 0 ? base_price : price;
  
  // Déterminer si le produit a un prix réduit
  const hasDiscount = discounted_price !== null && discounted_price !== undefined && discounted_price > 0;
  
  // Déterminer le prix à afficher dans le panier (le prix réduit s'il existe)
  const cartPrice = hasDiscount ? discounted_price : displayPrice;

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

  // Create a truncated description if it's too long
  const truncatedDescription = description.length > 60 
    ? `${description.substring(0, 60)}...` 
    : description;

  return (
    <>
      <Link href={`/products/${id}`} className={styles.productCardLink}>
        <div className={styles.productCard} style={customStyles.productCard}>
          <div className={styles.productImage}>
            <Image 
              src={image} 
              alt={name}
              width={300}
              height={150}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
            {tag && <div className={styles.productTag}>{tag}</div>}
          </div>
          <div className={styles.productInfo}>
            <h3>{name}</h3>
            <p className={styles.productDescription}>{truncatedDescription}</p>
            <div className={styles.productPrice} style={customStyles.productPrice}>
              {hasDiscount ? (
                <div className={styles.priceContainer}>
                  <span className={styles.priceOriginal}>
                    {hasWeightPricing ? `À partir de ${displayPrice.toFixed(2)}€` : `${displayPrice.toFixed(2)}€`}
                  </span>
                  <span className={styles.productListPriceDiscount}>
                    {hasWeightPricing ? `À partir de ${discounted_price?.toFixed(2)}€` : `${discounted_price?.toFixed(2)}€`}
                  </span>
                </div>
              ) : (
                <span className={styles.productListPriceNormal} style={customStyles.price}>
                  {hasWeightPricing ? `À partir de ${displayPrice.toFixed(2)}€` : `${displayPrice.toFixed(2)}€`}
                </span>
              )}
              <button 
                className={`${styles.addToCartBtn} ${adding ? styles.adding : ''}`} 
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