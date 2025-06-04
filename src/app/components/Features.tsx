import styles from '../styles.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf, faCertificate, faTruck } from '@fortawesome/free-solid-svg-icons';

const Features = () => {
  return (
    <section className={styles.featuresSection}>
      <div className={styles.featuresContainer}>
        <div className={styles.sectionTitle}>
          <h2 style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}><span style={{ color: '#333333' }}>Nos</span> <span>Engagements</span></h2>
          <div className={styles.titleUnderline}></div>
        </div>
        
        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <div className={styles.featureIconInner}>
                <FontAwesomeIcon icon={faLeaf} />
              </div>
            </div>
            <h3>100% Naturel</h3>
            <p>Cultivé sans pesticides ni produits chimiques</p>
          </div>
          
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <div className={styles.featureIconInner}>
                <FontAwesomeIcon icon={faCertificate} />
              </div>
            </div>
            <h3>Qualité Premium</h3>
            <p>Des produits sélectionnés avec rigueur</p>
          </div>
          
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <div className={styles.featureIconInner}>
                <FontAwesomeIcon icon={faTruck} />
              </div>
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