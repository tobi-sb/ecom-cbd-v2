'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';
import { getAllProducts, getAllCategories, deleteProduct } from '@/services/product.service';
import { Product, Category } from '@/types/database.types';
import styles from '../admin.module.css';

export default function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [productsData, categoriesData] = await Promise.all([
          getAllProducts(),
          getAllCategories()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete);
      setProducts(products.filter(product => product.id !== productToDelete));
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
            ) : products.length > 0 ? (
              products.map(product => (
                <tr key={product.id}>
                  <td data-label="Nom">{product.name}</td>
                  <td data-label="Catégorie">{getCategoryName(product.category_id)}</td>
                  <td data-label="Prix">{product.price_3g?.toFixed(2)}€</td>
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
                  Aucun produit trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 