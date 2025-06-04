'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

export default function ProductsLink() {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = '/products';
  };

  return (
    <div style={{ 
      textAlign: 'center', 
      margin: '40px 0',
      position: 'relative',
      zIndex: 9999
    }}>
      <a
        href="/products"
        onClick={handleClick}
        style={{
          backgroundColor: '#FFD700',
          color: '#333',
          padding: '14px 34px',
          borderRadius: '30px',
          fontWeight: 'bold',
          display: 'inline-block',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          textDecoration: 'none',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative'
        }}
        onMouseOver={(e) => {
          const target = e.currentTarget;
          target.style.backgroundColor = '#e6c200';
          target.style.transform = 'translateY(-3px)';
          target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
        }}
        onMouseOut={(e) => {
          const target = e.currentTarget;
          target.style.backgroundColor = '#FFD700';
          target.style.transform = 'translateY(0)';
          target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        }}
      >
        Voir tous nos produits <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: '8px' }} />
      </a>
    </div>
  );
} 