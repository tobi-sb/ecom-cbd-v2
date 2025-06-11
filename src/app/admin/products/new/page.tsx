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
import { Category, ColorVariant, PriceOption } from '@/types/database.types';
import { uploadProductImage, createColorVariant, createProductImage, createPriceOption } from '@/services/product.service';
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
  
  // Pour les options de prix dynamiques
  const [priceOptions, setPriceOptions] = useState<Array<{
    id: string;
    weight: string;
    price: number;
    is_default: boolean;
  }>>([]);
  const [newPriceOption, setNewPriceOption] = useState({
    weight: '',
    price: 0,
    is_default: false
  });
  const [useDynamicPricing, setUseDynamicPricing] = useState(false);
  
  // État pour gérer les variantes de couleur temporaires
  interface TempVariant {
    id: string;
    color_name: string;
    price_adjustment: number | null;
    is_default: boolean;
    image_file: File | null;
    temp_image_preview: string;
  }

  const [tempVariants, setTempVariants] = useState<TempVariant[]>([]);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [tempVariant, setTempVariant] = useState<{
    color_name: string;
    price_adjustment: number | null;
    is_default: boolean;
    image_file: File | null;
    temp_image_preview: string;
  }>({
    color_name: '',
    price_adjustment: 0,
    is_default: false,
    image_file: null,
    temp_image_preview: ''
  });
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price_3g: 0,
    price_5g: 0,
    price_10g: 0,
    price_30g: 0,
    price_50g: 0,
    base_price: 0,
    discounted_price: null,
    cbd_percentage: null,
    culture_type: 'none',
    origin: '',
    category_id: '',
    tag: '',
    image_url: '',
    is_featured: false,
    review_count: 0,
    rating: 0
  });

  const [useWeightPricing, setUseWeightPricing] = useState(false);

  // Pour gérer plusieurs images
  const [additionalImages, setAdditionalImages] = useState<Array<{
    id: string;
    file: File;
    preview: string;
    isPrimary: boolean;
  }>>([]);

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
    let parsedValue: string | number | boolean | null = value;
    
    // Handle numeric fields
    if (
      name === 'price_3g' || 
      name === 'price_5g' || 
      name === 'price_10g' || 
      name === 'price_30g' || 
      name === 'price_50g' || 
      name === 'cbd_percentage' ||
      name === 'review_count' ||
      name === 'rating'
    ) {
      parsedValue = value === '' ? null : parseFloat(value);
    }
    
    setFormData({
      ...formData,
      [name]: parsedValue
    });
  };

  // Gestion du changement de type de prix
  const handleWeightPricingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setUseWeightPricing(isChecked);
    
    // Si on active le prix par poids, on désactive les autres options
    if (isChecked) {
      setUseDynamicPricing(false);
    }
  };
  
  // Gestion du changement de prix dynamique
  const handleDynamicPricingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setUseDynamicPricing(isChecked);
    
    // Si on active le prix dynamique, on désactive les autres options
    if (isChecked) {
      setUseWeightPricing(false);
    }
  };
  
  // Gestion du changement dans le formulaire d'option de prix
  const handlePriceOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      setNewPriceOption({
        ...newPriceOption,
        price: value === '' ? 0 : parseFloat(value)
      });
    } else {
      setNewPriceOption({
        ...newPriceOption,
        [name]: value
      });
    }
  };
  
  // Ajouter une nouvelle option de prix
  const addPriceOption = () => {
    if (newPriceOption.weight.trim() === '' || newPriceOption.price <= 0) {
      setFormError('Veuillez spécifier un poids et un prix valides');
      return;
    }
    
    const newOption = {
      id: Date.now().toString(),
      weight: newPriceOption.weight,
      price: newPriceOption.price,
      is_default: priceOptions.length === 0 ? true : newPriceOption.is_default
    };
    
    // Si c'est la première option ou si elle est définie comme par défaut
    if (newOption.is_default) {
      // Réinitialiser les autres options
      setPriceOptions(prev => prev.map(option => ({
        ...option,
        is_default: false
      })));
    }
    
    setPriceOptions(prev => [...prev, newOption]);
    
    // Réinitialiser le formulaire
    setNewPriceOption({
      weight: '',
      price: 0,
      is_default: false
    });
  };
  
  // Supprimer une option de prix
  const removePriceOption = (id: string) => {
    const optionToRemove = priceOptions.find(option => option.id === id);
    
    setPriceOptions(prev => prev.filter(option => option.id !== id));
    
    // Si l'option supprimée était celle par défaut et qu'il reste d'autres options
    if (optionToRemove?.is_default && priceOptions.length > 1) {
      // Définir la première option restante comme celle par défaut
      const remainingOptions = priceOptions.filter(option => option.id !== id);
      if (remainingOptions.length > 0) {
        setPriceOptions(prev => 
          prev.map((option, index) => index === 0 ? { ...option, is_default: true } : option)
        );
      }
    }
  };
  
  // Définir une option comme celle par défaut
  const setDefaultPriceOption = (id: string) => {
    setPriceOptions(prev => 
      prev.map(option => ({
        ...option,
        is_default: option.id === id
      }))
    );
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
      
      // Set as primary in additional images
      setAdditionalImages(prev => prev.map(img => ({
        ...img,
        isPrimary: false
      })));
    }
  };

  // Handle additional image upload
  const handleAdditionalImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        
        // Add to additional images
        setAdditionalImages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            file,
            preview,
            isPrimary: !imageFile && prev.length === 0 // Make primary if no main image
          }
        ]);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Remove additional image
  const handleRemoveAdditionalImage = (id: string) => {
    const imageToRemove = additionalImages.find(img => img.id === id);
    setAdditionalImages(prev => prev.filter(img => img.id !== id));
    
    // If removing a primary image, set main image as primary if available
    if (imageToRemove?.isPrimary && !imageFile && additionalImages.length > 1) {
      const remainingImages = additionalImages.filter(img => img.id !== id);
      if (remainingImages.length > 0) {
        setAdditionalImages(prev => 
          prev.map((img, index) => index === 0 ? { ...img, isPrimary: true } : img)
        );
      }
    }
  };
  
  // Set an additional image as primary
  const handleSetPrimaryImage = (id: string) => {
    // Clear main image if exists
    if (imageFile) {
      setImageFile(null);
      setImagePreview(null);
    }
    
    // Update additional images
    setAdditionalImages(prev => 
      prev.map(img => ({
        ...img,
        isPrimary: img.id === id
      }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);
    
    try {
      // Check if we have at least one image (main or additional)
      if (!imageFile && additionalImages.length === 0) {
        setFormError('Veuillez ajouter au moins une image pour le produit.');
        setIsLoading(false);
        return;
      }

      // Vérifier que les champs d'avis sont remplis
      if (formData.review_count === null || formData.review_count === undefined) {
        setFormError('Le nombre d\'avis est obligatoire.');
        setIsLoading(false);
        return;
      }

      if (formData.rating === null || formData.rating === undefined) {
        setFormError('L\'évaluation (étoiles) est obligatoire.');
        setIsLoading(false);
        return;
      }
      
      let mainImageUrl = '';
      
      // Upload main image if exists
      if (imageFile) {
        try {
          mainImageUrl = await uploadProductImage(imageFile, imageFile.name);
        } catch (error) {
          console.error('Error uploading image:', error);
          setFormError('Erreur lors du téléchargement de l\'image. Veuillez réessayer.');
          setIsLoading(false);
          return;
        }
      } else if (additionalImages.length > 0) {
        // Use the primary additional image as main image
        const primaryImage = additionalImages.find(img => img.isPrimary);
        if (primaryImage) {
          try {
            mainImageUrl = await uploadProductImage(primaryImage.file, primaryImage.file.name);
          } catch (error) {
            console.error('Error uploading image:', error);
            setFormError('Erreur lors du téléchargement de l\'image. Veuillez réessayer.');
            setIsLoading(false);
            return;
          }
        }
      }
      
      const productData = {
        ...formData,
        image_url: mainImageUrl
      };
      
      const newProduct = await createProduct(productData);
      setNewProductId(newProduct.id);
      
      // After product creation, create all temporary variants
      if (tempVariants.length > 0) {
        try {
          for (const variant of tempVariants) {
            if (variant.image_file) {
              const imageUrl = await uploadProductImage(variant.image_file, variant.image_file.name);
              await createColorVariant({
                product_id: newProduct.id,
                color_name: variant.color_name,
                price_adjustment: variant.price_adjustment ?? 0,
                is_default: variant.is_default,
                image_url: imageUrl
              });
            }
          }
        } catch (variantError) {
          console.error("Error creating variants:", variantError);
          // Continue with additional images even if variant creation fails
        }
      }
      
      // After product creation, create all price options if using dynamic pricing
      if (useDynamicPricing && priceOptions.length > 0) {
        try {
          for (const option of priceOptions) {
            await createPriceOption({
              product_id: newProduct.id,
              weight: option.weight,
              price: option.price,
              is_default: option.is_default
            });
          }
        } catch (priceOptionError) {
          console.error("Error creating price options:", priceOptionError);
          // Continue with additional images even if price option creation fails
        }
      }
      
      // After product creation, upload additional images
      if (additionalImages.length > 0) {
        try {
          for (const additionalImage of additionalImages) {
            const imageUrl = await uploadProductImage(additionalImage.file, additionalImage.file.name);
            await createProductImage({
              product_id: newProduct.id,
              image_url: imageUrl,
              is_primary: additionalImage.isPrimary
            });
          }
        } catch (imageError) {
          console.error("Error creating additional images:", imageError);
        }
      }
      
      // Redirect back to admin dashboard after successful creation
      router.push('/admin?tab=products');
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
        [name]: value === '' ? null : parseFloat(value)
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
      })) as TempVariant[]);
    }

    // Add new variant
    const newVariant: TempVariant = {
        ...tempVariant,
        id: Date.now().toString(), // Temporary ID for tracking
    };
    
    setTempVariants(prev => [...prev, newVariant]);

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
    })) as TempVariant[]);
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
                  onChange={handleWeightPricingChange}
                  className={formStyles.checkboxInput}
                />
                <span className={formStyles.checkboxWrapper}>Prix par gramme</span>
              </label>
            </div>
            
            <div className={formStyles.formGroup}>
              <label className={formStyles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={useDynamicPricing}
                  onChange={handleDynamicPricingChange}
                  className={formStyles.checkboxInput}
                />
                <span className={formStyles.checkboxWrapper}>Prix personnalisés</span>
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
            
            {!useWeightPricing && !useDynamicPricing ? (
              <>
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
                
                <div className={formStyles.formGroup}>
                  <label htmlFor="discounted_price">Prix après réduction (€)</label>
                  <input
                    type="number"
                    id="discounted_price"
                    name="discounted_price"
                    value={formData.discounted_price !== undefined && formData.discounted_price !== null ? formData.discounted_price : ''}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                  <span className={formStyles.helpText}>Laissez vide s'il n'y a pas de réduction</span>
                </div>
              </>
            ) : useWeightPricing ? (
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
                </div>
                
                <div className={formStyles.formRow}>
                  <div className={formStyles.formGroup}>
                    <label htmlFor="price_30g">Prix 30g (€)</label>
                    <input
                      type="number"
                      id="price_30g"
                      name="price_30g"
                      value={formData.price_30g || ''}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className={formStyles.formRow}>
                  <div className={formStyles.formGroup}>
                    <label htmlFor="price_50g">Prix 50g (€)</label>
                    <input
                      type="number"
                      id="price_50g"
                      name="price_50g"
                      value={formData.price_50g || ''}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className={styles.priceOptionsContainer}>
                  <h3>Options de prix personnalisées</h3>
                  
                  {/* Formulaire d'ajout d'option */}
                  <div className={styles.priceOptionForm}>
                    <div className={styles.priceOptionInputs}>
                      <div className={formStyles.formGroup}>
                        <label htmlFor="weight">Poids/Quantité</label>
                        <input
                          type="text"
                          id="weight"
                          name="weight"
                          value={newPriceOption.weight}
                          onChange={handlePriceOptionChange}
                          placeholder="ex: 5g, 10ml, etc."
                          className={formStyles.formControl}
                        />
                      </div>
                      
                      <div className={formStyles.formGroup}>
                        <label htmlFor="price">Prix (€)</label>
                        <input
                          type="number"
                          id="price"
                          name="price"
                          value={newPriceOption.price || ''}
                          onChange={handlePriceOptionChange}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className={formStyles.formControl}
                        />
                      </div>
                      
                      <div className={formStyles.formGroup}>
                        <label className={formStyles.checkboxLabel}>
                          <input
                            type="checkbox"
                            name="is_default"
                            checked={newPriceOption.is_default}
                            onChange={(e) => setNewPriceOption({...newPriceOption, is_default: e.target.checked})}
                            className={formStyles.checkboxInput}
                          />
                          <span className={formStyles.checkboxWrapper}>Option par défaut</span>
                        </label>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={addPriceOption}
                      className={styles.addPriceOptionBtn}
                    >
                      <FontAwesomeIcon icon={faPlus} /> Ajouter
                    </button>
                  </div>
                  
                  {/* Liste des options de prix */}
                  {priceOptions.length > 0 ? (
                    <div className={styles.priceOptionsList}>
                      <h4>Options ajoutées:</h4>
                      <ul>
                        {priceOptions.map((option) => (
                          <li key={option.id} className={styles.priceOptionItem}>
                            <div className={styles.priceOptionInfo}>
                              <span className={styles.priceOptionWeight}>{option.weight}</span>
                              <span className={styles.priceOptionPrice}>{option.price.toFixed(2)}€</span>
                              {option.is_default && (
                                <span className={styles.defaultBadge}>Par défaut</span>
                              )}
                            </div>
                            <div className={styles.priceOptionActions}>
                              {!option.is_default && (
                                <button
                                  type="button"
                                  onClick={() => setDefaultPriceOption(option.id)}
                                  className={styles.setDefaultBtn}
                                  title="Définir comme option par défaut"
                                >
                                  <FontAwesomeIcon icon={faStar} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removePriceOption(option.id)}
                                className={styles.removeOptionBtn}
                                title="Supprimer cette option"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className={styles.noPriceOptions}>Aucune option de prix ajoutée</p>
                  )}
                </div>
              </>
            )}
            
            <div className={formStyles.formGroup}>
              <label htmlFor="review_count">Nombre d'avis *</label>
              <input
                type="number"
                id="review_count"
                name="review_count"
                value={formData.review_count !== undefined && formData.review_count !== null ? formData.review_count : ''}
                onChange={handleChange}
                min="0"
                step="1"
                placeholder="0"
                required
              />
            </div>
            
            <div className={formStyles.formGroup}>
              <label htmlFor="rating">Évaluation (étoiles) *</label>
              <input
                type="number"
                id="rating"
                name="rating"
                value={formData.rating !== undefined && formData.rating !== null ? formData.rating : ''}
                onChange={handleChange}
                min="0"
                max="5"
                step="0.01"
                placeholder="0.00"
                required
              />
              <span className={formStyles.helpText}>Entre 0 et 5 étoiles (ex: 4.5)</span>
            </div>
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
                <label htmlFor="cbd_percentage">Taux de CBD (%)</label>
                <input
                  type="number"
                  id="cbd_percentage"
                  name="cbd_percentage"
                  value={formData.cbd_percentage !== undefined && formData.cbd_percentage !== null ? formData.cbd_percentage : ''}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="ex: 15.5"
                />
              </div>
              
              <div className={formStyles.formGroup}>
                <label htmlFor="culture_type">Type de culture</label>
                <select
                  id="culture_type"
                  name="culture_type"
                  value={formData.culture_type}
                  onChange={handleChange}
                >
                  <option value="none">Aucun</option>
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                </select>
              </div>
            </div>
            
            <div className={formStyles.formGroup}>
              <label htmlFor="origin">Origine</label>
              <input
                type="text"
                id="origin"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
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
                  <FontAwesomeIcon icon={faUpload} /> Choisir l'image principale
                </label>
                {imagePreview && (
                  <div className={formStyles.imagePreview}>
                    <img src={imagePreview} alt="Aperçu" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Additional Images Section */}
            <div className={formStyles.formGroup}>
              <label>Images supplémentaires</label>
              <div className={styles.additionalImagesContainer}>
                {additionalImages.length > 0 && (
                  <div className={styles.imagesGrid}>
                    {additionalImages.map(img => (
                      <div key={img.id} className={`${styles.imageItem} ${img.isPrimary ? styles.primaryImage : ''}`}>
                        <div className={styles.imageContainer}>
                          <img 
                            src={img.preview} 
                            alt="Image produit" 
                            className={styles.productImage}
                          />
                          {img.isPrimary && (
                            <span className={styles.primaryBadge}>
                              <FontAwesomeIcon icon={faStar} /> Principal
                            </span>
                          )}
                        </div>
                        <div className={styles.imageActions}>
                          {!img.isPrimary && (
                            <button 
                              type="button" 
                              onClick={() => handleSetPrimaryImage(img.id)}
                              className={styles.btnSetPrimary}
                            >
                              <FontAwesomeIcon icon={faStar} /> Définir comme principale
                            </button>
                          )}
                          <button 
                            type="button" 
                            onClick={() => handleRemoveAdditionalImage(img.id)}
                            className={styles.btnDelete}
                          >
                            <FontAwesomeIcon icon={faTrash} /> Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className={styles.addImageContainer}>
                  <input
                    type="file"
                    id="additional-image"
                    accept="image/*"
                    onChange={handleAdditionalImageChange}
                    className={styles.fileInput}
                  />
                  <label htmlFor="additional-image" className={styles.uploadLabel}>
                    <FontAwesomeIcon icon={faUpload} /> Ajouter une image supplémentaire
                  </label>
                </div>
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
                      <p>Ajustement de prix: {variant.price_adjustment !== null ? (variant.price_adjustment > 0 ? '+' : '') + variant.price_adjustment : '0'} €</p>
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
                    value={tempVariant.price_adjustment !== undefined && tempVariant.price_adjustment !== null ? tempVariant.price_adjustment : ''}
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