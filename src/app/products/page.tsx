'use client';

import { useState, useEffect } from 'react';
import styles from '../styles.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFilter, 
  faStar, 
  faStarHalfAlt
} from '@fortawesome/free-solid-svg-icons';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import Image from 'next/image';
import Link from 'next/link';
import { getAllProducts, getProductsByCategory, getAllCategories } from '@/services/product.service';
import { Product, Category } from '@/types/database.types';
import ProductCard from '../components/ProductCard';
import AddToCartNotification from '../components/AddToCartNotification';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [filterVisible, setFilterVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState('default');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [categories, setCategories] = useState<(Category & { count: number })[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  
  // Fetch categories and products from Supabase
  useEffect(() => {
    const fetchCategoriesAndProducts = async () => {
      setLoading(true);
      try {
        // Fetch categories
        const categoriesData = await getAllCategories();
        
        // Fetch all products
        const allProductsData = await getAllProducts();
        setProducts(allProductsData);
        
        // Count products per category
        const categoriesWithCount = categoriesData.map(category => {
          const count = allProductsData.filter(p => 
            p.category_id === category.id || 
            (p.category === category.slug && !p.category_id)
          ).length;
          
          return { ...category, count };
        });
        
        // Add "All Products" option
        const allCategoriesOption = {
          id: 'all',
          name: 'Tous les produits',
          slug: 'all',
          description: 'Tous nos produits CBD',
          image_url: null,
          count: allProductsData.length,
          order: 0 // Toujours en première position
        };
        
        setCategories([allCategoriesOption, ...categoriesWithCount]);
        
        // Set popular products (those with Bestseller or Populaire tag)
        const popularProds = allProductsData
          .filter(p => p.tag === 'Bestseller' || p.tag === 'Populaire')
          .slice(0, 3);
        
        // If not enough products with bestseller tags, just use the first few
        if (popularProds.length < 3) {
          setPopularProducts([...popularProds, ...allProductsData.slice(0, 3 - popularProds.length)]);
        } else {
          setPopularProducts(popularProds);
        }
      } catch (error) {
        console.error("Failed to fetch categories and products:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategoriesAndProducts();
  }, []);
  
  // Fetch products by category when activeCategory changes
  useEffect(() => {
    const fetchProductsByCategory = async () => {
      setLoading(true);
      try {
        const categoryProducts = await getProductsByCategory(activeCategory);
        setProducts(categoryProducts);
      } catch (error) {
        console.error(`Failed to fetch products by category ${activeCategory}:`, error);
      } finally {
        setLoading(false);
      }
    };
    
    if (activeCategory) {
      fetchProductsByCategory();
    }
  }, [activeCategory]);

  // Trier les produits selon l'ordre sélectionné
  const sortProducts = () => {
    if (!products.length) return [];
    
    const sortedProducts = [...products];
    
    switch (sortOrder) {
      case 'price-low':
        sortedProducts.sort((a, b) => a.price_3g - b.price_3g);
        break;
      case 'price-high':
        sortedProducts.sort((a, b) => b.price_3g - a.price_3g);
        break;
      case 'newest':
        // Sort by created_at if available, otherwise by id
        sortedProducts.sort((a, b) => {
          if (a.created_at && b.created_at) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          return b.id.localeCompare(a.id);
        });
        break;
      case 'popularity':
        // Sort by tag if available
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
    
    return sortedProducts.filter(product => product.price_3g >= priceRange[0] && product.price_3g <= priceRange[1]);
  };

  const sortedProducts = sortProducts();
  
  const handleAddToCart = () => {
    setShowNotification(true);
  };

  // Display loading state while fetching products
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Chargement des produits...</p>
      </div>
    );
  }

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
                  {categories.map(category => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
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

      {/* Mobile Categories Slider - Only visible on mobile */}
      <div className={styles.mobileCategoriesSlider}>
        <div className={styles.categoriesScrollContainer}>
          {categories.map(category => (
            <button 
              key={category.id}
              className={`${styles.categoryPill} ${activeCategory === category.slug ? styles.active : ''}`}
              onClick={() => setActiveCategory(category.slug)}
            >
              {category.name} <span className={styles.categoryCount}>({category.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Products Section */}
      <section className={`${styles.productsPage} ${styles.productsMain}`}>
        <div className={styles.container}>
          <div className={styles.productsGridContainer}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
              <div className={styles.sidebarWidget}>
                <h3 className={styles.widgetTitle}>Catégories</h3>
                <ul className={styles.categoryList}>
                  {categories.map(category => (
                    <li key={category.id}>
                      <button 
                        className={`${styles.categoryButton} ${activeCategory === category.slug ? styles.active : ''}`}
                        onClick={() => setActiveCategory(category.slug)}
                      >
                        {category.name} <span className={styles.categoryCount}>({category.count})</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className={styles.sidebarWidget}>
                <h3 className={styles.widgetTitle}>Produits Populaires</h3>
                <div className={styles.popularProductsList}>
                  {popularProducts.map(product => (
                    <Link key={product.id} href={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
                      <div className={styles.popularProduct}>
                        <div className={styles.popularProductImage}>
                          <Image 
                            src={product.image_url || '/images/placeholder-product.jpg'} 
                            alt={product.name}
                            width={80}
                            height={80}
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                        <div className={styles.popularProductInfo}>
                          <h4>{product.name}</h4>
                          <span className={styles.popularProductPrice}>{product.price_3g.toFixed(2)}€</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
            
            {/* Products Grid */}
            <div className={styles.productsGrid}>
              {sortedProducts.length > 0 ? (
                sortedProducts.map(product => (
                  <div key={product.id} className={styles.productGridItem}>
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      description={product.description}
                      price={product.price_3g}
                      image={product.image_url || '/images/placeholder-product.jpg'}
                      tag={product.tag}
                      onAddToCart={handleAddToCart}
                    />
                  </div>
                ))
              ) : (
                <div className={styles.noProducts}>
                  <p>Aucun produit ne correspond à vos critères.</p>
                  <button 
                    className={styles.btnOutline}
                    onClick={() => {
                      setActiveCategory('all');
                      setPriceRange([0, 100]);
                      setSortOrder('default');
                    }}
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      {showNotification && (
        <AddToCartNotification
          show={showNotification}
          onClose={() => setShowNotification(false)}
        />
      )}
    </>
  );
}