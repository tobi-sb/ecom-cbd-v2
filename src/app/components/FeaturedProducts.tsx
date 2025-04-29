'use client';

import { useState, useEffect } from 'react';
import styles from '../styles.module.css';
import ProductCard from './ProductCard';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCannabis, 
  faLeaf, 
  faTint, 
  faPrescriptionBottle, 
  faCookie,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';

// Données des produits (à remplacer par un appel API réel)
const products = [
  // Fleurs CBD (7 produits)
  {
    id: '1',
    name: 'Gorilla Glue CBD',
    description: 'Small Buds - Saveur intense et relaxante',
    price: 39.99,
    image: '/images/gorilla-glue-small-buds-ivory.webp',
    tag: 'Bestseller',
    category: 'fleurs'
  },
  {
    id: '2',
    name: 'Harlequin Indoor',
    description: 'Fleurs CBD indoor - Saveur tropicale',
    price: 12.99,
    image: '/images/fleurs-cbd-indoor-harlequin-ivory.webp',
    tag: 'Nouveau',
    category: 'fleurs'
  },
  {
    id: '3',
    name: 'Green Crack CBD',
    description: 'Fleurs premium - Énergie et concentration',
    price: 14.50,
    image: '/images/green-crack-fleurs-de-cbd-easy-weed.webp',
    category: 'fleurs'
  },
  {
    id: '4',
    name: 'Pop Corn 79 Outdoor',
    description: 'Fleurs CBD outdoor - Effet apaisant',
    price: 24.99,
    image: '/images/pop-corn-79-fleurs-de-cbd-outdoor.webp',
    category: 'fleurs'
  },
  {
    id: '5',
    name: 'OG Kush CBD',
    description: 'Fleurs premium - Saveur terreux et épicée',
    price: 15.99,
    image: '/images/green-crack-fleurs-de-cbd-easy-weed.webp',
    tag: 'Populaire',
    category: 'fleurs'
  },
  {
    id: '6',
    name: 'Amnesia Haze CBD',
    description: 'Fleurs CBD indoor - Arômes citronnés',
    price: 18.50,
    image: '/images/fleurs-cbd-indoor-harlequin-ivory.webp',
    tag: 'Promo',
    category: 'fleurs'
  },
  {
    id: '7',
    name: 'Critical Mass CBD',
    description: 'Fleurs CBD premium - Relief puissant',
    price: 22.99,
    image: '/images/gorilla-glue-small-buds-ivory.webp',
    category: 'fleurs'
  },
  
  // Huiles CBD (7 produits)
  {
    id: '8',
    name: 'Huile CBD Premium 15%',
    description: 'Extrait de Gorilla Glue - 10ml',
    price: 49.99,
    image: '/images/huile/huile-de-cbd-5-avec-thc-full-spectrum-chanvroo-france.webp',
    tag: 'Exclusif',
    category: 'huiles'
  },
  {
    id: '9',
    name: 'Huile CBD 5% Full Spectrum',
    description: 'Avec THC (<0.3%) - Chanvroo France',
    price: 29.99,
    image: '/images/huile/huile-de-cbd-5-avec-thc-full-spectrum-chanvroo-france (1).jpg',
    category: 'huiles'
  },
  {
    id: '10',
    name: 'Huile CBD 5% Collection',
    description: 'Full Spectrum - Flacon premium',
    price: 39.99,
    image: '/images/huile/huile-de-cbd-5-avec-thc-full-spectrum-chanvroo-france (2).jpg',
    tag: 'Nouveau',
    category: 'huiles'
  },
  {
    id: '11',
    name: 'Huile CBD Immune 10%',
    description: 'Broad Spectrum avec Echinacea',
    price: 45.99,
    image: '/images/huile/huile-de-cbd-immune-10-broad-spectrum-avec-echinacea-harvest-laboratoires.jpg',
    category: 'huiles'
  },
  {
    id: '12',
    name: 'Huile CBD Full Spectrum',
    description: 'Chanvroo France - Qualité supérieure',
    price: 54.99,
    image: '/images/huile/huile-de-cbd-5-avec-thc-full-spectrum-chanvroo-france.jpg',
    tag: 'Premium',
    category: 'huiles'
  },
  {
    id: '13',
    name: 'Huile CBD Transit',
    description: 'Formule digestive - Full Spectrum',
    price: 34.50,
    image: '/images/huile/huile-de-cbd-full-spectrum-transit-chanvroo.jpg',
    category: 'huiles'
  },
  {
    id: '14',
    name: 'Huile CBD Endométriose',
    description: 'CBD+CBG+CBN - Soulagement ciblé',
    price: 79.99,
    image: '/images/huile/huile-de-cbd-10-endometriose-cbd-cbg-cbn.jpg',
    tag: 'Médical',
    category: 'huiles'
  },
  
  // Résines CBD (7 produits)
  {
    id: '15',
    name: 'Hash CBD King Hassan',
    description: 'Qualité premium - EasyWeed',
    price: 24.99,
    image: '/images/resines/hash-cbd-king-hassan-easyweed.webp',
    tag: 'Bestseller',
    category: 'resines'
  },
  {
    id: '16',
    name: 'Résine CBD Olive 3XF',
    description: 'Qualité exceptionnelle - Ivory',
    price: 29.99,
    image: '/images/resines/olive-3xf-resine-de-cbd-ivory.webp',
    category: 'resines'
  },
  {
    id: '17',
    name: 'Hash CBD Afghan Bomb',
    description: 'Puissance et authenticité - Ivory',
    price: 26.90,
    image: '/images/resines/hash-cbd-afghan-bomb-ivory.webp',
    tag: 'Premium',
    category: 'resines'
  },
  {
    id: '18',
    name: 'Le Jaune 18 Résine CBD',
    description: 'Concentration 18% - EasyWeed',
    price: 22.50,
    image: '/images/resines/le-jaune-18-resine-de-cbd-easy-weed.webp',
    category: 'resines'
  },
  {
    id: '19',
    name: 'Hash CBD Morocco Filter',
    description: 'Méthode traditionnelle - Qualité supérieure',
    price: 19.99,
    image: '/images/resines/hash-cbd-morocco-filter.webp',
    tag: 'Exclusif',
    category: 'resines'
  },
  {
    id: '20',
    name: 'Hash CBD Ketama Gold',
    description: 'Variété emblématique - Ivory',
    price: 27.50,
    image: '/images/resines/hash-cbd-ketama-gold-ivory.webp',
    category: 'resines'
  },
  {
    id: '21',
    name: 'Oreoz Résine NBSH',
    description: 'Saveur unique - EasyWeed',
    price: 32.99,
    image: '/images/resines/oreoz-resine-nbsh-easy-weed-.webp',
    tag: 'Nouveau',
    category: 'resines'
  },
  
  // Comestibles CBD (7 produits)
  {
    id: '22',
    name: 'Bonbons CBD Cherry',
    description: 'Saveur cerise - Candy Co.',
    price: 19.99,
    image: '/images/comestible/bonbons-cbd-cherry-cerise-candy-co.webp',
    tag: 'Limited',
    category: 'comestibles'
  },
  {
    id: '23',
    name: 'Bonbons CBD Pomme Verte',
    description: 'Fizzypple - Effet rafraîchissant',
    price: 18.99,
    image: '/images/comestible/bonbons-cbd-fizzypple-pomme-verte-candy-co.webp',
    category: 'comestibles'
  },
  {
    id: '24',
    name: 'Infusion CBD Réflexion',
    description: 'Bio - Herboristerie Alexandra 30g',
    price: 14.50,
    image: '/images/comestible/todo-infusion-cbd-reflexion-bio-herboristerie-alexandra-30g.webp',
    tag: 'Bio',
    category: 'comestibles'
  },
  {
    id: '25',
    name: 'Infusion CBD Zen',
    description: 'Bio - Relaxation et bien-être - 30g',
    price: 15.90,
    image: '/images/comestible/todo2-infusion-cbd-zen-bio-herboristerie-alexandra-30g.webp',
    category: 'comestibles'
  },
  {
    id: '26',
    name: 'Bonbons CBD+CBN Sommeil',
    description: 'À la mélatonine - Shanti Candy',
    price: 22.99,
    image: '/images/comestible/bonbons-cbd-cbn-melatonine-sommeil-shanti-candy.webp',
    tag: 'Bestseller',
    category: 'comestibles'
  },
  {
    id: '27',
    name: 'Infusion CBD Matin Tonique',
    description: 'Bio - Boost d\'énergie naturel - 30g',
    price: 15.50,
    image: '/images/comestible/todo-infusion-cbd-matin-tonique-bio-herboristerie-alexandra-30g.webp',
    category: 'comestibles'
  },
  {
    id: '28',
    name: 'Bonbons CBD Summer Vibes',
    description: 'CBD 5% - Saveurs estivales',
    price: 18.50,
    image: '/images/comestible/bonbons-cbd-5-summer-vibes-shanti-candy (1).webp',
    tag: 'Nouveau',
    category: 'comestibles'
  },
  
  // Nouveautés (quelques produits récemment ajoutés)
  {
    id: '29',
    name: 'CBD Vape Pen',
    description: 'Jetable - Saveur Menthe Glaciale',
    price: 24.99,
    image: '/images/green-crack-fleurs-de-cbd-easy-weed.webp',
    tag: 'Nouveau',
    category: 'nouveautes'
  },
  {
    id: '30',
    name: 'Baume CBD Sport',
    description: 'Tube 50ml - Récupération musculaire',
    price: 34.90,
    image: '/images/gorilla-glue-small-buds-ivory.webp',
    tag: 'Nouveau',
    category: 'nouveautes'
  },
  {
    id: '31',
    name: 'Crème Visage CBD',
    description: 'Pot 30ml - Anti-inflammatoire',
    price: 42.99,
    image: '/images/fleurs-cbd-indoor-harlequin-ivory.webp',
    tag: 'Nouveau',
    category: 'nouveautes'
  }
];

