'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './admin.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBox, 
  faList, 
  faPlus, 
  faChartLine,
  faTags,
  faShoppingCart,
  faTicketAlt
} from '@fortawesome/free-solid-svg-icons';
import ProductsTab from './components/ProductsTab';
import CategoriesTab from './components/CategoriesTab';
import OrdersTab from './components/OrdersTab';
import PromoCodesTab from './components/PromoCodesTab';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminSidebar}>
        <h2>Admin Dashboard</h2>
        <nav>
          <ul>
            <li>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={activeTab === 'dashboard' ? styles.active : ''}
              >
                <FontAwesomeIcon icon={faChartLine} /> Dashboard
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('products')}
                className={activeTab === 'products' ? styles.active : ''}
              >
                <FontAwesomeIcon icon={faBox} /> Produits
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('categories')}
                className={activeTab === 'categories' ? styles.active : ''}
              >
                <FontAwesomeIcon icon={faTags} /> Catégories
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('orders')}
                className={activeTab === 'orders' ? styles.active : ''}
              >
                <FontAwesomeIcon icon={faShoppingCart} /> Commandes
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('promocodes')}
                className={activeTab === 'promocodes' ? styles.active : ''}
              >
                <FontAwesomeIcon icon={faTicketAlt} /> Codes promo
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <div className={styles.adminContent}>
        <div className={styles.adminHeader}>
          <h1>{getTabTitle(activeTab)}</h1>
          {activeTab === 'products' && (
            <Link href="/admin/products/new" className={styles.btnNewItem}>
              <FontAwesomeIcon icon={faPlus} /> Nouveau produit
            </Link>
          )}
          {activeTab === 'categories' && (
            <Link href="/admin/categories/new" className={styles.btnNewItem}>
              <FontAwesomeIcon icon={faPlus} /> Nouvelle catégorie
            </Link>
          )}
        </div>

        <div className={styles.adminMain}>
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'products' && <ProductsTab />}
          {activeTab === 'categories' && <CategoriesTab />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'promocodes' && <PromoCodesTab />}
        </div>
      </div>
    </div>
  );
}

function getTabTitle(tab: string) {
  switch (tab) {
    case 'dashboard': return 'Tableau de bord';
    case 'products': return 'Gestion des produits';
    case 'categories': return 'Gestion des catégories';
    case 'orders': return 'Gestion des commandes';
    case 'promocodes': return 'Gestion des codes promo';
    default: return 'Tableau de bord';
  }
}

function DashboardTab() {
  const [productCount, setProductCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Fetch product count
      const { count: productCount, error: productError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      if (!productError) setProductCount(productCount || 0);

      // Fetch category count
      const { count: categoryCount, error: categoryError } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true });
      if (!categoryError) setCategoryCount(categoryCount || 0);

      // Fetch order count
      const { count: orderCount, error: orderError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      if (!orderError) setOrderCount(orderCount || 0);

      setLoading(false);
    }

    fetchData();
  }, []);

  return (
    <div className={styles.dashboard}>
      <div className={styles.statCard}>
        <div className={styles.statIcon}>
          <FontAwesomeIcon icon={faBox} />
        </div>
        <div className={styles.statInfo}>
          <h3>Produits</h3>
          <p className={styles.statValue}>{loading ? '...' : productCount}</p>
        </div>
      </div>
      
      <div className={styles.statCard}>
        <div className={styles.statIcon}>
          <FontAwesomeIcon icon={faTags} />
        </div>
        <div className={styles.statInfo}>
          <h3>Catégories</h3>
          <p className={styles.statValue}>{loading ? '...' : categoryCount}</p>
        </div>
      </div>
      
      <div className={styles.statCard}>
        <div className={styles.statIcon}>
          <FontAwesomeIcon icon={faShoppingCart} />
        </div>
        <div className={styles.statInfo}>
          <h3>Commandes</h3>
          <p className={styles.statValue}>{loading ? '...' : orderCount}</p>
        </div>
      </div>

      <div className={styles.quickLinks}>
        <h3>Accès rapides</h3>
        <div className={styles.quickLinksGrid}>
          <Link href="/admin/products/new" className={styles.quickLink}>
            <FontAwesomeIcon icon={faPlus} /> Ajouter un produit
          </Link>
          <Link href="/admin/categories/new" className={styles.quickLink}>
            <FontAwesomeIcon icon={faPlus} /> Ajouter une catégorie
          </Link>
        </div>
      </div>
    </div>
  );
} 