'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faStar, faUpload } from '@fortawesome/free-solid-svg-icons';
import { ColorVariant } from '@/types/database.types';
import { createColorVariant, updateColorVariant, deleteColorVariant, uploadColorVariantImage } from '@/services/product.service';
import styles from '../admin.module.css';

interface ColorVariantsManagerProps {
  productId: string;
  initialVariants: ColorVariant[];
  onVariantsChange: (variants: ColorVariant[]) => void;
}

export default function ColorVariantsManager({ productId, initialVariants, onVariantsChange }: ColorVariantsManagerProps) {
  const [variants, setVariants] = useState<ColorVariant[]>(initialVariants);
  const [newVariant, setNewVariant] = useState({
    color_name: '',
    price_adjustment: 0,
    is_default: false
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setVariants(initialVariants);
  }, [initialVariants]);

  // Add mobile detection
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 576);
    };
    
    // Check initially
    checkIsMobile();
    
    // Listen for resize events
    window.addEventListener('resize', checkIsMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAddVariant = async () => {
    if (!newVariant.color_name || !selectedFile) {
      setError('Veuillez remplir tous les champs requis');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Upload the image first
      const imageUrl = await uploadColorVariantImage(selectedFile, selectedFile.name);

      // Create the variant
      const variant = await createColorVariant({
        product_id: productId,
        color_name: newVariant.color_name,
        image_url: imageUrl,
        price_adjustment: newVariant.price_adjustment,
        is_default: newVariant.is_default
      });

      // If this is set as default, update other variants
      if (newVariant.is_default) {
        const updatedVariants = variants.map(v => ({
          ...v,
          is_default: false
        }));
        await Promise.all(
          updatedVariants.map(v => updateColorVariant(v.id, { is_default: false }))
        );
      }

      // Update the variants list
      const updatedVariants = [...variants, variant];
      setVariants(updatedVariants);
      onVariantsChange(updatedVariants);

      // Reset the form
      setNewVariant({
        color_name: '',
        price_adjustment: 0,
        is_default: false
      });
      setSelectedFile(null);
      setShowForm(false); // Hide the form after successful submission
    } catch (error) {
      console.error('Error adding variant:', error);
      setError('Une erreur est survenue lors de l\'ajout de la variante');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette variante ?')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await deleteColorVariant(variantId);
      const updatedVariants = variants.filter(v => v.id !== variantId);
      setVariants(updatedVariants);
      onVariantsChange(updatedVariants);
    } catch (error) {
      console.error('Error deleting variant:', error);
      setError('Une erreur est survenue lors de la suppression de la variante');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (variantId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Update all variants to not be default
      await Promise.all(
        variants.map(v => updateColorVariant(v.id, { is_default: false }))
      );

      // Set the selected variant as default
      await updateColorVariant(variantId, { is_default: true });

      // Update the variants list
      const updatedVariants = variants.map(v => ({
        ...v,
        is_default: v.id === variantId
      }));
      setVariants(updatedVariants);
      onVariantsChange(updatedVariants);
    } catch (error) {
      console.error('Error setting default variant:', error);
      setError('Une erreur est survenue lors de la mise à jour de la variante par défaut');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.colorVariantsManager}>
      <div className={styles.colorVariantsHeader}>
      <h3>Variantes de couleur</h3>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className={styles.btnAddVariant}
          >
            <FontAwesomeIcon icon={faPlus} /> {isMobile ? 'Ajouter' : 'Ajouter une variante'}
          </button>
        )}
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {showForm && (
      <div className={styles.variantForm}>
        <div className={styles.formGroup}>
          <label htmlFor="color_name">Nom de la couleur *</label>
          <input
            type="text"
            id="color_name"
            value={newVariant.color_name}
            onChange={(e) => setNewVariant({ ...newVariant, color_name: e.target.value })}
            placeholder="ex: Rouge"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="price_adjustment">Ajustement de prix (€)</label>
          <input
            type="number"
            id="price_adjustment"
            value={newVariant.price_adjustment}
            onChange={(e) => setNewVariant({ ...newVariant, price_adjustment: parseFloat(e.target.value) || 0 })}
            step="0.01"
            placeholder="0.00"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="variant_image">Image *</label>
          <div className={styles.fileUpload}>
            <input
              type="file"
              id="variant_image"
              accept="image/*"
              onChange={handleFileChange}
              className={styles.fileInput}
            />
            <label htmlFor="variant_image" className={styles.fileButton}>
              <FontAwesomeIcon icon={faUpload} /> {selectedFile ? 'Changer l\'image' : 'Ajouter une image'}
            </label>
            {selectedFile && (
              <span className={styles.fileName}>{selectedFile.name}</span>
            )}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={newVariant.is_default}
              onChange={(e) => setNewVariant({ ...newVariant, is_default: e.target.checked })}
                className={styles.checkboxInput}
            />
              <span className={styles.checkboxWrapper}>Variante par défaut</span>
          </label>
        </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className={styles.btnCancel}
            >
              Annuler
            </button>
        <button
          type="button"
          onClick={handleAddVariant}
          disabled={isLoading}
          className={styles.btnSubmit}
        >
              <FontAwesomeIcon icon={faPlus} /> {isMobile ? 'Ajouter' : 'Ajouter la variante'}
        </button>
      </div>
        </div>
      )}

      <div className={styles.variantsList}>
        {variants.map((variant) => (
          <div key={variant.id} className={styles.variantItem}>
            <img
              src={variant.image_url}
              alt={variant.color_name}
              className={styles.variantImage}
            />
            <div className={styles.variantInfo}>
              <h4>{variant.color_name}</h4>
              <p>Ajustement de prix: {variant.price_adjustment > 0 ? '+' : ''}{variant.price_adjustment}€</p>
              {variant.is_default && (
                <span className={styles.defaultBadge}>
                  <FontAwesomeIcon icon={faStar} /> Par défaut
                </span>
              )}
            </div>
            <div className={styles.variantActions}>
              {!variant.is_default && (
                <button
                  type="button"
                  onClick={() => handleSetDefault(variant.id)}
                  disabled={isLoading}
                  className={styles.btnDefault}
                >
                  <FontAwesomeIcon icon={faStar} /> {isMobile ? 'Défaut' : 'Définir par défaut'}
                </button>
              )}
              <button
                type="button"
                onClick={() => handleDeleteVariant(variant.id)}
                disabled={isLoading}
                className={styles.btnDelete}
              >
                <FontAwesomeIcon icon={faTrash} /> {isMobile ? 'Supprimer' : 'Supprimer'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 