'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import styles from '../styles.module.css';
import './mobile-fixes.css'; // Import des corrections CSS pour mobile
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFilter,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
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
  const [mobileFilterVisible, setMobileFilterVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState('default');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [categories, setCategories] = useState<(Category & { count: number })[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  
  // For custom dropdown styling
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showMobileCategoryDropdown, setShowMobileCategoryDropdown] = useState(false);
  const [showMobileSortDropdown, setShowMobileSortDropdown] = useState(false);
  
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const mobileCategoryDropdownRef = useRef<HTMLDivElement>(null);
  const mobileSortDropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
      if (mobileCategoryDropdownRef.current && !mobileCategoryDropdownRef.current.contains(event.target as Node)) {
        setShowMobileCategoryDropdown(false);
      }
      if (mobileSortDropdownRef.current && !mobileSortDropdownRef.current.contains(event.target as Node)) {
        setShowMobileSortDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Detect if screen is mobile
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 767);
      setIsTablet(width > 767 && width <= 1023);
      setIsDesktop(width > 1023);
    };
    
    // Initial check
    checkScreenSize();
    
    // Add event listener
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Disable body scrolling when filter modal is open
  useEffect(() => {
    if (mobileFilterVisible) {
      // Add class to prevent body scrolling
      document.body.classList.add(styles.bodyNoScroll);
    } else {
      // Remove class when filter is closed
      document.body.classList.remove(styles.bodyNoScroll);
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove(styles.bodyNoScroll);
    };
  }, [mobileFilterVisible, styles.bodyNoScroll]);
  
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
        sortedProducts.sort((a, b) => {
          const priceA = a.price_3g || a.base_price || 0;
          const priceB = b.price_3g || b.base_price || 0;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        sortedProducts.sort((a, b) => {
          const priceA = a.price_3g || a.base_price || 0;
          const priceB = b.price_3g || b.base_price || 0;
          return priceB - priceA;
        });
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

  // Reset all filters to default values
  const resetFilters = () => {
    setActiveCategory('all');
    setSortOrder('default');
    setPriceRange([0, 100]);
  };

  // Filter products by price range
  const filteredProducts = useMemo(() => {
    if (!sortedProducts.length) return [];
    
    // Only filter if price range is not the default
    if (priceRange[0] === 0 && priceRange[1] === 100) {
      return sortedProducts;
    }
    
    return sortedProducts.filter(product => {
      const productPrice = product.price_3g || product.base_price || 0;
      return productPrice >= priceRange[0] && productPrice <= priceRange[1];
    });
  }, [sortedProducts, priceRange]);

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
            onClick={() => {
              if (isMobile) {
                setMobileFilterVisible(true);
              } else {
                setFilterVisible(!filterVisible);
              }
            }}
          >
            <FontAwesomeIcon icon={faFilter} /> Filtrer les produits
          </button>
          
          {/* Desktop filter */}
          {!isMobile && filterVisible && (
            <div className={styles.filterContainer}>
              {/* Custom Category Dropdown */}
              <div className={styles.filterGroup}>
                <label htmlFor="category">Catégorie</label>
                <div 
                  className={styles.customSelect} 
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  ref={categoryDropdownRef}
                >
                  <div className={styles.selectedOption}>
                    {categories.find(c => c.slug === activeCategory)?.name || 'Sélectionner une catégorie'}
                    <span className={styles.dropdownArrow}>▼</span>
                  </div>
                  
                  {showCategoryDropdown && (
                    <div className={styles.options}>
                      {categories.map(category => (
                        <div 
                          key={category.id}
                          className={`${styles.option} ${activeCategory === category.slug ? styles.selectedOption : ''}`}
                          onClick={() => {
                            setActiveCategory(category.slug);
                            setShowCategoryDropdown(false);
                          }}
                        >
                          {category.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Custom Sort Dropdown */}
              <div className={styles.filterGroup}>
                <label htmlFor="sort">Trier par</label>
                <div 
                  className={styles.customSelect} 
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  ref={sortDropdownRef}
                >
                  <div className={styles.selectedOption}>
                    {sortOrder === 'default' && 'Tri par défaut'}
                    {sortOrder === 'popularity' && 'Popularité'}
                    {sortOrder === 'price-low' && 'Prix croissant'}
                    {sortOrder === 'price-high' && 'Prix décroissant'}
                    {sortOrder === 'newest' && 'Nouveautés'}
                    <span className={styles.dropdownArrow}>▼</span>
                  </div>
                  
                  {showSortDropdown && (
                    <div className={styles.options}>
                      <div 
                        className={`${styles.option} ${sortOrder === 'default' ? styles.selectedOption : ''}`}
                        onClick={() => {
                          setSortOrder('default');
                          setShowSortDropdown(false);
                        }}
                      >
                        Tri par défaut
                      </div>
                      <div 
                        className={`${styles.option} ${sortOrder === 'popularity' ? styles.selectedOption : ''}`}
                        onClick={() => {
                          setSortOrder('popularity');
                          setShowSortDropdown(false);
                        }}
                      >
                        Popularité
                      </div>
                      <div 
                        className={`${styles.option} ${sortOrder === 'price-low' ? styles.selectedOption : ''}`}
                        onClick={() => {
                          setSortOrder('price-low');
                          setShowSortDropdown(false);
                        }}
                      >
                        Prix croissant
                      </div>
                      <div 
                        className={`${styles.option} ${sortOrder === 'price-high' ? styles.selectedOption : ''}`}
                        onClick={() => {
                          setSortOrder('price-high');
                          setShowSortDropdown(false);
                        }}
                      >
                        Prix décroissant
                      </div>
                      <div 
                        className={`${styles.option} ${sortOrder === 'newest' ? styles.selectedOption : ''}`}
                        onClick={() => {
                          setSortOrder('newest');
                          setShowSortDropdown(false);
                        }}
                      >
                        Nouveautés
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className={styles.filterGroup}>
                <label htmlFor="price-range">Gamme de prix: <span style={{ color: '#d4af37', fontWeight: 'bold' }}>{priceRange[1]}€</span></label>
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

              {/* Reset Filters Button */}
              <div className={styles.filterGroup}>
                <button 
                  className={styles.resetFilterBtn}
                  onClick={resetFilters}
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          )}
          
          {/* Mobile filter modal */}
          {isMobile && mobileFilterVisible && (
            <div className={styles.mobileFilterContainer}>
              <div className={styles.mobileFilterPanel}>
                <div className={styles.mobileFilterHeader}>
                  <h3>Filtrer les produits</h3>
                  <button 
                    className={styles.closeFilterBtn}
                    onClick={() => setMobileFilterVisible(false)}
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>
                
                {/* Mobile Custom Category Dropdown */}
                <div className={styles.filterGroup}>
                  <label htmlFor="mobile-category">Catégorie</label>
                  <div 
                    className={styles.customSelect} 
                    onClick={() => setShowMobileCategoryDropdown(!showMobileCategoryDropdown)}
                    ref={mobileCategoryDropdownRef}
                  >
                    <div className={styles.selectedOption}>
                      {categories.find(c => c.slug === activeCategory)?.name || 'Sélectionner une catégorie'}
                      <span className={styles.dropdownArrow}>▼</span>
                    </div>
                    
                    {showMobileCategoryDropdown && (
                      <div className={styles.options}>
                        {categories.map(category => (
                          <div 
                            key={category.id}
                            className={`${styles.option} ${activeCategory === category.slug ? styles.selectedOption : ''}`}
                            onClick={() => {
                              setActiveCategory(category.slug);
                              setShowMobileCategoryDropdown(false);
                            }}
                          >
                            {category.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Mobile Custom Sort Dropdown */}
                <div className={styles.filterGroup}>
                  <label htmlFor="mobile-sort">Trier par</label>
                  <div 
                    className={styles.customSelect} 
                    onClick={() => setShowMobileSortDropdown(!showMobileSortDropdown)}
                    ref={mobileSortDropdownRef}
                  >
                    <div className={styles.selectedOption}>
                      {sortOrder === 'default' && 'Tri par défaut'}
                      {sortOrder === 'popularity' && 'Popularité'}
                      {sortOrder === 'price-low' && 'Prix croissant'}
                      {sortOrder === 'price-high' && 'Prix décroissant'}
                      {sortOrder === 'newest' && 'Nouveautés'}
                      <span className={styles.dropdownArrow}>▼</span>
                    </div>
                    
                    {showMobileSortDropdown && (
                      <div className={styles.options}>
                        <div 
                          className={`${styles.option} ${sortOrder === 'default' ? styles.selectedOption : ''}`}
                          onClick={() => {
                            setSortOrder('default');
                            setShowMobileSortDropdown(false);
                          }}
                        >
                          Tri par défaut
                        </div>
                        <div 
                          className={`${styles.option} ${sortOrder === 'popularity' ? styles.selectedOption : ''}`}
                          onClick={() => {
                            setSortOrder('popularity');
                            setShowMobileSortDropdown(false);
                          }}
                        >
                          Popularité
                        </div>
                        <div 
                          className={`${styles.option} ${sortOrder === 'price-low' ? styles.selectedOption : ''}`}
                          onClick={() => {
                            setSortOrder('price-low');
                            setShowMobileSortDropdown(false);
                          }}
                        >
                          Prix croissant
                        </div>
                        <div 
                          className={`${styles.option} ${sortOrder === 'price-high' ? styles.selectedOption : ''}`}
                          onClick={() => {
                            setSortOrder('price-high');
                            setShowMobileSortDropdown(false);
                          }}
                        >
                          Prix décroissant
                        </div>
                        <div 
                          className={`${styles.option} ${sortOrder === 'newest' ? styles.selectedOption : ''}`}
                          onClick={() => {
                            setSortOrder('newest');
                            setShowMobileSortDropdown(false);
                          }}
                        >
                          Nouveautés
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className={styles.filterGroup}>
                  <label htmlFor="mobile-price-range">Gamme de prix: <span style={{ color: '#d4af37', fontWeight: 'bold' }}>{priceRange[1]}€</span></label>
                  <input 
                    type="range" 
                    id="mobile-price-range" 
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
                
                {/* Reset Filters Button */}
                <button 
                  className={styles.resetFilterBtn}
                  onClick={resetFilters}
                >
                  Réinitialiser les filtres
                </button>
                
                <button 
                  className={styles.applyFilterBtn}
                  onClick={() => setMobileFilterVisible(false)}
                >
                  Appliquer les filtres
                </button>
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
                          <span className={styles.popularProductPrice}>
                            {product.base_price > 0 
                              ? `${product.base_price.toFixed(2)}€` 
                              : product.price_3g > 0 
                                ? `${product.price_3g.toFixed(2)}€` 
                                : "0.00€"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
            
            {/* Products Grid */}
            <div className={`products-grid-fixed ${isTablet ? 'tablet-grid' : isDesktop ? 'desktop-grid' : 'mobile-grid'}`}>
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <div 
                    key={product.id} 
                    className="product-grid-item-fixed"
                  >
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      description={product.description}
                      price={product.price_3g || product.base_price || 0}
                      discounted_price={product.discounted_price}
                      base_price={product.base_price}
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