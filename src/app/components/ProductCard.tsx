'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from '../styles.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
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
  image, 
  tag,
  onAddToCart,
  customStyles = {}
}: ProductCardProps) => {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    // Stop propagation to prevent navigation when clicking the cart button
    e.preventDefault();
    e.stopPropagation();
    
    setAdding(true);
    
    // Add the product to the cart
    addToCart({
      id,
      name,
      price,
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
              <span className={styles.price} style={customStyles.price}>{price.toFixed(2)}€</span>
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