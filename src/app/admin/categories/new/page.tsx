'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../admin.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave, faUpload } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { createCategory, uploadCategoryImage } from '@/services/product.service';
import Image from 'next/image';

export default function NewCategoryPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    order: 0,
    image_url: ''
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Generate slug from name
  useEffect(() => {
    if (formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');
      
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreviewUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      // Handle image upload if present
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadCategoryImage(imageFile, imageFile.name);
      }

      // Create the category
      const finalData = {
        ...formData,
        image_url: imageUrl || null
      };

      await createCategory(finalData);
      
      setMessage({ 
        type: 'success', 
        text: 'Catégorie créée avec succès!' 
      });
      
      // Redirect after short delay
      setTimeout(() => {
        router.push('/admin?tab=categories');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating category:', error);
      setMessage({ 
        type: 'error', 
        text: 'Erreur lors de la création de la catégorie. Veuillez réessayer.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminHeader}>
        <div className={styles.adminHeaderTitle}>
          <Link href="/admin?tab=categories" className={styles.backButton}>
            <FontAwesomeIcon icon={faArrowLeft} /> Retour
          </Link>
          <h1>Nouvelle catégorie</h1>
        </div>
      </div>

      <div className={styles.formContainer}>
        {message.text && (
          <div className={`${styles.message} ${message.type === 'success' ? styles.success : styles.error}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formRow}>
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
              />
            </div>
          </div>

          <div className={styles.formRow}>
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
              />
              <small>Identifiant unique utilisé dans les URLs (généré automatiquement)</small>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formField}>
              <label htmlFor="order">Ordre d&apos;affichage</label>
              <input
                type="number"
                id="order"
                name="order"
                value={formData.order.toString()}
                onChange={handleInputChange}
                placeholder="0"
              />
              <small>Ordre d&apos;affichage (0 = premier)</small>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formField}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Description de la catégorie"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formField}>
              <label htmlFor="image">Image</label>
              <div className={styles.imageUploadContainer}>
                {previewUrl && (
                  <div className={styles.imagePreview}>
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      width={200}
                      height={200}
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}
                <div className={styles.fileInputWrapper}>
                  <button type="button" className={styles.fileInputButton}>
                    <FontAwesomeIcon icon={faUpload} /> Choisir une image
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
              <FontAwesomeIcon icon={faSave} /> {isSubmitting ? 'Création en cours...' : 'Créer la catégorie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 