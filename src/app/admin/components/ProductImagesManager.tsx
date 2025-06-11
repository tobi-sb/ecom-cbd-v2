'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faTrash, faStar, faPlus } from '@fortawesome/free-solid-svg-icons';
import { ProductImage } from '@/types/database.types';
import { getProductImages, createProductImage, deleteProductImage, setProductPrimaryImage, uploadProductImage } from '@/services/product.service';
import styles from '../admin.module.css';

interface ProductImagesManagerProps {
  productId: string;
}

export default function ProductImagesManager({ productId }: ProductImagesManagerProps) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);

  // Fetch product images when component mounts or productId changes
  useEffect(() => {
    const fetchImages = async () => {
      setIsLoading(true);
      try {
        const productImages = await getProductImages(productId);
        setImages(productImages);
      } catch (error) {
        console.error('Error fetching product images:', error);
        setError('Erreur lors du chargement des images');
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchImages();
    }
  }, [productId]);

  // Handle new image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImageFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload and add a new image
  const handleAddImage = async () => {
    if (!newImageFile) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      // Upload the image file
      const imageUrl = await uploadProductImage(newImageFile, newImageFile.name);
      
      // Create the product image record
      const isPrimary = images.length === 0; // If it's the first image, make it primary
      const newImage = await createProductImage({
        product_id: productId,
        image_url: imageUrl,
        is_primary: isPrimary
      });
      
      // Update the local state
      setImages(prev => [...prev, newImage]);
      
      // Reset the form
      setNewImageFile(null);
      setNewImagePreview(null);
      
    } catch (error) {
      console.error('Error adding product image:', error);
      setError('Erreur lors de l\'ajout de l\'image');
    } finally {
      setIsUploading(false);
    }
  };

  // Delete an image
  const handleDeleteImage = async (imageId: string) => {
    try {
      await deleteProductImage(imageId);
      setImages(prev => prev.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Error deleting product image:', error);
      setError('Erreur lors de la suppression de l\'image');
    }
  };

  // Set an image as primary
  const handleSetPrimary = async (imageId: string) => {
    try {
      await setProductPrimaryImage(imageId);
      
      // Update local state to reflect the change
      setImages(prev => prev.map(img => ({
        ...img,
        is_primary: img.id === imageId
      })));
    } catch (error) {
      console.error('Error setting primary image:', error);
      setError('Erreur lors de la définition de l\'image principale');
    }
  };

  if (isLoading) {
    return <div className={styles.loadingContainer}>Chargement des images...</div>;
  }

  return (
    <div className={styles.productImagesManager}>
      <h3>Images du produit</h3>
      
      {error && <div className={styles.errorMessage}>{error}</div>}
      
      <div className={styles.imagesGrid}>
        {images.map(image => (
          <div key={image.id} className={`${styles.imageItem} ${image.is_primary ? styles.primaryImage : ''}`}>
            <div className={styles.imageContainer}>
              <Image 
                src={image.image_url} 
                alt="Image produit" 
                width={120} 
                height={120} 
                className={styles.productImage}
              />
              {image.is_primary && (
                <span className={styles.primaryBadge}>
                  <FontAwesomeIcon icon={faStar} /> Principal
                </span>
              )}
            </div>
            <div className={styles.imageActions}>
              {!image.is_primary && (
                <button 
                  type="button" 
                  onClick={() => handleSetPrimary(image.id)}
                  className={styles.btnSetPrimary}
                >
                  <FontAwesomeIcon icon={faStar} /> Définir comme principale
                </button>
              )}
              <button 
                type="button" 
                onClick={() => handleDeleteImage(image.id)}
                className={styles.btnDelete}
              >
                <FontAwesomeIcon icon={faTrash} /> Supprimer
              </button>
            </div>
          </div>
        ))}
        
        {/* Add new image section */}
        <div className={styles.addImageContainer}>
          <div className={styles.uploadContainer}>
            <input
              type="file"
              id="add-product-image"
              accept="image/*"
              onChange={handleImageChange}
              className={styles.fileInput}
            />
            <label htmlFor="add-product-image" className={styles.uploadLabel}>
              <FontAwesomeIcon icon={faUpload} /> Choisir une image
            </label>
            
            {newImagePreview && (
              <div className={styles.newImagePreview}>
                <Image 
                  src={newImagePreview} 
                  alt="Aperçu" 
                  width={120} 
                  height={120}
                />
              </div>
            )}
          </div>
          
          {newImageFile && (
            <button
              type="button"
              onClick={handleAddImage}
              disabled={isUploading}
              className={styles.btnAddImage}
            >
              <FontAwesomeIcon icon={faPlus} /> {isUploading ? 'Ajout en cours...' : 'Ajouter l\'image'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 