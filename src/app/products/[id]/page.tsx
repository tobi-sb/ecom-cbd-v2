'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  faPlus,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import { 
  faFacebookF, 
  faTwitter, 
  faPinterestP, 
  faInstagram 
} from '@fortawesome/free-brands-svg-icons';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';
import { getDetailedProduct, getProductColorVariants, getProductImages } from '@/services/product.service';
import { ProductWithPrices, ColorVariant, ProductImage, Category } from '@/types/database.types';
import { useCart } from '@/contexts/CartContext';

// Fonction pour afficher les étoiles de notation
const renderRating = (rating: number = 5) => {
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
  const router = useRouter();
  const params = useParams();
  const productId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<ProductWithPrices | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState<string>('');
  const [selectedWeight, setSelectedWeight] = useState<string>('default');
  const [quantity, setQuantity] = useState(1);
  const [inputValue, setInputValue] = useState("1");
  const [activeTab, setActiveTab] = useState('description');
  const [isFavorite, setIsFavorite] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ColorVariant | null>(null);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Vérifier si l'écran est mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 576);
    };
    
    // Vérifier au chargement
    checkIfMobile();
    
    // Ajouter un écouteur d'événement pour les changements de taille
    window.addEventListener('resize', checkIfMobile);
    
    // Nettoyer l'écouteur lors du démontage du composant
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const [productData, variants, images] = await Promise.all([
          getDetailedProduct(productId),
          getProductColorVariants(productId),
          getProductImages(productId)
        ]);
        
        if (!productData) {
          console.error(`Product with ID ${productId} not found`);
          router.push('/products');
          return;
        }
        
        setProduct(productData);
        setColorVariants(variants);
        setProductImages(images);
        
        // Set default values
        if (productData.image_url) {
          setMainImage(productData.image_url);
        }
        
        // Set default selected variant to Basic (main image)
        setSelectedVariant(null);
        
        if (productData.weightOptions && productData.weightOptions.length > 0) {
          setSelectedWeight(productData.weightOptions[0].weight);
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [productId, router]);
  
  if (loading || !product) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Chargement du produit...</p>
      </div>
    );
  }
  
  // Remove the unused variable
  const selectedWeightOption = product.weightOptions.find(option => option.weight === selectedWeight) || product.weightOptions[0];
  const categoryDetails = product.categories as Category;
  
  const incrementQuantity = () => {
    if (quantity < 10) {
      const newValue = quantity + 1;
      setQuantity(newValue);
      setInputValue(newValue.toString());
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      const newValue = quantity - 1;
      setQuantity(newValue);
      setInputValue(newValue.toString());
    }
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value === "") return;
    
    const parsed = parseInt(value);
    if (!isNaN(parsed)) {
      const bounded = Math.min(Math.max(parsed, 1), 10);
      setQuantity(bounded);
    }
  };
  
  const handleQuantityBlur = () => {
    // Make sure the input shows a valid number on blur
    if (inputValue === "" || isNaN(parseInt(inputValue))) {
      setInputValue("1");
      setQuantity(1);
    } else {
      const bounded = Math.min(Math.max(parseInt(inputValue), 1), 10);
      setInputValue(bounded.toString());
      setQuantity(bounded);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    setAddingToCart(true);
    
    // Add product to cart with the selected weight and price
    addToCart({
      id: product.weightOptions.length > 1 
          ? `${product.id}-${selectedWeight}` 
          : product.id,
      name: product.weightOptions.length > 1 && selectedWeight !== 'default'
          ? `${product.name} - ${selectedWeight}`
          : product.name,
      price: selectedWeightOption?.price || 0,
      image: product.image_url || '/images/placeholder-product.jpg',
      description: product.description,
      quantity: quantity
    });
    
    // Show feedback for a short time
    setTimeout(() => {
      setAddingToCart(false);
      setShowNotification(true);
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    }, 500);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleVariantSelect = (variant: ColorVariant) => {
    setSelectedVariant(variant);
    if (variant.image_url) {
      setMainImage(variant.image_url);
    } else {
      // If variant has no image, fall back to main product image
      setMainImage(product?.image_url || '');
    }
  };

  const getAdjustedPrice = (basePrice: number) => {
    if (!selectedVariant) return basePrice;
    return basePrice + (selectedVariant.price_adjustment || 0);
  };

  // Fonction pour calculer le prix au gramme
  const getPricePerGram = (price: number, weight: string): string => {
    // Pour les options de prix spéciales (résines) ou personnalisées qui ne sont pas en gramme
    if (!weight.includes('g') || weight === 'default') return '';
    
    // Extraire le nombre de grammes du format "Xg"
    const grams = parseInt(weight.replace('g', ''));
    if (isNaN(grams) || grams <= 0) return '';
    
    // Calculer le prix par gramme
    const pricePerGram = price / grams;
    
    // Formater avec 2 décimales
    return `${pricePerGram.toFixed(2)}€/g`;
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <div className={styles.container}>
          <ul className={styles.breadcrumbList}>
            <li><Link href="/">Accueil</Link></li>
            <li><Link href="/products">Produits</Link></li>
            {categoryDetails && (
              <li>
                <Link href={`/products?category=${categoryDetails.slug}`}>
                  {categoryDetails.name}
                </Link>
              </li>
            )}
            <li>{product.name}</li>
          </ul>
        </div>
      </div>

      {/* Product Detail Section */}
      <section className={styles.productDetail}>
        <div className={styles.container}>
          <div className={styles.productDetailGrid}>
            {/* Product Images */}
            <div className={styles.productGallery} style={{ marginTop: isMobile ? '20px' : '0' }}>
              <div className={styles.productMainImage}>
                <Image 
                  src={mainImage || '/images/placeholder-product.jpg'} 
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
                {/* Main product image thumbnail */}
                <div 
                  className={`${styles.thumbnail} ${!selectedVariant ? styles.active : ''}`}
                  onClick={() => {
                    setSelectedVariant(null);
                    setMainImage(product?.image_url || '');
                  }}
                >
                  <Image 
                    src={product?.image_url || '/images/placeholder-product.jpg'} 
                    alt={product?.name || 'Product'}
                    width={100}
                    height={100}
                    style={{ objectFit: 'cover' }}
                  />
                </div>

                {/* Additional product images */}
                {productImages.filter(img => !img.is_primary).map((img) => (
                  <div 
                    key={img.id} 
                    className={`${styles.thumbnail} ${mainImage === img.image_url ? styles.active : ''}`}
                    onClick={() => {
                      setSelectedVariant(null);
                      setMainImage(img.image_url);
                    }}
                  >
                    <Image 
                      src={img.image_url} 
                      alt={product?.name || 'Product'}
                      width={100}
                      height={100}
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ))}

                {/* Color variant thumbnails */}
                {colorVariants.map((variant) => (
                  <div 
                    key={variant.id} 
                    className={`${styles.thumbnail} ${selectedVariant?.id === variant.id ? styles.active : ''}`}
                    onClick={() => handleVariantSelect(variant)}
                  >
                    <Image 
                      src={variant.image_url || product?.image_url || '/images/placeholder-product.jpg'} 
                      alt={`${product?.name} - ${variant.color_name}`}
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
              {categoryDetails && (
                <div className={styles.productCategory}>
                  <Link href={`/products?category=${categoryDetails.slug}`}>
                    {categoryDetails.name}
                  </Link>
                </div>
              )}
              
              {/* Color Variants */}
              {colorVariants.length > 0 && (
                <div className={styles.colorVariants}>
                  <h3>Couleurs disponibles</h3>
                  <div className={styles.variantOptions}>
                    {/* Add Basic option */}
                    <button
                      key="basic"
                      className={`${styles.variantOption} ${selectedVariant === null ? styles.active : ''}`}
                      onClick={() => {
                        setSelectedVariant(null);
                        setMainImage(product?.image_url || '');
                      }}
                      style={selectedVariant === null ? {} : { border: '1px solid #0f3f16' }}
                    >
                      <div 
                        className={styles.variantColor} 
                        style={selectedVariant === null ? {} : { border: '1px solid #0f3f16' }}
                      />
                      <span>Basic</span>
                    </button>
                    {/* Color variant thumbnails */}
                    {colorVariants.map((variant) => (
                      <button
                        key={variant.id}
                        className={`${styles.variantOption} ${selectedVariant?.id === variant.id ? styles.active : ''}`}
                        onClick={() => handleVariantSelect(variant)}
                        style={selectedVariant?.id === variant.id ? {} : { border: '1px solid #0f3f16' }}
                      >
                        <div 
                          className={styles.variantColor} 
                          style={{
                            backgroundColor: variant.color_name,
                            ...(selectedVariant?.id === variant.id ? {} : { border: '1px solid #0f3f16' })
                          }} 
                        />
                        <span>{variant.color_name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className={styles.productMeta}>
                <div className={styles.productRating}>
                  {renderRating(product.rating || 0)}
                  <span className={styles.ratingCount}>
                    ({product.rating ? product.rating.toFixed(1) : '0.0'}) - {product.review_count || 0} avis
                  </span>
                </div>
              </div>
              
              <div className={styles.productPrice}>
                {product.discounted_price ? (
                  <div style={{ display: 'flex', alignItems: 'baseline' }}>
                    <span className={styles.priceOriginal}>
                      {getAdjustedPrice(selectedWeightOption.price).toFixed(2)}€
                    </span>
                    <span className={styles.productDetailPriceDiscount}>
                      {getAdjustedPrice(product.discounted_price).toFixed(2)}€
                    </span>
                  </div>
                ) : (
                  <span className={styles.productDetailPriceNormal}>
                    {getAdjustedPrice(selectedWeightOption.price).toFixed(2)}€
                  </span>
                )}
                {selectedWeight !== 'default' && (
                  <span className={styles.priceWeight}>pour {selectedWeight}</span>
                )}
              </div>
              
              <div className={styles.productShortDescription}>
                <p>{product.description}</p>
              </div>
              
              {/* Weight Options Section - Moved above attributes */}
              {product.weightOptions.length > 1 && (
              <div className={styles.productForm} style={{ marginBottom: '20px' }}>
                  <div className={styles.formGroup}>
                    <label htmlFor="weight">Poids</label>
                    <div className={styles.optionButtons}>
                      {product.weightOptions.map((option, index) => {
                        const pricePerGram = getPricePerGram(getAdjustedPrice(option.price), option.weight);
                        return (
                          <button 
                            key={index}
                            className={`${styles.optionBtn} ${selectedWeight === option.weight ? styles.active : ''}`}
                            onClick={() => setSelectedWeight(option.weight)}
                          >
                            <span>{option.weight}</span>
                            {option.weight !== 'default' && (
                              <span className={styles.pricePerGram}>{pricePerGram}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    </div>
                  </div>
                )}
              
              {/* Quantity and Actions Section */}
              <div className={styles.productForm} style={{ marginTop: '20px' }}>
                <div className={`${styles.formGroup} ${styles.quantity}`}>
                  <label htmlFor="quantity">Quantité</label>
                  <div className={styles.quantitySelector}>
                    <button 
                      className={styles.quantityBtn} 
                      onClick={decrementQuantity} 
                      disabled={quantity <= 1}
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                    <input 
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      id="quantity"
                      value={inputValue}
                      min="1"
                      max="10"
                      onChange={handleQuantityChange}
                      onBlur={handleQuantityBlur}
                      className={styles.quantityInput}
                    />
                    <button 
                      className={styles.quantityBtn} 
                      onClick={incrementQuantity}
                      disabled={quantity >= 10}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </div>
                </div>
                
                <div className={styles.productActions}>
                  <button 
                    className={`${styles.btnPrimary} ${addingToCart ? styles.adding : ''}`} 
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                  >
                    <FontAwesomeIcon icon={faShoppingCart} className={styles.btnIcon} />
                    {addingToCart ? 'Ajout en cours...' : 'Ajouter au panier'}
                  </button>
                  <button 
                    className={`${styles.btnFavorite} ${isFavorite ? styles.active : ''}`}
                    onClick={toggleFavorite}
                  >
                    <FontAwesomeIcon icon={isFavorite ? faHeart : farHeart} />
                  </button>
                </div>
              </div>

              {/* N'afficher la div des attributs que si au moins un attribut est présent - Moved below cart button */}
              {(product.origin || 
                (product.cbd_percentage !== null && product.cbd_percentage !== undefined) || 
                (product.culture_type && product.culture_type !== 'none')) && (
              <div className={styles.productAttributes} style={{ marginTop: '20px' }}>
                  {product.origin && (
                <div className={styles.attribute}>
                  <span className={styles.attributeName}>Origine:</span>
                  <span className={styles.attributeValue}>{product.origin}</span>
                </div>
                  )}
                  {product.cbd_percentage !== null && product.cbd_percentage !== undefined && (
                <div className={styles.attribute}>
                  <span className={styles.attributeName}>CBD:</span>
                  <span className={styles.attributeValue}>{product.cbd_percentage}%</span>
                </div>
                  )}
                  {product.culture_type && product.culture_type !== 'none' && (
                <div className={styles.attribute}>
                  <span className={styles.attributeName}>Culture:</span>
                  <span className={styles.attributeValue}>{product.culture_type === 'indoor' ? 'Indoor' : 'Outdoor'}</span>
                </div>
                  )}
                  </div>
                )}
              
              <div className={styles.productFeatures}>
                <div className={styles.feature}>
                  <div className={styles.featureIcon}>
                    <div className={styles.featureIconInner}>
                      <FontAwesomeIcon icon={faShieldAlt} />
                    </div>
                  </div>
                  <div className={styles.featureText}>
                    <h4>Garantie Qualité</h4>
                    <p>Tous nos produits sont testés en laboratoire</p>
                  </div>
                </div>
                <div className={styles.feature}>
                  <div className={styles.featureIcon}>
                    <div className={styles.featureIconInner}>
                      <FontAwesomeIcon icon={faTruck} />
                    </div>
                  </div>
                  <div className={styles.featureText}>
                    <h4>Livraison Gratuite</h4>
                    <p>Pour toute commande supérieure à 50€</p>
                  </div>
                </div>
                <div className={styles.feature}>
                  <div className={styles.featureIcon}>
                    <div className={styles.featureIconInner}>
                      <FontAwesomeIcon icon={faLeaf} />
                    </div>
                  </div>
                  <div className={styles.featureText}>
                    <h4>100% Bio</h4>
                    <p>Cultivé sans pesticides ni herbicides</p>
                  </div>
                </div>
              </div>
              
              <div className={styles.productSocial}>
                <span>Partager:</span>
                <div className={styles.socialLinks}>
                  <a href="#" aria-label="Partager sur Facebook">
                    <FontAwesomeIcon icon={faFacebookF} />
                  </a>
                  <a href="#" aria-label="Partager sur Twitter">
                    <FontAwesomeIcon icon={faTwitter} />
                  </a>
                  <a href="#" aria-label="Partager sur Pinterest">
                    <FontAwesomeIcon icon={faPinterestP} />
                  </a>
                  <a href="#" aria-label="Partager sur Instagram">
                    <FontAwesomeIcon icon={faInstagram} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Tabs Section */}
      <section className={styles.productTabs}>
        <div className={styles.container}>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tabButton} ${activeTab === 'description' ? styles.active : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'details' ? styles.active : ''}`}
              onClick={() => setActiveTab('details')}
            >
              Caractéristiques
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'shipping' ? styles.active : ''}`}
              onClick={() => setActiveTab('shipping')}
            >
              Livraison & Retours
            </button>
          </div>
          
          <div className={styles.tabContent}>
            {activeTab === 'description' && (
              <div className={styles.description}>
                <h3>Description du produit</h3>
                <p>{product.description}</p>
                
                {/* Affichage conditionnel des caractéristiques du produit */}
                {(product.origin || (product.cbd_percentage !== null && product.cbd_percentage !== undefined) || (product.culture_type && product.culture_type !== 'none')) && (
                  <p>
                    Ce produit 
                    {product.origin && ` provient de ${product.origin}`}
                    {product.origin && (product.cbd_percentage !== null && product.cbd_percentage !== undefined) && ' et '}
                    {(product.cbd_percentage !== null && product.cbd_percentage !== undefined) && ` possède un taux de CBD de ${product.cbd_percentage}%`}
                    {((product.origin || (product.cbd_percentage !== null && product.cbd_percentage !== undefined)) && (product.culture_type && product.culture_type !== 'none')) && '. Il est '}
                    {(!(product.origin || (product.cbd_percentage !== null && product.cbd_percentage !== undefined)) && (product.culture_type && product.culture_type !== 'none')) && ' est '}
                    {(product.culture_type && product.culture_type !== 'none') && `cultivé en ${product.culture_type === 'indoor' ? 'intérieur (indoor)' : 'extérieur (outdoor)'} dans des conditions optimales`}
                    .
                  </p>
                )}
                
                {categoryDetails && categoryDetails.description && (
                  <div className={styles.categoryDescription}>
                    <h4>À propos de cette catégorie: {categoryDetails.name}</h4>
                    <p>{categoryDetails.description}</p>
                  </div>
                )}
                <p>Tous nos produits sont conformes à la législation française et européenne avec un taux de THC inférieur à 0,3%.</p>
              </div>
            )}
            
            {activeTab === 'details' && (
              <div className={styles.details}>
                <h3>Caractéristiques</h3>
                <table className={styles.detailsTable}>
                  <tbody>
                    <tr>
                      <th>Poids disponibles</th>
                      <td>{product.weightOptions.map(o => o.weight).join(', ')}</td>
                    </tr>
                    {(product.cbd_percentage !== null && product.cbd_percentage !== undefined) && (
                    <tr>
                      <th>Taux de CBD</th>
                      <td>{product.cbd_percentage}%</td>
                    </tr>
                    )}
                    <tr>
                      <th>Taux de THC</th>
                      <td>&lt; 0,3%</td>
                    </tr>
                    {product.origin && (
                    <tr>
                      <th>Origine</th>
                      <td>{product.origin}</td>
                    </tr>
                    )}
                    {product.culture_type && product.culture_type !== 'none' && (
                    <tr>
                      <th>Type de culture</th>
                      <td>{product.culture_type === 'indoor' ? 'Indoor' : 'Outdoor'}</td>
                    </tr>
                    )}
                    {categoryDetails && categoryDetails.name && (
                      <tr>
                        <th>Catégorie</th>
                        <td>{categoryDetails.name}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            
            {activeTab === 'shipping' && (
              <div className={styles.shipping}>
                <h3>Livraison & Retours</h3>
                <h4>Livraison</h4>
                <p>Nous proposons plusieurs options de livraison :</p>
                <ul>
                  <li>Livraison standard (3-5 jours ouvrables) : 4,99€</li>
                  <li>Livraison express (1-2 jours ouvrables) : 9,99€</li>
                  <li>Livraison gratuite pour toute commande supérieure à 50€</li>
                </ul>
                
                <h4>Politique de retour</h4>
                <p>Nous acceptons les retours dans les 14 jours suivant la réception de votre commande. Pour être éligible à un retour, votre article doit être inutilisé et dans le même état que celui où vous l&apos;avez reçu, et doit également être dans l&apos;emballage d&apos;origine.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Success notification */}
      {showNotification && (
        <div className={styles.notification} style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          padding: '15px 20px',
          borderRadius: '5px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 9999,
          animation: 'slideIn 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FontAwesomeIcon icon={faCheck} />
            <span>Produit ajouté au panier avec succès!</span>
          </div>
          <Link href="/cart" style={{
            marginLeft: '15px',
            backgroundColor: 'white',
            color: '#4CAF50',
            padding: '5px 10px',
            borderRadius: '3px',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            textDecoration: 'none'
          }}>
            Voir le panier
          </Link>
        </div>
      )}
    </>
  );
}

// Add this CSS to styles.module.css to handle animation
// @keyframes slideIn {
//   from { transform: translateX(100%); opacity: 0; }
//   to { transform: translateX(0); opacity: 1; }
// } 