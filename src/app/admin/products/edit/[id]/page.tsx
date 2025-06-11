'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../../../admin.module.css';
import formStyles from '../../new/form.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave, faUpload, faTrash, faStar, faPlus } from '@fortawesome/free-solid-svg-icons';
import { getProductById, updateProduct, getAllCategories, uploadProductImage, getProductColorVariants, createProductImage, deleteProductImage, setProductPrimaryImage, getProductImages, getProductPriceOptions, createPriceOption, deletePriceOption, setDefaultPriceOption } from '@/services/product.service';
import { Product, Category, ColorVariant, ProductImage, PriceOption } from '@/types/database.types';
import ColorVariantsManager from '../../../components/ColorVariantsManager';

export default function EditProduct() {
  const router = useRouter();
  const params = useParams();
  const productId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([]);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // Pour les options de prix dynamiques
  const [priceOptions, setPriceOptions] = useState<PriceOption[]>([]);
  const [newPriceOption, setNewPriceOption] = useState({
    weight: '',
    price: 0,
    is_default: false
  });
  const [useDynamicPricing, setUseDynamicPricing] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price_3g: 0,
    price_5g: 0,
    price_10g: 0,
    price_30g: 0,
    price_50g: 0,
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
      try {
        const [product, categoriesData, colorVariantsData, productImagesData, priceOptionsData] = await Promise.all([
          getProductById(productId),
          getAllCategories(),
          getProductColorVariants(productId),
          getProductImages(productId),
          getProductPriceOptions(productId)
        ]);
        
        setFormData({
          ...product,
          category_id: product.category_id || ''
        });
        
        // Déterminer le type de prix utilisé
        const hasWeightPricing = product.price_3g > 0 || product.price_5g > 0 || 
                                product.price_10g > 0 || product.price_30g > 0 || product.price_50g > 0;
        const hasDynamicPricing = priceOptionsData.length > 0;
        
        setUseWeightPricing(hasWeightPricing && !hasDynamicPricing);
        setUseDynamicPricing(hasDynamicPricing && !hasWeightPricing);
        
        setCategories(categoriesData);
        setColorVariants(colorVariantsData);
        setProductImages(productImagesData);
        setPriceOptions(priceOptionsData);
        
        if (product.image_url) {
          setImagePreview(product.image_url);
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
        setFormError('Erreur lors du chargement des données du produit.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [productId]);

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
  const addPriceOption = async () => {
    if (newPriceOption.weight.trim() === '' || newPriceOption.price <= 0) {
      setFormError('Veuillez spécifier un poids et un prix valides');
      return;
    }
    
    try {
      const newOption = await createPriceOption({
        product_id: productId,
        weight: newPriceOption.weight,
        price: newPriceOption.price,
        is_default: priceOptions.length === 0 ? true : newPriceOption.is_default
      });
      
      // Si c'est la première option ou si elle est définie comme par défaut
      if (newOption.is_default) {
        // Réinitialiser les autres options via l'API
        await setDefaultPriceOption(productId, newOption.id);
      }
      
      // Mettre à jour la liste des options
      setPriceOptions(prev => [...prev, newOption]);
      
      // Réinitialiser le formulaire
      setNewPriceOption({
        weight: '',
        price: 0,
        is_default: false
      });
    } catch (error) {
      console.error('Error adding price option:', error);
      setFormError('Erreur lors de l\'ajout de l\'option de prix');
    }
  };
  
  // Supprimer une option de prix
  const removePriceOption = async (id: string) => {
    try {
      await deletePriceOption(id);
      
      const optionToRemove = priceOptions.find(option => option.id === id);
      const remainingOptions = priceOptions.filter(option => option.id !== id);
      
      // Si l'option supprimée était celle par défaut et qu'il reste d'autres options
      if (optionToRemove?.is_default && remainingOptions.length > 0) {
        // Définir la première option restante comme celle par défaut
        await setDefaultPriceOption(productId, remainingOptions[0].id);
      }
      
      // Mettre à jour la liste des options
      setPriceOptions(remainingOptions);
    } catch (error) {
      console.error('Error removing price option:', error);
      setFormError('Erreur lors de la suppression de l\'option de prix');
    }
  };
  
  // Définir une option comme celle par défaut
  const handleSetDefaultPriceOption = async (id: string) => {
    try {
      await setDefaultPriceOption(productId, id);
      
      // Mettre à jour la liste des options
      setPriceOptions(prev => 
        prev.map(option => ({
          ...option,
          is_default: option.id === id
        }))
      );
    } catch (error) {
      console.error('Error setting default price option:', error);
      setFormError('Erreur lors de la définition de l\'option par défaut');
    }
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

  const handleAdditionalImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError(null);
    
    try {
      // Vérifier que les champs d'avis sont remplis
      if (formData.review_count === null || formData.review_count === undefined) {
        setFormError('Le nombre d\'avis est obligatoire.');
        setIsSaving(false);
        return;
      }

      if (formData.rating === null || formData.rating === undefined) {
        setFormError('L\'évaluation (étoiles) est obligatoire.');
        setIsSaving(false);
        return;
      }

      // Update product data
      await updateProduct(productId, formData);
      
      // If using dynamic pricing, make sure other pricing options are disabled
      if (useDynamicPricing) {
        // No need to do anything with the price options as they are managed separately
        // through the addPriceOption, removePriceOption, and handleSetDefaultPriceOption functions
      }
      
      // Upload new main image if exists
      if (imageFile) {
        try {
          const imageUrl = await uploadProductImage(imageFile, imageFile.name);
          await updateProduct(productId, { image_url: imageUrl });
        } catch (error) {
          console.error('Error uploading image:', error);
          setFormError('Erreur lors du téléchargement de l\'image. Veuillez réessayer.');
          setIsSaving(false);
          return;
        }
      }
      
      // Redirect to admin dashboard
      router.push('/admin?tab=products');
    } catch (error) {
      console.error("Error updating product:", error);
      setFormError("Une erreur est survenue lors de la mise à jour du produit.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddImage = async () => {
    if (newImageFile) {
      setIsUploadingImage(true);
      try {
        // Upload the image file
        const imageUrl = await uploadProductImage(newImageFile, newImageFile.name);
        
        // Create the product image record
        const newImageData = {
          product_id: productId,
          image_url: imageUrl,
          is_primary: false
        };
        
        const newImage = await createProductImage(newImageData);
        setProductImages([...productImages, newImage]);
        setNewImagePreview(null);
        setNewImageFile(null);
      } catch (error) {
        console.error('Error adding image:', error);
        setFormError('Erreur lors de la création de l\'image. Veuillez réessayer.');
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const handleSetPrimaryImage = async (imageId: string) => {
    try {
      await setProductPrimaryImage(imageId);
      
      // Trouver l'image qui vient d'être définie comme principale
      const primaryImage = productImages.find(img => img.id === imageId);
      if (primaryImage) {
        // Mettre à jour l'image principale du produit aussi
        setFormData({
          ...formData,
          image_url: primaryImage.image_url
        });
      }
      
      // Mettre à jour l'état local
      setProductImages(productImages.map(img =>
        img.id === imageId ? { ...img, is_primary: true } : { ...img, is_primary: false }
      ));
      
    } catch (error) {
      console.error('Error setting primary image:', error);
      setFormError('Erreur lors de la définition de l\'image principale. Veuillez réessayer.');
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await deleteProductImage(imageId);
      setProductImages(productImages.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Error deleting image:', error);
      setFormError('Erreur lors de la suppression de l\'image. Veuillez réessayer.');
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
                <span className={formStyles.checkboxWrapper}>Afficher dans le slider &quot;Nos Produits Phares&quot;</span>
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
                  <span className={formStyles.helpText}>Laissez vide s&apos;il n&apos;y a pas de réduction</span>
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
                                  onClick={() => handleSetDefaultPriceOption(option.id)}
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
              <label htmlFor="review_count">Nombre d&apos;avis *</label>
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
                  value={formData.culture_type || 'none'}
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
                value={formData.origin || ''}
                onChange={handleChange}
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
                  <FontAwesomeIcon icon={faUpload} /> {imagePreview ? 'Changer l&apos;image principale' : 'Choisir l&apos;image principale'}
                </label>
              </div>
            </div>
            
            {/* Additional Images Section */}
            <div className={formStyles.formGroup}>
              <label>Images supplémentaires</label>
              <div className={styles.additionalImagesContainer}>
                {productImages.length > 0 && (
                  <div className={styles.imagesGrid}>
                    {productImages.map(img => (
                      <div key={img.id} className={`${styles.imageItem} ${img.is_primary ? styles.primaryImage : ''}`}>
                        <div className={styles.imageContainer}>
                          <Image 
                            src={img.image_url} 
                            alt="Image produit" 
                            width={120} 
                            height={120} 
                            className={styles.productImage}
                          />
                          {img.is_primary && (
                            <span className={styles.primaryBadge}>
                              <FontAwesomeIcon icon={faStar} /> Principal
                            </span>
                          )}
                        </div>
                        <div className={styles.imageActions}>
                          {!img.is_primary && (
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
                            onClick={() => handleDeleteImage(img.id)}
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
                  
                  {newImageFile && (
                    <button
                      type="button"
                      onClick={handleAddImage}
                      disabled={isUploadingImage}
                      className={styles.btnAddImage}
                    >
                      <FontAwesomeIcon icon={faPlus} /> {isUploadingImage ? 'Ajout en cours...' : 'Ajouter l\'image'}
                    </button>
                  )}
                </div>
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