'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../../../admin.module.css';
import formStyles from '../../new/form.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave, faUpload } from '@fortawesome/free-solid-svg-icons';
import { getProductById, updateProduct, getAllCategories, uploadProductImage, getProductColorVariants } from '@/services/product.service';
import { Product, Category, ColorVariant } from '@/types/database.types';
import ColorVariantsManager from '../../../components/ColorVariantsManager';

export default function EditProduct({ params }: { params: { id: string } }) {
  const router = useRouter();
  const productId = params.id;
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([]);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price_3g: 0,
    price_5g: 0,
    price_10g: 0,
    price_20g: 0,
    base_price: 0,
    cbd_percentage: 0,
    culture_type: 'indoor',
    origin: '',
    category_id: '',
    tag: '',
    image_url: '',
    is_featured: false
  });

  const [useWeightPricing, setUseWeightPricing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch product data, categories, and color variants concurrently
        const [product, categoriesData, variants] = await Promise.all([
          getProductById(productId),
          getAllCategories(),
          getProductColorVariants(productId)
        ]);
        
        if (!product) {
          setFormError("Produit non trouvé");
          return;
        }
        
        // Check if this product uses weight pricing
        const hasWeightPricing = product.price_3g > 0 || product.price_5g > 0 || 
                                 product.price_10g > 0 || product.price_20g > 0;
        setUseWeightPricing(hasWeightPricing);
        
        setFormData({
          name: product.name,
          description: product.description,
          price_3g: product.price_3g,
          price_5g: product.price_5g,
          price_10g: product.price_10g,
          price_20g: product.price_20g,
          base_price: product.base_price || 0,
          cbd_percentage: product.cbd_percentage,
          culture_type: product.culture_type,
          origin: product.origin,
          category_id: product.category_id,
          tag: product.tag || '',
          image_url: product.image_url,
          is_featured: product.is_featured
        });
        
        if (product.image_url) {
          setImagePreview(product.image_url);
        }
        
        setCategories(categoriesData);
        setColorVariants(variants);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setFormError("Une erreur est survenue lors du chargement des données");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [productId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;
    
    // Handle numeric fields
    if (
      name === 'price_3g' || 
      name === 'price_5g' || 
      name === 'price_10g' || 
      name === 'price_20g' || 
      name === 'cbd_percentage'
    ) {
      parsedValue = value === '' ? 0 : parseFloat(value);
    }
    
    setFormData({
      ...formData,
      [name]: parsedValue
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError(null);
    
    try {
      // Handle image upload if a new image was selected
      let imageUrl = formData.image_url;
      
      if (imageFile) {
        try {
          imageUrl = await uploadProductImage(imageFile, imageFile.name);
        } catch (error) {
          console.error('Error uploading image:', error);
          setFormError('Erreur lors du téléchargement de l\'image. Veuillez réessayer.');
          setIsSaving(false);
          return;
        }
      }
      
      const productData = {
        ...formData,
        image_url: imageUrl
      };
      
      await updateProduct(productId, productData);
      
      // Redirect back to admin dashboard after successful update
      router.push('/admin?tab=products');
    } catch (error) {
      console.error("Error updating product:", error);
      setFormError("Une erreur est survenue lors de la mise à jour du produit.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className={formStyles.formContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Chargement du produit...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={formStyles.formContainer}>
      <div className={formStyles.formHeader}>
        <Link href="/admin" className={formStyles.backLink}>
          <FontAwesomeIcon icon={faArrowLeft} /> Retour au tableau de bord
        </Link>
        <h1>Modifier le produit</h1>
      </div>
      
      {formError && (
        <div className={formStyles.errorMessage}>
          {formError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className={formStyles.form}>
        <div className={formStyles.formGrid}>
          <div className={formStyles.formColumn}>
            <div className={formStyles.formGroup}>
              <label htmlFor="name">Nom du produit *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="ex: OG Kush CBD"
              />
            </div>
            
            <div className={formStyles.formGroup}>
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Description détaillée du produit..."
              ></textarea>
            </div>
            
            <div className={formStyles.formGroup}>
              <label className={formStyles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={useWeightPricing}
                  onChange={(e) => setUseWeightPricing(e.target.checked)}
                  className={formStyles.checkboxInput}
                />
                <span className={formStyles.checkboxWrapper}>Prix par gramme</span>
              </label>
            </div>
            
            <div className={formStyles.formGroup}>
              <label className={formStyles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={!!formData.is_featured}
                  onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                  className={formStyles.checkboxInput}
                />
                <span className={formStyles.checkboxWrapper}>Afficher dans le slider "Nos Produits Phares"</span>
              </label>
            </div>
            
            {!useWeightPricing ? (
              <div className={formStyles.formGroup}>
                <label htmlFor="base_price">Prix (€) *</label>
                <input
                  type="number"
                  id="base_price"
                  name="base_price"
                  value={formData.base_price || ''}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            ) : (
              <>
                <div className={formStyles.formRow}>
                  <div className={formStyles.formGroup}>
                    <label htmlFor="price_3g">Prix 3g (€)</label>
                    <input
                      type="number"
                      id="price_3g"
                      name="price_3g"
                      value={formData.price_3g || ''}
                      onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              
              <div className={formStyles.formGroup}>
                <label htmlFor="price_5g">Prix 5g (€)</label>
                <input
                  type="number"
                  id="price_5g"
                  name="price_5g"
                  value={formData.price_5g || ''}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className={formStyles.formRow}>
              <div className={formStyles.formGroup}>
                <label htmlFor="price_10g">Prix 10g (€)</label>
                <input
                  type="number"
                  id="price_10g"
                  name="price_10g"
                  value={formData.price_10g || ''}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              
              <div className={formStyles.formGroup}>
                <label htmlFor="price_20g">Prix 20g (€)</label>
                <input
                  type="number"
                  id="price_20g"
                  name="price_20g"
                  value={formData.price_20g || ''}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>
              </>
            )}
          </div>
          
          <div className={formStyles.formColumn}>
            <div className={formStyles.formGroup}>
              <label htmlFor="category_id">Catégorie *</label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id || ''}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className={formStyles.formRow}>
              <div className={formStyles.formGroup}>
                <label htmlFor="cbd_percentage">Taux de CBD (%) *</label>
                <input
                  type="number"
                  id="cbd_percentage"
                  name="cbd_percentage"
                  value={formData.cbd_percentage || ''}
                  onChange={handleChange}
                  required
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="ex: 15.5"
                />
              </div>
              
              <div className={formStyles.formGroup}>
                <label htmlFor="culture_type">Type de culture *</label>
                <select
                  id="culture_type"
                  name="culture_type"
                  value={formData.culture_type || 'indoor'}
                  onChange={handleChange}
                  required
                >
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                </select>
              </div>
            </div>
            
            <div className={formStyles.formGroup}>
              <label htmlFor="origin">Origine *</label>
              <input
                type="text"
                id="origin"
                name="origin"
                value={formData.origin || ''}
                onChange={handleChange}
                required
                placeholder="ex: Suisse"
              />
            </div>
            
            <div className={formStyles.formGroup}>
              <label htmlFor="tag">Tag (optionnel)</label>
              <select
                id="tag"
                name="tag"
                value={formData.tag || ''}
                onChange={handleChange}
              >
                <option value="">Aucun</option>
                <option value="Nouveau">Nouveau</option>
                <option value="Bestseller">Bestseller</option>
                <option value="Populaire">Populaire</option>
                <option value="Premium">Premium</option>
                <option value="Exclusif">Exclusif</option>
                <option value="Promo">Promo</option>
              </select>
            </div>
            
            <div className={formStyles.formGroup}>
              <label htmlFor="image">Image du produit</label>
              <div className={formStyles.fileUpload}>
                {imagePreview && (
                  <div className={formStyles.currentImage}>
                    <p>Image actuelle:</p>
                    <div className={formStyles.imagePreview}>
                      <Image 
                        src={imagePreview} 
                        alt="Image actuelle"
                        width={120}
                        height={120}
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={formStyles.fileInput}
                />
                <label htmlFor="image" className={formStyles.fileButton}>
                  <FontAwesomeIcon icon={faUpload} /> {imagePreview ? 'Changer l\'image' : 'Ajouter une image'}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Add Color Variants Manager */}
        <ColorVariantsManager
          productId={productId}
          initialVariants={colorVariants}
          onVariantsChange={setColorVariants}
        />
        
        <div className={formStyles.formActions}>
          <Link href="/admin" className={formStyles.btnCancel}>
            Annuler
          </Link>
          <button 
            type="submit" 
            className={formStyles.btnSubmit}
            disabled={isSaving}
          >
            <FontAwesomeIcon icon={faSave} /> {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
} 