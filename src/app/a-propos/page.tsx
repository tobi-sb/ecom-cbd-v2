import styles from './page.module.css';

export default function APropos() {
  return (
    <div className={styles.aboutContainer}>
      <div className={styles.aboutHeader}>
        <h1>À Propos de Jungle CBD</h1>
        <p>Découvrez notre histoire, notre mission et notre engagement envers la qualité</p>
      </div>
      
      <section className={styles.aboutSection}>
        <div className={styles.aboutContent}>
          <div className={styles.aboutText}>
            <h2>Notre Histoire</h2>
            <p>
              Jungle CBD est née d&apos;une passion pour les vertus naturelles du chanvre et d&apos;une conviction que la nature offre ce qu&apos;il y a de meilleur pour notre bien-être. Fondée en 2018 par une équipe d&apos;experts passionnés, notre entreprise s&apos;est rapidement imposée comme une référence dans le domaine des produits CBD de haute qualité.
            </p>
            <p>
              Notre parcours a commencé lorsque notre fondateur, après avoir découvert les bienfaits du CBD pour soulager ses propres problèmes de stress et d&apos;anxiété, a décidé de créer une gamme de produits qui répondrait aux plus hautes exigences de qualité et d&apos;efficacité.
            </p>
          </div>
          <div className={styles.aboutImageContainer}>
            <div className={styles.aboutImagePlaceholder}>
              <span>Image: Notre fondateur dans un champ de chanvre</span>
            </div>
          </div>
        </div>
      </section>
      
      <section className={`${styles.aboutSection} ${styles.altSection}`}>
        <div className={styles.aboutContent}>
          <div className={styles.aboutImageContainer}>
            <div className={styles.aboutImagePlaceholder}>
              <span>Image: Notre processus de production</span>
            </div>
          </div>
          <div className={styles.aboutText}>
            <h2>Notre Mission</h2>
            <p>
              Chez Jungle CBD, notre mission est de démocratiser l&apos;accès à des produits CBD de la plus haute qualité, cultivés et fabriqués dans le respect de l&apos;environnement et de votre bien-être.
            </p>
            <p>
              Nous sommes convaincus que le CBD peut jouer un rôle important dans l&apos;amélioration de la qualité de vie de nombreuses personnes, et nous nous engageons à proposer des produits innovants, sûrs et efficaces.
            </p>
            <p>
              Nous mettons un point d&apos;honneur à éduquer notre communauté sur les bienfaits du CBD et à dissiper les idées reçues sur ce composé naturel extraordinaire.
            </p>
          </div>
        </div>
      </section>
      
      <section className={styles.aboutSection}>
        <div className={styles.valuesContainer}>
          <h2>Nos Valeurs</h2>
          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <h3>Qualité</h3>
              <p>Nous ne faisons aucun compromis sur la qualité de nos produits, depuis la sélection des graines jusqu&apos;à l&apos;emballage final.</p>
            </div>
            
            <div className={styles.valueCard}>
              <h3>Transparence</h3>
              <p>Nous partageons ouvertement nos méthodes de production et les résultats des tests de laboratoire indépendants pour chacun de nos produits.</p>
            </div>
            
            <div className={styles.valueCard}>
              <h3>Durabilité</h3>
              <p>Nous nous engageons à minimiser notre impact environnemental à travers des pratiques agricoles durables et des emballages écologiques.</p>
            </div>
            
            <div className={styles.valueCard}>
              <h3>Innovation</h3>
              <p>Nous investissons constamment dans la recherche pour développer des produits innovants qui répondent aux besoins évolutifs de nos clients.</p>
            </div>
          </div>
        </div>
      </section>
      
      <section className={`${styles.aboutSection} ${styles.altSection}`}>
        <div className={styles.teamContainer}>
          <h2>Notre Équipe</h2>
          <p className={styles.teamIntro}>
            Jungle CBD, c&apos;est avant tout une équipe passionnée et dévouée, composée d&apos;experts dans divers domaines, tous unis par la même passion pour le CBD et ses bienfaits.
          </p>
          
          <div className={styles.teamGrid}>
            <div className={styles.teamMember}>
              <div className={styles.memberImagePlaceholder}></div>
              <h3>Jean Dubois</h3>
              <p className={styles.memberRole}>Fondateur & CEO</p>
              <p>Passionné de botanique et d&apos;agriculture durable, Jean a fondé Jungle CBD avec la vision de créer des produits CBD qui respectent à la fois la nature et les consommateurs.</p>
            </div>
            
            <div className={styles.teamMember}>
              <div className={styles.memberImagePlaceholder}></div>
              <h3>Marie Laurent</h3>
              <p className={styles.memberRole}>Responsable Qualité</p>
              <p>Pharmacienne de formation, Marie supervise tous les aspects de la qualité et s&apos;assure que chaque produit répond aux normes les plus strictes.</p>
            </div>
            
            <div className={styles.teamMember}>
              <div className={styles.memberImagePlaceholder}></div>
              <h3>Pierre Moreau</h3>
              <p className={styles.memberRole}>Chef des Opérations</p>
              <p>Fort de 15 ans d&apos;expérience dans l&apos;agriculture biologique, Pierre veille à ce que nos pratiques de culture soient toujours respectueuses de l&apos;environnement.</p>
            </div>
          </div>
        </div>
      </section>
      
      <section className={styles.aboutSection}>
        <div className={styles.certificationsContainer}>
          <h2>Nos Certifications</h2>
          <div className={styles.certificationsGrid}>
            <div className={styles.certificationCard}>
              <div className={styles.certificationImagePlaceholder}></div>
              <h3>Agriculture Biologique</h3>
              <p>Tous nos plants de chanvre sont cultivés selon les principes de l&apos;agriculture biologique, sans pesticides ni produits chimiques.</p>
            </div>
            
            <div className={styles.certificationCard}>
              <div className={styles.certificationImagePlaceholder}></div>
              <h3>ISO 9001</h3>
              <p>Notre processus de production est certifié ISO 9001, garantissant un système de gestion de la qualité rigoureux.</p>
            </div>
            
            <div className={styles.certificationCard}>
              <div className={styles.certificationImagePlaceholder}></div>
              <h3>GMP (Good Manufacturing Practices)</h3>
              <p>Nos installations respectent les Bonnes Pratiques de Fabrication, assurant la sécurité et la qualité de nos produits.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 