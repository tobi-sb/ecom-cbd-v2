'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../../styles.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar, 
  faStarHalfAlt, 
  faShieldAlt, 
  faTruck, 
  faLeaf,
  faShoppingCart,
  faHeart,
  faMinus,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import { 
  faFacebookF, 
  faTwitter, 
  faPinterestP, 
  faInstagram 
} from '@fortawesome/free-brands-svg-icons';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';
import { getDetailedProduct } from '../../data/products';

// Fonction pour afficher les étoiles de notation
const renderRating = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  for (let i = 0; i < fullStars; i++) {
    stars.push(<FontAwesomeIcon key={`full-${i}`} icon={faStar} />);
  }
  
  if (hasHalfStar) {
    stars.push(<FontAwesomeIcon key="half" icon={faStarHalfAlt} />);
  }

  for (let i = 0; i < emptyStars; i++) {
    stars.push(<FontAwesomeIcon key={`empty-${i}`} icon={farStar} />);
  }

  return stars;
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const productId = typeof id === 'string' ? id : id?.[0] || '1';
  const product = getDetailedProduct(productId);
  
  const [mainImage, setMainImage] = useState(product.images[0]);
  const [selectedWeight, setSelectedWeight] = useState(product.weightOptions && product.weightOptions.length > 0 ? product.weightOptions[0].weight : 'Standard');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isFavorite, setIsFavorite] = useState(false);

  const selectedWeightOption = product.weightOptions && product.weightOptions.find(option => option.weight === selectedWeight) || (product.weightOptions && product.weightOptions[0]);
  
  const incrementQuantity = () => {
    if (quantity < 10) {
      setQuantity(quantity + 1);
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    console.log(`Added to cart: ${product.name}, Weight: ${selectedWeight}, Quantity: ${quantity}, Price: ${selectedWeightOption?.price || product.price}`);
    // Logique d'ajout au panier à implémenter
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <div className={styles.container}>
          <ul className={styles.breadcrumbList}>
            <li><Link href="/">Accueil</Link></li>
            <li><Link href="/products">Produits</Link></li>
            <li>{product.name}</li>
          </ul>
        </div>
      </div>

      {/* Product Detail Section */}
      <section className={styles.productDetail}>
        <div className={styles.container}>
          <div className={styles.productDetailGrid}>
            {/* Product Images */}
            <div className={styles.productGallery}>
              <div className={styles.productMainImage}>
                <Image 
                  src={mainImage} 
                  alt={product.name}
                  width={500}
                  height={500}
                  style={{ objectFit: 'cover' }}
                  id="main-image"
                />
                {product.tag && (
                  <span className={`${styles.productBadge} ${
                    product.tag === "Nouveau" ? styles.new :
                    product.tag === "Bestseller" || product.tag === "Populaire" ? styles.bestseller :
                    product.tag === "Premium" || product.tag === "Exclusif" ? styles.premium :
                    product.tag === "Promo" || product.tag.includes('%') ? styles.sale : ''
                  }`}>
                    {product.tag}
                  </span>
                )}
              </div>
              
              <div className={styles.productThumbnails}>
                {product.images.map((image, index) => (
                  <div 
                    key={index} 
                    className={`${styles.thumbnail} ${mainImage === image ? styles.active : ''}`}
                    onClick={() => setMainImage(image)}
                  >
                    <Image 
                      src={image} 
                      alt={`${product.name} - Image ${index + 1}`}
                      width={100}
                      height={100}
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Product Info */}
            <div className={styles.productInfoContainer}>
              <h1 className={styles.productTitle}>{product.name}</h1>
              <div className={styles.productMeta}>
                <div className={styles.productRating}>
                  {renderRating(product.rating)}
                  <span className={styles.ratingCount}>({product.rating}) - {product.reviewCount || 0} avis</span>
                </div>
                {product.sku && <span className={styles.productSku}>SKU: {product.sku}</span>}
              </div>
              
              <div className={styles.productPrice}>
                <span className={styles.priceAmount}>{(selectedWeightOption?.price || product.price).toFixed(2)}€</span>
                {product.originalPrice && (
                  <span className={styles.originalPrice}>
                    <del>{product.originalPrice.toFixed(2)}€</del> {product.discount}
                  </span>
                )}
              </div>
              
              <div className={styles.productShortDescription}>
                <p>{product.description}</p>
              </div>
              
              {product.attributes && (
                <div className={styles.productAttributes}>
                  {Object.entries(product.attributes || {}).map(([name, value], index) => (
                    <div key={index} className={styles.attribute}>
                      <span className={styles.attributeName}>{name}:</span>
                      <span className={styles.attributeValue}>{value}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className={styles.productForm}>
                {product.weightOptions && product.weightOptions.length > 0 && (
                  <div className={styles.formGroup}>
                    <label htmlFor="weight">Poids</label>
                    <div className={styles.optionButtons}>
                      {product.weightOptions.map((option, index) => (
                        <button 
                          key={index}
                          className={`${styles.optionBtn} ${selectedWeight === option.weight ? styles.active : ''}`}
                          onClick={() => setSelectedWeight(option.weight)}
                        >
                          {option.weight}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className={`${styles.formGroup} ${styles.quantity}`}>
                  <label htmlFor="quantity">Quantité</label>
                  <div className={styles.quantitySelector}>
                    <button 
                      className={`${styles.quantityBtn} ${styles.minus}`}
                      onClick={decrementQuantity}
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                    <input 
                      type="number" 
                      id="quantity" 
                      name="quantity" 
                      value={quantity}
                      min="1" 
                      max="10"
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    />
                    <button 
                      className={`${styles.quantityBtn} ${styles.plus}`}
                      onClick={incrementQuantity}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </div>
                </div>
                
                <div className={styles.productActions}>
                  <button 
                    className={`${styles.btnPrimary} ${styles.btnAddToCart}`}
                    onClick={handleAddToCart}
                  >
                    <FontAwesomeIcon icon={faShoppingCart} /> Ajouter au panier
                  </button>
                  <button 
                    className={styles.btnWishlist}
                    onClick={toggleFavorite}
                  >
                    <FontAwesomeIcon icon={isFavorite ? faHeart : farHeart} />
                  </button>
                </div>
              </div>
              
              <div className={styles.productMetaInfo}>
                <div className={styles.metaItem}>
                  <FontAwesomeIcon icon={faShieldAlt} />
                  <span>Testé en laboratoire</span>
                </div>
                <div className={styles.metaItem}>
                  <FontAwesomeIcon icon={faTruck} />
                  <span>Livraison gratuite dès 50€</span>
                </div>
                <div className={styles.metaItem}>
                  <FontAwesomeIcon icon={faLeaf} />
                  <span>Agriculture biologique</span>
                </div>
              </div>
              
              <div className={styles.productShare}>
                <span>Partager:</span>
                <div className={styles.socialShare}>
                  <Link href="#"><FontAwesomeIcon icon={faFacebookF} /></Link>
                  <Link href="#"><FontAwesomeIcon icon={faTwitter} /></Link>
                  <Link href="#"><FontAwesomeIcon icon={faPinterestP} /></Link>
                  <Link href="#"><FontAwesomeIcon icon={faInstagram} /></Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Product Tabs */}
          <div className={styles.productTabs}>
            <div className={styles.tabButtons}>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'description' ? styles.active : ''}`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'additional' ? styles.active : ''}`}
                onClick={() => setActiveTab('additional')}
              >
                Informations complémentaires
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'reviews' ? styles.active : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                Avis ({product.reviewCount || 0})
              </button>
            </div>
            
            <div className={styles.tabContent}>
              {activeTab === 'description' && (
                <div className={styles.productDescription}>
                  <h3>Description du produit</h3>
                  <p>{product.description}</p>
                  <p>Le Gorilla Glue CBD est une fleur de cannabis légale (taux de THC &lt; 0,2%) cultivée avec soin et séchée avec précision pour préserver ses arômes et propriétés. Idéale pour la relaxation, cette variété délivre un effet apaisant sans les effets psychotropes du THC.</p>
                </div>
              )}
              
              {activeTab === 'additional' && product.additionalInfo && (
                <div className={styles.additionalInfo}>
                  <h3>Informations complémentaires</h3>
                  <div className={styles.infoTable}>
                    {Object.entries(product.additionalInfo).map(([name, value], index) => (
                      <div key={index} className={styles.infoRow}>
                        <div className={styles.infoName}>{name}</div>
                        <div className={styles.infoValue}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'reviews' && (
                <div className={styles.reviewsTab}>
                  <div className={styles.reviewSummary}>
                    <div className={styles.summaryBox}>
                      <div className={styles.ratingBig}>{product.rating.toFixed(1)}</div>
                      <div className={styles.ratingStars}>
                        {renderRating(product.rating)}
                      </div>
                      <div className={styles.totalReviews}>Basé sur {product.reviewCount || 0} avis</div>
                    </div>
                  </div>
                  
                  <div className={styles.reviewsList}>
                    {product.reviews && product.reviews.map(review => (
                      <div key={review.id} className={styles.reviewItem}>
                        <div className={styles.reviewHeader}>
                          <div className={styles.reviewAvatar}>
                            {review.avatar ? (
                              <Image src={review.avatar} alt={review.author} width={50} height={50} />
                            ) : (
                              <div className={styles.avatarPlaceholder}>{review.author.charAt(0)}</div>
                            )}
                          </div>
                          <div className={styles.reviewMeta}>
                            <div className={styles.reviewAuthor}>{review.author}</div>
                            <div className={styles.reviewDate}>{review.date}</div>
                          </div>
                          <div className={styles.reviewRating}>
                            {renderRating(review.rating)}
                          </div>
                        </div>
                        <p className={styles.reviewContent}>{review.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Related Products */}
          {product.relatedProducts && product.relatedProducts.length > 0 && (
            <section className={styles.relatedProducts}>
              <div className={styles.container}>
                <h2>Produits similaires</h2>
                <div className={styles.relatedProductsGrid}>
                  {product.relatedProducts.map(relatedId => {
                    try {
                      const relatedProduct = getDetailedProduct(relatedId.toString());
                      return (
                        <div key={relatedId} className={styles.productCard}>
                          <Link href={`/products/${relatedProduct.id}`} className={styles.productLink}>
                            {relatedProduct.tag && (
                              <div className={`${styles.productBadge} ${
                                relatedProduct.tag === "Nouveau" ? styles.new :
                                relatedProduct.tag === "Bestseller" || relatedProduct.tag === "Populaire" ? styles.bestseller :
                                relatedProduct.tag === "Premium" || relatedProduct.tag === "Exclusif" ? styles.premium :
                                relatedProduct.tag === "Promo" || relatedProduct.tag.includes('%') ? styles.sale : ''
                              }`}>
                                {relatedProduct.tag}
                              </div>
                            )}
                            
                            <div className={styles.productImage}>
                              <Image 
                                src={relatedProduct.image}
                                alt={relatedProduct.name}
                                width={300}
                                height={300}
                                style={{ objectFit: 'cover' }}
                              />
                            </div>
                            
                            <div className={styles.productInfo}>
                              <h3>{relatedProduct.name}</h3>
                              <div className={styles.productRating}>
                                {renderRating(relatedProduct.rating)}
                                <span>(4.0)</span>
                              </div>
                              <p className={styles.productDescription}>{relatedProduct.description}</p>
                              <div className={styles.productFooter}>
                                <span className={styles.price}>
                                  {relatedProduct.price.toFixed(2)}€
                                </span>
                                <button className={styles.btnOutline} onClick={(e) => e.preventDefault()}>
                                  <FontAwesomeIcon icon={faShoppingCart} />
                                </button>
                              </div>
                            </div>
                          </Link>
                        </div>
                      );
                    } catch {
                      // Ignorer les produits associés qui n'existent pas
                      return null;
                    }
                  })}
                </div>
              </div>
            </section>
          )}
        </div>
      </section>
    </>
  );
} 