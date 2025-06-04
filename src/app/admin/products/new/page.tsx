'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../../admin.module.css';
import formStyles from './form.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave, faUpload, faPlus, faTrash, faStar } from '@fortawesome/free-solid-svg-icons';
import { createProduct } from '@/services/product.service';
import { getAllCategories } from '@/services/product.service';
import { Category, ColorVariant } from '@/types/database.types';
import { uploadProductImage, createColorVariant } from '@/services/product.service';
import { Product } from '@/types/database.types';
import ColorVariantsManager from '../../components/ColorVariantsManager';

export default function NewProduct() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([]);
  const [newProductId, setNewProductId] = useState<string | null>(null);
  
  // For temporary variants before product creation
  const [tempVariants, setTempVariants] = useState<Array<{
    id: string;
    color_name: string;
    price_adjustment: number;
    is_default: boolean;
    image_file: File | null;
    temp_image_preview: string;
  }>>([]);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [tempVariant, setTempVariant] = useState({
    color_name: '',
    price_adjustment: 0,
    is_default: false,
    image_file: null as File | null,
    temp_image_preview: ''
  });
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price_3g: 0,
    price_5g: 0,
    price_10g: 0,
    price_20g: 0,
    base_price: 0,
    cbd_percentage: 0,
    culture_type: 'indoor' as const,
    origin: '',
    category_id: '',
    tag: '',
    image_url: '',
    is_featured: false
  });

  const [useWeightPricing, setUseWeightPricing] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getAllCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

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
    setIsLoading(true);
    setFormError(null);
    
    try {
      let imageUrl = '';
      
      if (imageFile) {
        try {
          imageUrl = await uploadProductImage(imageFile, imageFile.name);
        } catch (error) {
          console.error('Error uploading image:', error);
          setFormError('Erreur lors du téléchargement de l\'image. Veuillez réessayer.');
          setIsLoading(false);
          return;
        }
      }
      
      const productData = {
        ...formData,
        image_url: imageUrl
      };
      
      const newProduct = await createProduct(productData);
      
      // After product creation, create all temporary variants
      if (tempVariants.length > 0) {
        try {
          for (const variant of tempVariants) {
            if (variant.image_file) {
              const imageUrl = await uploadProductImage(variant.image_file, variant.image_file.name);
              await createColorVariant({
                product_id: newProduct.id,
                color_name: variant.color_name,
                price_adjustment: variant.price_adjustment,
                is_default: variant.is_default,
                image_url: imageUrl
              });
            }
          }
        } catch (variantError) {
          console.error("Error creating variants:", variantError);
          // Continue with redirect even if variant creation fails
        }
      }
      
      // Redirect to edit page where user can add variants
      router.push(`/admin/products/edit/${newProduct.id}`);
      
    } catch (error) {
      console.error("Error creating product:", error);
      setFormError("Une erreur est survenue lors de la création du produit.");
    } finally {
      setIsLoading(false);
    }
  };

  // Temporary variant handling
  const handleTempVariantChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setTempVariant(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'number') {
      setTempVariant(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setTempVariant(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleTempVariantImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempVariant(prev => ({
          ...prev,
          image_file: file,
          temp_image_preview: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addTempVariant = () => {
    if (!tempVariant.color_name || !tempVariant.image_file) {
      setFormError("Veuillez remplir tous les champs requis pour la variante.");
      return;
    }

    // If this is set as default, update other variants
    if (tempVariant.is_default) {
      setTempVariants(prev => prev.map(v => ({
        ...v,
        is_default: false
      })));
    }

    // Add new variant
    setTempVariants(prev => [
      ...prev,
      {
        ...tempVariant,
        id: Date.now().toString(), // Temporary ID for tracking
      }
    ]);

    // Reset the form
    setTempVariant({
      color_name: '',
      price_adjustment: 0,
      is_default: false,
      image_file: null,
      temp_image_preview: ''
    });
    setShowVariantForm(false);
  };

  const removeTempVariant = (id: string) => {
    setTempVariants(prev => prev.filter(v => v.id !== id));
  };

  const setDefaultTempVariant = (id: string) => {
    setTempVariants(prev => prev.map(v => ({
      ...v,
      is_default: v.id === id
    })));
  };

  return (
    <div className={formStyles.formContainer}>
      <div className={formStyles.formHeader}>
        <Link href="/admin" className={formStyles.backLink}>
          <FontAwesomeIcon icon={faArrowLeft} /> Retour au tableau de bord
        </Link>
        <h1>Ajouter un nouveau produit</h1>
      </div>
      
      {formError && (
        <div className={formError.includes("succès") ? styles.successMessage : formStyles.errorMessage}>
          {formError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className={formStyles.form} id="product-form">
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
                value={formData.category_id}
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
                  value={formData.culture_type}
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
                value={formData.origin}
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
                value={formData.tag}
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
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={formStyles.fileInput}
                />
                <label htmlFor="image" className={formStyles.fileButton}>
                  <FontAwesomeIcon icon={faUpload} /> Choisir une image
                </label>
                {imagePreview && (
                  <div className={formStyles.imagePreview}>
                    <img src={imagePreview} alt="Aperçu" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Add Color Variants Manager */}
        {newProductId ? (
          <ColorVariantsManager
            productId={newProductId}
            initialVariants={colorVariants}
            onVariantsChange={setColorVariants}
          />
        ) : (
          <div className={styles.colorVariantsManager}>
            <div className={styles.colorVariantsHeader}>
              <h3>Variantes de couleur</h3>
              <button
                type="button"
                className={styles.btnAddVariant}
                onClick={() => setShowVariantForm(true)}
              >
                <FontAwesomeIcon icon={faPlus} /> Ajouter une variante
              </button>
            </div>
            
            {/* Temporary variants list */}
            {tempVariants.length > 0 && (
              <div className={styles.variantsList}>
                {tempVariants.map(variant => (
                  <div key={variant.id} className={styles.variantItem}>
                    {variant.temp_image_preview && (
                      <img 
                        src={variant.temp_image_preview} 
                        alt={variant.color_name} 
                        className={styles.variantImage}
                      />
                    )}
                    <div className={styles.variantInfo}>
                      <h4>{variant.color_name}</h4>
                      <p>Ajustement de prix: {variant.price_adjustment > 0 ? '+' : ''}{variant.price_adjustment} €</p>
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
                          className={styles.btnDefault}
                          onClick={() => setDefaultTempVariant(variant.id)}
                        >
                          <FontAwesomeIcon icon={faStar} /> Définir par défaut
                        </button>
                      )}
                      <button 
                        type="button" 
                        className={styles.btnDelete}
                        onClick={() => removeTempVariant(variant.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} /> Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Temporary variant form */}
            {showVariantForm && (
              <div className={styles.variantForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="color_name">Nom de la couleur *</label>
                  <input
                    type="text"
                    id="color_name"
                    name="color_name"
                    value={tempVariant.color_name}
                    onChange={handleTempVariantChange}
                    placeholder="ex: Rouge"
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="price_adjustment">Ajustement de prix (€)</label>
                  <input
                    type="number"
                    id="price_adjustment"
                    name="price_adjustment"
                    value={tempVariant.price_adjustment}
                    onChange={handleTempVariantChange}
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
                      onChange={handleTempVariantImageChange}
                      className={styles.fileInput}
                    />
                    <label htmlFor="variant_image" className={styles.fileButton}>
                      <FontAwesomeIcon icon={faUpload} /> {tempVariant.image_file ? 'Changer l\'image' : 'Ajouter une image'}
                    </label>
                    {tempVariant.image_file && (
                      <span className={styles.fileName}>{tempVariant.image_file.name}</span>
                    )}
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="is_default"
                      checked={tempVariant.is_default}
                      onChange={handleTempVariantChange}
                      className={styles.checkboxInput}
                    />
                    <span className={styles.checkboxWrapper}>Variante par défaut</span>
                  </label>
                </div>
                
                <div className={styles.formActions}>
                  <button
                    type="button"
                    onClick={() => setShowVariantForm(false)}
                    className={styles.btnCancel}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={addTempVariant}
                    className={styles.btnSubmit}
                  >
                    <FontAwesomeIcon icon={faPlus} /> Ajouter la variante
                  </button>
                </div>
              </div>
            )}
            
            {!showVariantForm && tempVariants.length === 0 && (
              <p style={{ padding: '15px', color: '#666' }}>Vous pouvez ajouter des variantes de couleur avant de créer le produit.</p>
            )}
          </div>
        )}
        
        <div className={formStyles.formActions}>
          <Link href="/admin" className={formStyles.btnCancel}>
            Annuler
          </Link>
          {newProductId ? (
            <Link href="/admin?tab=products" className={formStyles.btnSubmit}>
              <FontAwesomeIcon icon={faSave} /> Terminer
            </Link>
          ) : (
            <button 
              type="submit" 
              className={formStyles.btnSubmit}
              disabled={isLoading}
            >
              <FontAwesomeIcon icon={faSave} /> {isLoading ? 'Enregistrement...' : 'Enregistrer le produit'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
} 