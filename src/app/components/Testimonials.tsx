import styles from '../styles.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faStarHalfAlt } from '@fortawesome/free-solid-svg-icons';

const testimonials = [
  {
    id: 1,
    rating: 5,
    text: "\"L'huile CBD Premium a radicalement amélioré mon sommeil. Je me réveille enfin reposé!\"",
    author: "- Thomas L."
  },
  {
    id: 2,
    rating: 4.5,
    text: "\"Les fleurs Jungle Haze ont un arôme incroyable et des effets relaxants vraiment efficaces.\"",
    author: "- Marie D."
  },
  {
    id: 3,
    rating: 5,
    text: "\"Service client au top et livraison ultra rapide. Je recommande vivement!\"",
    author: "- Lucas P."
  }
];

const renderStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    stars.push(<FontAwesomeIcon key={`full-${i}`} icon={faStar} />);
  }
  
  if (hasHalfStar) {
    stars.push(<FontAwesomeIcon key="half" icon={faStarHalfAlt} />);
  }

  return stars;
};

const Testimonials = () => {
  return (
    <section className={styles.testimonials}>
      <h2>Ce que disent nos clients</h2>
      
      <div className={styles.testimonialContainer}>
        {testimonials.map(testimonial => (
          <div key={testimonial.id} className={styles.testimonial}>
            <div className={styles.stars}>
              {renderStars(testimonial.rating)}
            </div>
            <p>{testimonial.text}</p>
            <p className={styles.author}>{testimonial.author}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials; 