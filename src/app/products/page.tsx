'use client';

import { useState } from 'react';
import styles from '../styles.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFilter, 
  faShoppingCart,
  faStar, 
  faStarHalfAlt,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import Image from 'next/image';
import Link from 'next/link';
import { products as allProducts } from '../data/products';

// Catégories pour la sidebar
const categories = [
  { id: 'all', name: 'Tous les produits', count: allProducts.length },
  { id: 'fleurs', name: 'Fleurs CBD', count: allProducts.filter(p => p.category === 'fleurs').length },
  { id: 'huiles', name: 'Huiles CBD', count: allProducts.filter(p => p.category === 'huiles').length },
  { id: 'resines', name: 'Résines CBD', count: allProducts.filter(p => p.category === 'resines').length },
  { id: 'comestibles', name: 'Comestibles', count: allProducts.filter(p => p.category === 'comestibles').length },
  { id: 'nouveautes', name: 'Nouveautés', count: allProducts.filter(p => p.category === 'nouveautes').length }
];

// Produits populaires pour la sidebar
const popularProducts = [
  {
    id: '1',
    name: 'Gorilla Glue CBD',
    price: 39.99,
    image: '/images/gorilla-glue-small-buds-ivory.webp'
  },
  {
    id: '8',
    name: 'Huile CBD Premium 15%',
    price: 49.99,
    image: '/images/huile/huile-de-cbd-5-avec-thc-full-spectrum-chanvroo-france.webp'
  },
  {
    id: '15',
    name: 'Hash CBD King Hassan',
    price: 24.99,
    image: '/images/resines/hash-cbd-king-hassan-easyweed.webp'
  }
];

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

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [filterVisible, setFilterVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState('default');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);

  // Filtrer les produits par catégorie
  const filteredProducts = activeCategory === 'all' 
    ? allProducts 
    : allProducts.filter(product => product.category === activeCategory);

  // Trier les produits selon l'ordre sélectionné
  const sortProducts = () => {
    const sortedProducts = [...filteredProducts];
    
    switch (sortOrder) {
      case 'price-low':
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        // Pour cet exemple, nous trions par id de manière inverse
        sortedProducts.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case 'popularity':
        // Pour cet exemple, nous trions par les produits taggés comme populaires, bestsellers ou premium en premier
        sortedProducts.sort((a, b) => {
          const aPopular = a.tag === 'Bestseller' || a.tag === 'Populaire' || a.tag === 'Premium';
          const bPopular = b.tag === 'Bestseller' || b.tag === 'Populaire' || b.tag === 'Premium';
          return Number(bPopular) - Number(aPopular);
        });
        break;
      default:
        // Par défaut, ne rien faire
        break;
    }
    
    return sortedProducts.filter(product => product.price >= priceRange[0] && product.price <= priceRange[1]);
  };

  const sortedProducts = sortProducts();

  return (
    <>
      {/* Hero Section */}
      <section className={styles.productsHero}>
        <div className={styles.jungleLeaves}></div>
        <div className={styles.productsHeroContent}>
          <h1>Nos Produits CBD</h1>
          <p>Découvrez notre large gamme de produits CBD de haute qualité, issus de cultures biologiques et soigneusement sélectionnés pour votre bien-être.</p>
        </div>
      </section>

      {/* Filter Section */}
      <section className={styles.filterSection}>
        <div className={styles.container}>
          <button 
            className={styles.btnOutline} 
            onClick={() => setFilterVisible(!filterVisible)}
          >
            <FontAwesomeIcon icon={faFilter} /> Filtrer les produits
          </button>
          
          {filterVisible && (
            <div className={styles.filterContainer}>
              <div className={styles.filterGroup}>
                <label htmlFor="category">Catégorie</label>
                <select 
                  id="category" 
                  className={styles.filterSelect}
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                >
                  <option value="all">Toutes les catégories</option>
                  <option value="fleurs">Fleurs CBD</option>
                  <option value="huiles">Huiles CBD</option>
                  <option value="resines">Résines CBD</option>
                  <option value="comestibles">Comestibles</option>
                  <option value="nouveautes">Nouveautés</option>
                </select>
              </div>
              
              <div className={styles.filterGroup}>
                <label htmlFor="sort">Trier par</label>
                <select 
                  id="sort" 
                  className={styles.filterSelect}
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="default">Tri par défaut</option>
                  <option value="popularity">Popularité</option>
                  <option value="price-low">Prix croissant</option>
                  <option value="price-high">Prix décroissant</option>
                  <option value="newest">Nouveautés</option>
                </select>
              </div>
              
              <div className={styles.filterGroup}>
                <label htmlFor="price-range">Gamme de prix</label>
                <input 
                  type="range" 
                  id="price-range" 
                  min="0" 
                  max="100" 
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                  className={styles.priceRange}
                />
                <div className={styles.priceLabels}>
                  <span>0€</span>
                  <span>100€</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Products Section */}
      <section className={styles.productsMain}>
        <div className={styles.container}>
          <div className={styles.productsGridContainer}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
              <div className={styles.sidebarWidget}>
                <h3>Catégories</h3>
                <ul className={styles.categoryList}>
                  {categories.map(category => (
                    <li key={category.id}>
                      <a 
                        href="#" 
                        className={activeCategory === category.id ? styles.active : ''}
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveCategory(category.id);
                        }}
                      >
                        {category.name} <span>{category.count}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className={styles.sidebarWidget}>
                <h3>Filtrer par CBD</h3>
                <div className={styles.checkboxFilters}>
                  <label className={styles.filterCheckbox}>
                    <input type="checkbox" name="cbd-type" value="full-spectrum" />
                    Full Spectrum
                  </label>
                  <label className={styles.filterCheckbox}>
                    <input type="checkbox" name="cbd-type" value="broad-spectrum" />
                    Broad Spectrum
                  </label>
                  <label className={styles.filterCheckbox}>
                    <input type="checkbox" name="cbd-type" value="isolate" />
                    Isolat CBD
                  </label>
                </div>
              </div>
              
              <div className={styles.sidebarWidget}>
                <h3>Pourcentage de CBD</h3>
                <div className={styles.checkboxFilters}>
                  <label className={styles.filterCheckbox}>
                    <input type="checkbox" name="cbd-percentage" value="5" />
                    5% CBD
                  </label>
                  <label className={styles.filterCheckbox}>
                    <input type="checkbox" name="cbd-percentage" value="10" />
                    10% CBD
                  </label>
                  <label className={styles.filterCheckbox}>
                    <input type="checkbox" name="cbd-percentage" value="15" />
                    15% CBD
                  </label>
                  <label className={styles.filterCheckbox}>
                    <input type="checkbox" name="cbd-percentage" value="20" />
                    20% CBD
                  </label>
                  <label className={styles.filterCheckbox}>
                    <input type="checkbox" name="cbd-percentage" value="25" />
                    25% CBD+
                  </label>
                </div>
              </div>
              
              <div className={styles.sidebarWidget}>
                <h3>Meilleures ventes</h3>
                <div className={styles.popularProducts}>
                  {popularProducts.map(product => (
                    <div key={product.id} className={styles.popularProduct}>
                      <Image 
                        src={product.image} 
                        alt={product.name}
                        width={60}
                        height={60}
                      />
                      <div className={styles.popularProductInfo}>
                        <h4>{product.name}</h4>
                        <span className={styles.price}>{product.price.toFixed(2)}€</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className={styles.productsGrid}>
              {sortedProducts.map(product => (
                <div key={product.id} className={styles.productCard}>
                  <Link href={`/products/${product.id}`} className={styles.productLink}>
                    {product.tag && (
                      <div className={`${styles.productBadge} ${
                        product.tag === "Nouveau" ? styles.new :
                        product.tag === "Bestseller" || product.tag === "Populaire" ? styles.bestseller :
                        product.tag === "Premium" || product.tag === "Exclusif" ? styles.premium :
                        product.tag === "Promo" || product.tag.includes('%') ? styles.sale : ''
                      }`}>
                        {product.tag}
                      </div>
                    )}
                    
                    <div className={styles.productImage}>
                      <Image 
                        src={product.image}
                        alt={product.name}
                        width={300}
                        height={300}
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    
                    <div className={styles.productInfo}>
                      <h3>{product.name}</h3>
                      <div className={styles.productRating}>
                        {renderRating(4.0)} {/* Default rating */}
                        <span>(4.0)</span>
                      </div>
                      <p className={styles.productDescription}>{product.description}</p>
                      <div className={styles.productFooter}>
                        <span className={styles.price}>
                          {product.price.toFixed(2)}€
                        </span>
                        <button className={styles.btnOutline} onClick={(e) => e.stopPropagation()}>
                          <FontAwesomeIcon icon={faShoppingCart} className={styles.btnIcon} />
                        </button>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
              
              {sortedProducts.length === 0 && (
                <div className={styles.noResults}>
                  <p>Aucun produit ne correspond à votre recherche.</p>
                  <button 
                    className={styles.btnPrimary}
                    onClick={() => {
                      setActiveCategory('all');
                      setPriceRange([0, 100]);
                    }}
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Pagination */}
          <div className={styles.pagination}>
            <button className={styles.pageNav} disabled>
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <div className={styles.pageNumbers}>
              <a href="#" className={styles.active}>1</a>
              <a href="#">2</a>
              <a href="#">3</a>
              <span>...</span>
              <a href="#">6</a>
            </div>
            <button className={styles.pageNav}>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className={styles.newsletter}>
        <div className={styles.container}>
          <div className={styles.newsletterContent}>
            <div className={styles.newsletterText}>
              <h2>Restez informé</h2>
              <p>Inscrivez-vous à notre newsletter pour recevoir nos dernières actualités, promotions et conseils sur le CBD.</p>
            </div>
            <form className={styles.newsletterForm}>
              <input type="email" placeholder="Votre email" />
              <button type="submit" className={styles.btnPrimary}>S&apos;inscrire</button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}