const FeaturedProducts = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [startIndex, setStartIndex] = useState(0);

  // Filter products based on selected category
  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(product => product.category === activeCategory);

  // Reset the start index when category changes
  useEffect(() => {
    setStartIndex(0);
  }, [activeCategory]);

  // Number of products to display in the view
  const productsPerView = 5;
  
  // Handle navigation
  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  const handleNext = () => {
    if (startIndex < filteredProducts.length - productsPerView) {
      setStartIndex(startIndex + 1);
    }
  };

  // Handle category selection
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  // Handle add to cart
  const handleAddToCart = (id: string) => {
    console.log(`Produit ${id} ajouté au panier`);
  };

  return (
    <section className={styles.products}>
      <div className={styles.sectionTitle}>
        <h2>Nos <span>Produits Phares</span></h2>
      </div>
      
      {/* Category selector */}
      <div className={styles.categorySelector}>
        <div className={styles.categoryContainer}>
          <button 
            className={`${styles.categoryBtn} ${activeCategory === 'all' ? styles.active : ''}`}
            onClick={() => handleCategoryChange('all')}
          >
            <FontAwesomeIcon icon={faCannabis} />
            <span>Tous</span>
          </button>
          
          <button 
            className={`${styles.categoryBtn} ${activeCategory === 'fleurs' ? styles.active : ''}`}
            onClick={() => handleCategoryChange('fleurs')}
          >
            <FontAwesomeIcon icon={faLeaf} />
            <span>Fleurs CBD</span>
          </button>
          
          <button 
            className={`${styles.categoryBtn} ${activeCategory === 'huiles' ? styles.active : ''}`}
            onClick={() => handleCategoryChange('huiles')}
          >
            <FontAwesomeIcon icon={faTint} />
            <span>Huiles</span>
          </button>
          
          <button 
            className={`${styles.categoryBtn} ${activeCategory === 'resines' ? styles.active : ''}`}
            onClick={() => handleCategoryChange('resines')}
          >
            <FontAwesomeIcon icon={faPrescriptionBottle} />
            <span>Résines</span>
          </button>
          
          <button 
            className={`${styles.categoryBtn} ${activeCategory === 'comestibles' ? styles.active : ''}`}
            onClick={() => handleCategoryChange('comestibles')}
          >
            <FontAwesomeIcon icon={faCookie} />
            <span>Comestibles</span>
          </button>
        </div>
      </div>
      
      {/* Products display */}
      {filteredProducts.length > 0 ? (
        <>
          {/* Custom Slider */}
          <div 
            style={{
              maxWidth: '1400px',
              margin: '0 auto',
              position: 'relative',
              padding: '0 60px'
            }}
          >
            {/* Navigation buttons */}
            {filteredProducts.length > productsPerView && (
              <button 
                className={styles.sliderNav}
                onClick={handlePrev}
                disabled={startIndex === 0}
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
            )}
            
            {/* Slider content */}
            <div style={{ overflow: 'hidden' }}>
              <div 
                style={{
                  display: 'flex',
                  transition: 'transform 0.4s ease',
                  transform: `translateX(-${startIndex * (100 / productsPerView)}%)`,
                  marginLeft: '5px',
                  marginRight: '5px',
                  paddingBottom: '30px'
                }}
              >
                {filteredProducts.map(product => (
                  <div 
                    key={product.id}
                    style={{
                      flex: `0 0 ${100 / productsPerView}%`,
                      padding: '0 5px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      description={product.description}
                      price={product.price}
                      image={product.image}
                      tag={product.tag}
                      onAddToCart={handleAddToCart}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation right button */}
            {filteredProducts.length > productsPerView && (
              <button 
                className={styles.sliderNav}
                onClick={handleNext}
                disabled={startIndex >= filteredProducts.length - productsPerView}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            )}
          </div>
          
          <Link href="/products" className={styles.btnSecondary}>
            Voir tous nos produits
          </Link>
        </>
      ) : (
        <p className={styles.noProducts}>
          Aucun produit disponible dans cette catégorie pour le moment
        </p>
      )}
    </section>
  );
};

export default FeaturedProducts; 