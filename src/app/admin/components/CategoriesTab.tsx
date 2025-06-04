'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';
import { getAllProducts, getAllCategories, deleteCategory } from '@/services/product.service';
import { Product, Category } from '@/types/database.types';
import styles from '../admin.module.css';

export default function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [categoriesData, productsData] = await Promise.all([
          getAllCategories(),
          getAllProducts()
        ]);
        setCategories(categoriesData);
        setProducts(productsData);
      } catch (error) {
        console.error('Failed to fetch categories or products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getProductCount = (categoryId: string) => {
    return products.filter(product => product.category_id === categoryId).length;
  };

  const handleDeleteClick = (categoryId: string) => {
    // Reset error state when opening the modal
    setError(null);
    setCategoryToDelete(categoryId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    
    try {
      await deleteCategory(categoryToDelete);
      // Remove the deleted category from the state
      setCategories(categories.filter(category => category.id !== categoryToDelete));
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (err: any) {
      console.error("Failed to delete category:", err);
      // Handle specific error for categories with products
      if (err.code === 'CATEGORY_HAS_PRODUCTS') {
        setError(err.message);
      } else if (err.code === '23503') { // Foreign key constraint error from database
        setError('Cette catégorie a des produits associés. Veuillez d\'abord supprimer ou réassigner ces produits.');
      } else {
        setError('Une erreur est survenue lors de la suppression de la catégorie.');
      }
    }
  };

  return (
    <div className={styles.categoriesManager}>
      {deleteModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Confirmer la suppression</h3>
            <p>Êtes-vous sûr de vouloir supprimer cette catégorie? Cette action est irréversible.</p>
            <p>Note: Les produits associés à cette catégorie ne seront pas supprimés, mais ils n'auront plus de catégorie.</p>
            
            {/* Display error message if there is one */}
            {error && (
              <div style={{ 
                padding: '10px', 
                backgroundColor: '#FEE2E2', 
                color: '#B91C1C', 
                borderRadius: '4px',
                margin: '10px 0'
              }}>
                {error}
              </div>
            )}
            
            <div className={styles.modalActions}>
              <button 
                className={styles.btnCancel} 
                onClick={() => {
                  setDeleteModalOpen(false);
                  setCategoryToDelete(null);
                  setError(null);
                }}
              >
                <FontAwesomeIcon icon={faTimes} /> Annuler
              </button>
              <button 
                className={styles.btnDelete}
                onClick={handleConfirmDelete}
                disabled={!!error} // Disable button if there's an error
              >
                <FontAwesomeIcon icon={faTrash} /> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Slug</th>
              <th>Description</th>
              <th>Produits</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td>Chargement...</td>
                <td>Chargement...</td>
                <td>Chargement...</td>
                <td>0</td>
                <td className={styles.tableActions}></td>
              </tr>
            ) : categories.length > 0 ? (
              categories.map(category => (
                <tr key={category.id}>
                  <td data-label="Nom">{category.name}</td>
                  <td data-label="Slug">{category.slug}</td>
                  <td data-label="Description">{category.description || '-'}</td>
                  <td data-label="Produits">{getProductCount(category.id)}</td>
                  <td data-label="Actions" className={styles.tableActions}>
                    <Link href={`/admin/categories/edit/${category.id}`} className={styles.btnEdit}>
                      <FontAwesomeIcon icon={faPen} /> Éditer
                    </Link>
                    <button 
                      className={styles.btnDelete}
                      onClick={() => handleDeleteClick(category.id)}
                      disabled={getProductCount(category.id) > 0} // Disable delete button if category has products
                      title={getProductCount(category.id) > 0 ? 'Cette catégorie contient des produits et ne peut pas être supprimée' : 'Supprimer la catégorie'}
                    >
                      <FontAwesomeIcon icon={faTrash} /> Supprimer
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className={styles.emptyTable}>
                  Aucune catégorie trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 