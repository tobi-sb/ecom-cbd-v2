import Link from 'next/link';
import styles from '../styles.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCannabis, 
  faTint, 
  faPrescriptionBottle, 
  faCookie, 
  faStar 
} from '@fortawesome/free-solid-svg-icons';

const FeaturedCategories = () => {
  return (
    <section className={styles.featuredCategories}>
      <div className={styles.sectionTitle}>
        <h2>Explorer Notre <span>Univers CBD</span></h2>
        <div className={styles.titleUnderline}></div>
      </div>
      
      <div className={styles.categoriesGrid}>
        <Link href="/categories/fleurs" className={`${styles.categoryTile} ${styles.categoryLarge}`}>
          <div style={{
            backgroundImage: `url('/images/categories/fleur.webp')`,
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
            <FontAwesomeIcon icon={faCannabis} size="2x" />
            <h3>Fleurs CBD</h3>
            <p>Notre sélection premium de fleurs CBD cultivées avec soin</p>
          </div>
          <div className={styles.categoryOverlay}></div>
        </Link>
        
        <div className={styles.categoriesSmallContainer} style={{ overflow: 'hidden' }}>
          <Link href="/categories/huiles" className={`${styles.categoryTile} ${styles.categorySmall}`}>
            <div style={{
              backgroundImage: `url('/images/categories/huile.jpg')`,
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
              <FontAwesomeIcon icon={faTint} size="2x" />
              <h3>Huiles</h3>
              <p>Extraits purs et concentrés pour un usage quotidien</p>
            </div>
            <div className={styles.categoryOverlay}></div>
          </Link>
          
          <Link href="/categories/resines" className={`${styles.categoryTile} ${styles.categorySmall}`}>
            <div style={{
              backgroundImage: `url('/images/categories/resine-cbd.jpg')`,
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
              <FontAwesomeIcon icon={faPrescriptionBottle} size="2x" />
              <h3>Résines</h3>
              <p>Concentrés artisanaux aux arômes intenses</p>
            </div>
            <div className={styles.categoryOverlay}></div>
          </Link>
          
          <Link href="/categories/comestibles" className={`${styles.categoryTile} ${styles.categorySmall}`}>
            <div style={{
              backgroundImage: `url('/images/categories/comestible.jpg')`,
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
              <FontAwesomeIcon icon={faCookie} size="2x" />
              <h3>Comestibles</h3>
              <p>Délicieuses gourmandises infusées au CBD</p>
            </div>
            <div className={styles.categoryOverlay}></div>
          </Link>
          
          <Link href="/categories/nouveautes" className={`${styles.categoryTile} ${styles.categorySmall}`}>
            <div style={{
              backgroundImage: `url('/images/categories/nouveauté.jpg')`,
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
              <FontAwesomeIcon icon={faStar} size="2x" />
              <h3>Nouveautés</h3>
              <p>Découvrez nos dernières innovations CBD</p>
            </div>
            <div className={styles.categoryOverlay}></div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories; 