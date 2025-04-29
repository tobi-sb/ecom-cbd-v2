'use client';

import Image from 'next/image';
import styles from '../styles.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  tag?: string;
  onAddToCart?: (id: string) => void;
}

const ProductCard = ({ 
  id, 
  name, 
  description, 
  price, 
  image, 
  tag,
  onAddToCart 
}: ProductCardProps) => {
  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(id);
    }
  };

  // Create a truncated description if it's too long
  const truncatedDescription = description.length > 60 
    ? `${description.substring(0, 60)}...` 
    : description;

  return (
    <div className={styles.productCard} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className={styles.productImage} style={{ height: '220px', flexShrink: 0 }}>
        <Image 
          src={image} 
          alt={name}
          width={300}
          height={250}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        />
        {tag && <div className={styles.productTag}>{tag}</div>}
      </div>
      <div className={styles.productInfo} style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        flex: '1', 
        padding: '12px 15px' 
      }}>
        <h3 style={{ 
          height: '42px', 
          overflow: 'hidden', 
          display: '-webkit-box', 
          WebkitLineClamp: 2, 
          WebkitBoxOrient: 'vertical',
          margin: '0 0 5px 0',
          fontSize: '16px',
          lineHeight: '1.3'
        }}>
          {name}
        </h3>
        <p className={styles.productDescription} style={{ 
          height: '48px', 
          overflow: 'hidden', 
          display: '-webkit-box', 
          WebkitLineClamp: 2, 
          WebkitBoxOrient: 'vertical',
          margin: '0 0 10px 0',
          fontSize: '14px',
          lineHeight: '1.4'
        }}>
          {truncatedDescription}
        </p>
        <div className={styles.productPrice} style={{ marginTop: 'auto' }}>
          <span className={styles.price}>{price.toFixed(2)}€</span>
          <a href="#" className={styles.addToCart} onClick={(e) => {
            e.preventDefault();
            handleAddToCart();
          }}>
            <FontAwesomeIcon icon={faPlus} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 