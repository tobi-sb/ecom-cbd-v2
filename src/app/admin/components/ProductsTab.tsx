'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faTimes, faFilter } from '@fortawesome/free-solid-svg-icons';
import { getAllProducts, getAllCategories, deleteProduct } from '@/services/product.service';
import { Product, Category } from '@/types/database.types';
import styles from '../admin.module.css';

export default function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [productsData, categoriesData] = await Promise.all([
          getAllProducts(),
          getAllCategories()
        ]);
        setProducts(productsData);
        setFilteredProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Effet pour filtrer les produits lorsque la catégorie active change
  useEffect(() => {
    if (activeCategory) {
      const filtered = products.filter(product => product.category_id === activeCategory);
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [activeCategory, products]);

  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete);
      const updatedProducts = products.filter(product => product.id !== productToDelete);
      setProducts(updatedProducts);
      setFilteredProducts(
        activeCategory 
          ? updatedProducts.filter(product => product.category_id === activeCategory)
          : updatedProducts
      );
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const getCategoryName = (categoryId: string | undefined) => {
    if (!categoryId) return 'Non catégorisé';
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Non catégorisé';
  };

  // Fonction pour afficher le prix de façon appropriée
  const getDisplayPrice = (product: Product) => {
    // Si le produit a un prix de base, on l'affiche
    if (product.base_price && product.base_price > 0) {
      return `${product.base_price.toFixed(2)}€`;
    }
    
    // Sinon, on vérifie s'il a des prix au gramme
    const hasWeightPricing = product.price_3g > 0 || product.price_5g > 0 || 
                           product.price_10g > 0 || product.price_20g > 0;
    
    if (hasWeightPricing) {
      // Trouver le prix le plus bas parmi les options disponibles
      const prices = [
        product.price_3g > 0 ? product.price_3g : Infinity,
        product.price_5g > 0 ? product.price_5g : Infinity,
        product.price_10g > 0 ? product.price_10g : Infinity,
        product.price_20g > 0 ? product.price_20g : Infinity
      ];
      
      const minPrice = Math.min(...prices);
      
      return minPrice !== Infinity 
        ? `À partir de ${minPrice.toFixed(2)}€` 
        : '0.00€';
    }
    
    // Si aucun prix n'est défini
    return '0.00€';
  };

  // Fonction pour gérer le clic sur un filtre de catégorie
  const handleCategoryFilter = (categoryId: string | null) => {
    setActiveCategory(categoryId);
    setShowMobileFilter(false); // Fermer le filtre mobile après sélection
  };

  return (
    <div className={styles.productsManager}>
      {deleteModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Confirmer la suppression</h3>
            <p>Êtes-vous sûr de vouloir supprimer ce produit? Cette action est irréversible.</p>
            <div className={styles.modalActions}>
              <button 
                className={styles.btnCancel} 
                onClick={() => {
                  setDeleteModalOpen(false);
                  setProductToDelete(null);
                }}
              >
                <FontAwesomeIcon icon={faTimes} /> Annuler
              </button>
              <button 
                className={styles.btnDelete}
                onClick={handleConfirmDelete}
              >
                <FontAwesomeIcon icon={faTrash} /> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filtres par catégorie */}
      <div className={styles.categoryFilters}>
        <div className={styles.categoryFiltersHeader}>
          <h3>Filtrer par catégorie</h3>
          
          {/* Bouton de filtre mobile */}
          <button 
            className={styles.mobileFilterToggle}
            onClick={() => setShowMobileFilter(!showMobileFilter)}
          >
            <FontAwesomeIcon icon={faFilter} /> Filtrer
          </button>
        </div>
        
        {/* Version desktop des filtres */}
        <div className={styles.categoryFilterButtons}>
          <button 
            className={`${styles.categoryFilterBtn} ${activeCategory === null ? styles.active : ''}`}
            onClick={() => handleCategoryFilter(null)}
          >
            Tous
          </button>
          
          {categories.map(category => (
            <button 
              key={category.id}
              className={`${styles.categoryFilterBtn} ${activeCategory === category.id ? styles.active : ''}`}
              onClick={() => handleCategoryFilter(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        {/* Version mobile des filtres (affichée uniquement si showMobileFilter est true) */}
        {showMobileFilter && (
          <div className={styles.mobileCategoryFilters}>
            <button 
              className={`${styles.categoryFilterBtn} ${activeCategory === null ? styles.active : ''}`}
              onClick={() => handleCategoryFilter(null)}
            >
              Tous
            </button>
            
            {categories.map(category => (
              <button 
                key={category.id}
                className={`${styles.categoryFilterBtn} ${activeCategory === category.id ? styles.active : ''}`}
                onClick={() => handleCategoryFilter(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Catégorie</th>
              <th>Prix</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4}>Chargement...</td>
              </tr>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <tr key={product.id}>
                  <td data-label="Nom">{product.name}</td>
                  <td data-label="Catégorie">{getCategoryName(product.category_id)}</td>
                  <td data-label="Prix">{getDisplayPrice(product)}</td>
                  <td data-label="Actions" className={styles.tableActions}>
                    <Link href={`/admin/products/edit/${product.id}`} className={styles.btnEdit}>
                      <FontAwesomeIcon icon={faPen} /> Éditer
                    </Link>
                    <button 
                      className={styles.btnDelete}
                      onClick={() => handleDeleteClick(product.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} /> Supprimer
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className={styles.emptyTable}>
                  {activeCategory ? "Aucun produit dans cette catégorie" : "Aucun produit trouvé"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 