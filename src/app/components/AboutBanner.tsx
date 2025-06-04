import Link from 'next/link';
import styles from '../styles.module.css';

const AboutBanner = () => {
  return (
    <section className={styles.aboutBanner}>
      <div className={styles.aboutContent}>
        <h2>La Force de la Nature</h2>
        <p>
          Chez Jungle CBD, nous croyons au pouvoir des plantes et aux bienfaits naturels du CBD. 
          Notre mission est de vous offrir des produits d&apos;exception, récoltés au cœur de la jungle, 
          pour vous aider à retrouver votre équilibre naturel.
        </p>
        <Link href="/a-propos" className={styles.btnOutline}>
          En savoir plus
        </Link>
      </div>
    </section>
  );
};

export default AboutBanner; 