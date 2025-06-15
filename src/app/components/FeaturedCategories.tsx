'use client';

import Link from 'next/link';
import styles from '../styles.module.css';
import gridStyles from './FeaturedCategories.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCannabis, 
  faTint, 
  faPrescriptionBottle, 
  faCookie, 
  faStar,
  faToolbox,
  faVial
} from '@fortawesome/free-solid-svg-icons';

// Icon mapping for categories
const categoryIcons = {
  'fleurs': faCannabis,
  'huiles': faTint,
  'resines': faPrescriptionBottle,
  'comestibles': faCookie,
  'nouveautes': faStar,
  'accessoires': faToolbox,
  'vapes': faCannabis,
  'extractions': faVial
};

// Liste statique des catégories dans l'ordre exact souhaité
const staticCategories = [
  {
    id: 'fleurs-id',
    name: 'Fleurs CBD',
    slug: 'fleurs',
    description: 'Découvrez notre sélection de fleurs CBD de haute qualité',
    image_url: '/images/categories/fleur.webp'
  },
  {
    id: 'nouveautes-id',
    name: 'Résine CBD',
    slug: 'nouveautes',
    description: 'Découvrez nos dernières nouveautés CBD',
    image_url: '/images/categories/resine-cbd.jpg'
  },
  {
    id: 'huiles-id',
    name: 'Huiles CBD',
    slug: 'huiles',
    description: 'Huiles CBD pour un usage quotidien facile',
    image_url: '/images/categories/huile.jpg'
  },
  {
    id: 'resines-id',
    name: 'Box Découverte',
    slug: 'resines',
    description: 'Résines CBD pour une expérience concentrée',
    image_url: '/images/categories/Frame23.png'
  },
  {
    id: 'extractions-id',
    name: 'Accessoire & Electronique',
    slug: 'extractions',
    description: 'Accessoires pour profiter pleinement de votre expérience CBD',
    image_url: '/images/categories/accesoire.jpg'
  },
  {
    id: 'accessoires-id',
    name: 'Cosmétique',
    slug: 'accessoires',
    description: 'Produits cosmétiques au CBD pour votre bien-être',
    image_url: '/images/categories/cosmetique.jpg'
  },
  {
    id: 'vapes-id',
    name: 'C.B.N',
    slug: 'vapes',
    description: 'Découvrez notre sélection de vaporisateurs pour CBD',
    image_url: '/images/cbn/image.png'
  }
];

const FeaturedCategories = () => {
  // Utiliser la première catégorie (Fleurs CBD) comme catégorie principale
  const mainCategory = staticCategories[0];
  
  // Les 6 autres catégories dans l'ordre
  const displayCategories = staticCategories.slice(1, 7);

  return (
    <section className={styles.featuredCategories}>
      <div className={styles.sectionTitle}>
        <h2>Explorer Notre <span>Univers CBD</span></h2>
        <div className={styles.titleUnderline}></div>
      </div>
      
      <div className={styles.categoriesGrid}>
        <Link href={`/products?category=${mainCategory.slug}`} className={`${styles.categoryTile} ${styles.categoryLarge}`}>
          <div style={{
            backgroundImage: `url('${mainCategory.image_url}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transition: 'transform 0.5s ease',
          }} className={styles.categoryBackground}></div>
          <div className={styles.categoryContent}>
            <FontAwesomeIcon icon={categoryIcons[mainCategory.slug as keyof typeof categoryIcons] || faCannabis} size="2x" />
            <h3>{mainCategory.name}</h3>
          </div>
          <div className={styles.categoryOverlay}></div>
        </Link>
        
        <div className={`${styles.categoriesSmallContainer} ${gridStyles.categoriesSmallContainer}`}>
          {displayCategories.map(category => (
            <Link 
              key={category.id}
              href={`/products?category=${category.slug}`} 
              className={`${styles.categoryTile} ${styles.categorySmall}`}
            >
              <div style={{
                backgroundImage: `url('${category.image_url}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                transition: 'transform 0.5s ease',
              }} className={styles.categoryBackground}></div>
              <div className={styles.categoryContent}>
                <FontAwesomeIcon 
                  icon={categoryIcons[category.slug as keyof typeof categoryIcons] || faStar} 
                  size="2x" 
                />
                <h3>{category.name}</h3>
              </div>
              <div className={styles.categoryOverlay}></div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories; 