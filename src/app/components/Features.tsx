import styles from '../styles.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf, faCertificate, faTruck } from '@fortawesome/free-solid-svg-icons';

const Features = () => {
  return (
    <section className={styles.featuresSection}>
      <div className={styles.featuresContainer}>
        <div className={styles.sectionTitle}>
          <h2>Nos <span>Engagements</span></h2>
          <div className={styles.titleUnderline}></div>
        </div>
        
        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <FontAwesomeIcon icon={faLeaf} size="lg" />
            </div>
            <h3>100% Naturel</h3>
            <p>Cultivé sans pesticides ni produits chimiques</p>
          </div>
          
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <FontAwesomeIcon icon={faCertificate} size="lg" />
            </div>
            <h3>Qualité Premium</h3>
            <p>Des produits sélectionnés avec rigueur</p>
          </div>
          
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <FontAwesomeIcon icon={faTruck} size="lg" />
            </div>
            <h3>Livraison Rapide</h3>
            <p>Livraison sous 48h dans toute la France</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features; 