import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import styles from '../admin.module.css';

interface PromoCode {
  id: string;
  code: string;
  discount_percent: number;
  discount_type: 'percentage' | 'fixed';
  min_order_amount: number;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
}

export default function PromoCodesTab() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discount_percent: 10,
    discount_type: 'percentage' as 'percentage' | 'fixed',
    min_order_amount: 0,
    is_active: true,
    expires_at: ''
  });

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromoCodes(data || []);
    } catch (err: any) {
      console.error('Error fetching promo codes:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPromo) {
        const { error } = await supabase
          .from('promo_codes')
          .update({
            code: formData.code,
            discount_percent: formData.discount_percent,
            discount_type: formData.discount_type,
            min_order_amount: formData.min_order_amount,
            is_active: formData.is_active,
            expires_at: formData.expires_at || null
          })
          .eq('id', editingPromo.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('promo_codes')
          .insert([{
            code: formData.code,
            discount_percent: formData.discount_percent,
            discount_type: formData.discount_type,
            min_order_amount: formData.min_order_amount,
            is_active: formData.is_active,
            expires_at: formData.expires_at || null
          }]);

        if (error) throw error;
      }

      await fetchPromoCodes();
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error('Error saving promo code:', err);
      setError(err.message);
    }
  };

  const handleEdit = (promo: PromoCode) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code,
      discount_percent: promo.discount_percent,
      discount_type: promo.discount_type,
      min_order_amount: promo.min_order_amount,
      is_active: promo.is_active,
      expires_at: promo.expires_at || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce code promo ?')) return;

    try {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchPromoCodes();
    } catch (err: any) {
      console.error('Error deleting promo code:', err);
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discount_percent: 10,
      discount_type: 'percentage' as 'percentage' | 'fixed',
      min_order_amount: 0,
      is_active: true,
      expires_at: ''
    });
    setEditingPromo(null);
  };

  if (isLoading) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  return (
    <div>
      <div className={styles.adminHeader}>
        <h1>Gestion des codes promo</h1>
        <button
          className={styles.btnNewItem}
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        >
          <FontAwesomeIcon icon={faPlus} /> Nouveau code promo
        </button>
      </div>

      {error && (
        <div className={`${styles.message} ${styles.error}`}>
          {error}
        </div>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Code</th>
              <th>Réduction</th>
              <th>Montant minimum</th>
              <th>Statut</th>
              <th>Expire le</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {promoCodes.map((promo) => (
              <tr key={promo.id}>
                <td>{promo.code}</td>
                <td>{promo.discount_percent}%</td>
                <td>{promo.min_order_amount}€</td>
                <td>
                  <span className={`${styles.statusBadge} ${promo.is_active ? styles.active : styles.inactive}`}>
                    {promo.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td>{promo.expires_at ? new Date(promo.expires_at).toLocaleDateString('fr-FR') : 'Jamais'}</td>
                <td>
                  <div className={styles.tableActions}>
                    <button
                      className={styles.btnEdit}
                      onClick={() => handleEdit(promo)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className={styles.btnDelete}
                      onClick={() => handleDelete(promo.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>{editingPromo ? 'Modifier le code promo' : 'Nouveau code promo'}</h3>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="code">Code promo</label>
                <input
                  type="text"
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="discount_percent">Pourcentage de réduction</label>
                <input
                  type="number"
                  id="discount_percent"
                  value={formData.discount_percent}
                  onChange={(e) => setFormData({ ...formData, discount_percent: Number(e.target.value) })}
                  min="0"
                  max="100"
                  required
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="discount_type">Type de réduction</label>
                <select
                  id="discount_type"
                  value={formData.discount_type}
                  onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as 'percentage' | 'fixed' })}
                  required
                  className={styles.formInput}
                >
                  <option value="percentage">Pourcentage</option>
                  <option value="fixed">Montant fixe</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="min_order_amount">Montant minimum de commande (€)</label>
                <input
                  type="number"
                  id="min_order_amount"
                  value={formData.min_order_amount}
                  onChange={(e) => setFormData({ ...formData, min_order_amount: Number(e.target.value) })}
                  min="0"
                  required
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="expires_at">Date d'expiration</label>
                <input
                  type="date"
                  id="expires_at"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className={styles.checkboxInput}
                  />
                  <span className={styles.checkboxWrapper}>Code promo actif</span>
                </label>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.btnCancel}
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                >
                  Annuler
                </button>
                <button type="submit" className={styles.btnSave}>
                  {editingPromo ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 