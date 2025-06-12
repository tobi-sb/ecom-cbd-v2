'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from '../../../admin.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave, faUpload, faTrash, faBug, faExchangeAlt } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { getCategoryById, updateCategory, uploadCategoryImage, deleteCategory, categoryHasProducts, getAllCategories, getAllProducts, updateProduct } from '@/services/product.service';
import Image from 'next/image';
import { Category, Product } from '@/types/database.types';

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [hasProducts, setHasProducts] = useState(false);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [targetCategoryId, setTargetCategoryId] = useState<string>("");
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [isReassigning, setIsReassigning] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    slug: '',
    description: '',
    order: 0,
    image_url: ''
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch category data and related info
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        // Get all data in parallel
        const [category, productsCheck, allCats, allProds] = await Promise.all([
          getCategoryById(id),
          categoryHasProducts(id),
          getAllCategories(),
          getAllProducts()
        ]);
        
        // Set loading states
        setHasProducts(productsCheck);
        setAllCategories(allCats.filter(c => c.id !== id));
        
        // Find products for this category
        const catProducts = allProds.filter(p => p.category_id === id);
        setCategoryProducts(catProducts);
        
        if (category) {
          setFormData({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            order: category.order || 0,
            image_url: category.image_url
          });
          
          if (category.image_url) {
            setPreviewUrl(category.image_url);
          }
        } else {
          setMessage({
            type: 'error',
            text: 'Catégorie introuvable'
          });
        }
      } catch (error) {
        console.error('Error fetching category:', error);
        setMessage({
          type: 'error',
          text: 'Erreur lors du chargement de la catégorie'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // Toggle debug mode
  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
  };

  // Handle reassigning products to another category
  const handleReassignProducts = async () => {
    if (!targetCategoryId) {
      setMessage({
        type: 'error',
        text: 'Veuillez sélectionner une catégorie cible'
      });
      return;
    }

    setIsReassigning(true);
    try {
      // Update each product to the new category
      for (const product of categoryProducts) {
        await updateProduct(product.id, { 
          ...product,
          category_id: targetCategoryId 
        });
      }

      // Update UI state
      setCategoryProducts([]);
      setHasProducts(false);
      setReassignModalOpen(false);
      
      setMessage({
        type: 'success',
        text: `${categoryProducts.length} produits ont été réassignés avec succès`
      });
    } catch (error) {
      console.error('Error reassigning products:', error);
      setMessage({
        type: 'error',
        text: 'Erreur lors de la réassignation des produits'
      });
    } finally {
      setIsReassigning(false);
    }
  };

  // Generate slug from name if name changes and slug is auto-generated
  useEffect(() => {
    if (formData.name && formData.slug === '') {
      const slug = formData.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');
      
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name, formData.slug]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      errors.name = 'Le nom de la catégorie est requis';
    } else if (formData.name.length < 2) {
      errors.name = 'Le nom doit contenir au moins 2 caractères';
    }
    
    if (!formData.slug?.trim()) {
      errors.slug = 'Le slug est requis';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = 'Le slug ne doit contenir que des lettres minuscules, des chiffres et des tirets';
    }
    
    if (formData.order !== undefined && formData.order < 0) {
      errors.order = 'L\'ordre doit être un nombre positif';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage({
        type: 'error',
        text: 'Veuillez corriger les erreurs dans le formulaire'
      });
      return;
    }
    
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      let imageUrl = formData.image_url || '';
      if (imageFile) {
        try {
          imageUrl = await uploadCategoryImage(imageFile, imageFile.name);
        } catch (error) {
          console.error('Error uploading image:', error);
          setMessage({
            type: 'error',
            text: 'Erreur lors du téléchargement de l\'image. Veuillez réessayer.'
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare the data for update
      const updatedData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        order: formData.order || 0,
        image_url: imageUrl || null
      };

      // Update the category
      await updateCategory(id, updatedData);
      
      setMessage({ 
        type: 'success', 
        text: 'Catégorie mise à jour avec succès!' 
      });
      
      // Redirect after short delay
      setTimeout(() => {
        router.push('/admin?tab=categories');
      }, 2000);
      
    } catch (error: unknown) {
      console.error('Error updating category:', error);
      
      // Handle specific error cases with proper type checking
      const errorObj = error as { code?: string; message?: string };
      
      if (errorObj.code === '23505') { // Unique violation
        setMessage({
          type: 'error',
          text: 'Ce slug est déjà utilisé par une autre catégorie. Veuillez en choisir un autre.'
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: 'Erreur lors de la mise à jour de la catégorie. Veuillez réessayer.' 
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageFile(file);
    }
  };

  const handleImageFile = (file: File) => {
    setImageFile(file);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPreviewUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCategory(id);
      setMessage({
        type: 'success',
        text: 'Catégorie supprimée avec succès!'
      });
      
      // Redirect after short delay
      setTimeout(() => {
        router.push('/admin?tab=categories');
      }, 2000);
    } catch (err: unknown) {
      console.error('Error deleting category:', err);
      
      // Improved error handling with proper type checking
      const errorObj = err as { code?: string; message?: string };
      
      if (errorObj.code === 'CATEGORY_HAS_PRODUCTS') {
        // Custom error message for when category has products
        setMessage({
          type: 'error',
          text: errorObj.message || 'Cette catégorie a des produits associés. Veuillez d\'abord supprimer ou réassigner ces produits.'
        });
      } else if (errorObj.code === '23503') {
        // Database foreign key constraint error
        setMessage({
          type: 'error',
          text: 'Cette catégorie a des produits associés. Veuillez d\'abord supprimer ou réassigner ces produits.'
        });
      } else {
        // Generic error message
        setMessage({
          type: 'error',
          text: 'Erreur lors de la suppression de la catégorie. ' + (errorObj.message || '')
        });
      }
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.adminContainer}>
        <div className={styles.adminHeader}>
          <div className={styles.adminHeaderTitle}>
            <Link href="/admin?tab=categories" className={styles.backButton}>
              <FontAwesomeIcon icon={faArrowLeft} /> Retour
            </Link>
            <h1>Chargement...</h1>
          </div>
        </div>
        <div className={styles.loading}>Chargement des données...</div>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      {/* Reassign Modal */}
      {reassignModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Réassigner les produits</h3>
            <p>Cette catégorie contient {categoryProducts.length} produits. Pour la supprimer, vous devez d&apos;abord réassigner ces produits à une autre catégorie.</p>
            
            <div style={{ margin: '20px 0' }}>
              <label htmlFor="targetCategory" style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                Sélectionner une catégorie cible:
              </label>
              <select 
                id="targetCategory" 
                value={targetCategoryId}
                onChange={(e) => setTargetCategoryId(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  borderRadius: '4px', 
                  border: '1px solid #ddd'
                }}
              >
                <option value="">-- Sélectionner une catégorie --</option>
                {allCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            {categoryProducts.length > 0 && (
              <div style={{ margin: '20px 0', maxHeight: '200px', overflowY: 'auto' }}>
                <h4>Produits à réassigner:</h4>
                <ul style={{ margin: 0, padding: '0 0 0 20px' }}>
                  {categoryProducts.map(product => (
                    <li key={product.id}>{product.name}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className={styles.modalActions}>
              <button 
                className={styles.btnCancel} 
                onClick={() => setReassignModalOpen(false)}
                disabled={isReassigning}
              >
                Annuler
              </button>
              <button 
                className={styles.btnSave}
                onClick={handleReassignProducts}
                disabled={isReassigning || !targetCategoryId}
              >
                {isReassigning ? 'Réassignation...' : 'Réassigner les produits'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Confirmer la suppression</h3>
            <p>Êtes-vous sûr de vouloir supprimer cette catégorie? Cette action est irréversible.</p>
            {hasProducts && (
              <p style={{ color: 'red', fontWeight: 'bold' }}>
                Cette catégorie contient des produits et ne peut pas être supprimée.
                Veuillez d&apos;abord supprimer ou réassigner tous les produits de cette catégorie.
              </p>
            )}
            <div className={styles.modalActions}>
              <button 
                className={styles.btnCancel} 
                onClick={() => setDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                Annuler
              </button>
              <button 
                className={styles.btnDelete}
                onClick={handleDelete}
                disabled={isDeleting || hasProducts}
              >
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.adminHeader}>
        <div className={styles.adminHeaderTitle}>
          <Link href="/admin?tab=categories" className={styles.backButton}>
            <FontAwesomeIcon icon={faArrowLeft} /> Retour
          </Link>
          <h1>Modifier la catégorie: {formData.name}</h1>
          <button 
            onClick={toggleDebugMode} 
            className={styles.debugButton}
            title="Mode debug"
          >
            <FontAwesomeIcon icon={faBug} />
          </button>
        </div>
        <div className={styles.headerActions}>
          {hasProducts && (
            <button 
              onClick={() => setReassignModalOpen(true)} 
              className={styles.btnSave}
              title="Réassigner les produits de cette catégorie"
            >
              <FontAwesomeIcon icon={faExchangeAlt} /> Réassigner {categoryProducts.length} produits
            </button>
          )}
          <button 
            onClick={() => setDeleteModalOpen(true)} 
            className={styles.btnDelete}
            disabled={isDeleting || hasProducts}
            title={hasProducts ? "Cette catégorie contient des produits et ne peut pas être supprimée" : "Supprimer la catégorie"}
          >
            <FontAwesomeIcon icon={faTrash} /> Supprimer
          </button>
        </div>
      </div>

      <div className={styles.formContainer}>
        {message.text && (
          <div className={`${styles.message} ${message.type === 'success' ? styles.success : styles.error}`}>
            {message.text}
          </div>
        )}

        {/* Debug info */}
        {debugMode && (
          <div className={styles.debugInfo}>
            <h3>Debug Info:</h3>
            <pre>{JSON.stringify({
              categoryId: id,
              hasProducts: hasProducts,
              isLoading: isLoading,
              isSubmitting: isSubmitting,
              isDeleting: isDeleting,
              productsCount: categoryProducts.length,
              formData: formData
            }, null, 2)}</pre>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.editForm}>
          <div className={styles.formGrid}>
            <div className={styles.formColumn}>
              <div className={styles.formField}>
                <label htmlFor="name">Nom de la catégorie *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Ex: Fleurs CBD"
                  className={validationErrors.name ? styles.inputError : ''}
                />
                {validationErrors.name && (
                  <span className={styles.errorText}>{validationErrors.name}</span>
                )}
              </div>

              <div className={styles.formField}>
                <label htmlFor="slug">Slug *</label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                  placeholder="Ex: fleurs-cbd"
                  className={validationErrors.slug ? styles.inputError : ''}
                />
                {validationErrors.slug && (
                  <span className={styles.errorText}>{validationErrors.slug}</span>
                )}
                <small>Identifiant unique utilisé dans les URLs</small>
              </div>

              <div className={styles.formField}>
                <label htmlFor="order">Ordre d&apos;affichage</label>
                <input
                  type="number"
                  id="order"
                  name="order"
                  value={formData.order?.toString() || '0'}
                  onChange={handleInputChange}
                  placeholder="0"
                  className={validationErrors.order ? styles.inputError : ''}
                />
                {validationErrors.order && (
                  <span className={styles.errorText}>{validationErrors.order}</span>
                )}
                <small>Ordre d&apos;affichage (0 = premier)</small>
              </div>

              <div className={styles.formField}>
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Description de la catégorie"
                />
              </div>
            </div>

            <div className={styles.formColumn}>
              <div className={styles.formField}>
                <label>Image de la catégorie</label>
                <div 
                  className={`${styles.imageUploadContainer} ${isDragging ? styles.dragging : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {previewUrl ? (
                    <div className={styles.imagePreview}>
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        width={200}
                        height={200}
                        style={{ objectFit: 'cover' }}
                      />
                      <button 
                        type="button" 
                        className={styles.removeImageButton}
                        onClick={() => {
                          setPreviewUrl(null);
                          setImageFile(null);
                          setFormData(prev => ({ ...prev, image_url: '' }));
                        }}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  ) : (
                    <div className={styles.uploadPlaceholder}>
                      <FontAwesomeIcon icon={faUpload} size="2x" />
                      <p>Glissez-déposez une image ici ou</p>
                      <div className={styles.fileInputWrapper}>
                        <button type="button" className={styles.fileInputButton}>
                          Choisir une image
                        </button>
                        <input
                          type="file"
                          id="image"
                          name="image"
                          onChange={handleImageChange}
                          accept="image/*"
                          className={styles.fileInput}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <small>Formats acceptés: JPG, PNG, GIF. Taille maximale: 5MB</small>
              </div>
            </div>
          </div>

          <div className={styles.formActions}>
            <Link href="/admin?tab=categories" className={styles.btnCancel}>
              Annuler
            </Link>
            <button
              type="submit"
              className={styles.btnSave}
              disabled={isSubmitting}
            >
              <FontAwesomeIcon icon={faSave} /> {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 