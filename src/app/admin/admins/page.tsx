'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import styles from '../admin.module.css';
import { ADMIN_EMAILS } from '@/config/admins';

export default function AdminManagement() {
  const [admins, setAdmins] = useState<string[]>([...ADMIN_EMAILS]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleAddAdmin = async () => {
    if (!newAdminEmail || !newAdminEmail.includes('@')) {
      setMessage({ text: 'Veuillez saisir une adresse email valide', type: 'error' });
      return;
    }

    if (admins.includes(newAdminEmail)) {
      setMessage({ text: 'Cet email est déjà un administrateur', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      // In a real application, you would save this to your database
      // For demonstration, we're just updating the state
      const updatedAdmins = [...admins, newAdminEmail];
      setAdmins(updatedAdmins);
      setNewAdminEmail('');
      
      // Show success message
      setMessage({ 
        text: `${newAdminEmail} a été ajouté comme administrateur. Mise à jour du fichier de configuration requise.`, 
        type: 'success' 
      });
      
    } catch (error) {
      console.error('Error adding admin:', error);
      setMessage({ text: 'Une erreur est survenue l&apos;ajout de l&apos;administrateur', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAdmin = async (email: string) => {
    if (email === 'admin@example.com') {
      setMessage({ text: 'L&apos;administrateur par défaut ne peut pas être supprimé', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      // In a real application, you would save this to your database
      // For demonstration, we're just updating the state
      const updatedAdmins = admins.filter(admin => admin !== email);
      setAdmins(updatedAdmins);
      
      // Show success message
      setMessage({ 
        text: `${email} a été retiré des administrateurs. Mise à jour du fichier de configuration requise.`, 
        type: 'success' 
      });
      
    } catch (error) {
      console.error('Error removing admin:', error);
      setMessage({ text: 'Une erreur est survenue lors de la suppression de l&apos;administrateur', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminContent}>
        <div className={styles.adminHeader}>
          <div className={styles.adminHeaderTitle}>
            <h1>Gérer les Administrateurs</h1>
          </div>
        </div>

        {/* Message display */}
        {message.text && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}

        <div className={styles.adminMain}>
          <div className={styles.adminFormSection}>
            <h2>Configuration actuelle</h2>
            <p>
              Pour ajouter définitivement un administrateur, vous devez modifier le fichier 
              <code>/src/config/admins.ts</code> après avoir testé l&apos;email ici.
            </p>
            
            <div className={styles.adminForm}>
              <div className={styles.formGroup}>
                <label htmlFor="newAdminEmail">Ajouter un nouvel administrateur</label>
                <div className={styles.inputWithButton}>
                  <input
                    type="email"
                    id="newAdminEmail"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="email@exemple.com"
                    className={styles.formInput}
                    disabled={isLoading}
                  />
                  <button
                    className={styles.btnSave}
                    onClick={handleAddAdmin}
                    disabled={isLoading || !newAdminEmail}
                  >
                    <FontAwesomeIcon icon={faPlus} /> Ajouter
                  </button>
                </div>
              </div>
            </div>

            <h3>Liste des administrateurs</h3>
            <div className={styles.adminTable}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((email) => (
                    <tr key={email}>
                      <td>{email}</td>
                      <td>
                        <div className={styles.tableActions}>
                          <button
                            className={styles.btnDelete}
                            onClick={() => handleRemoveAdmin(email)}
                            disabled={isLoading || email === 'admin@example.com'}
                            title={email === 'admin@example.com' ? 'Administrateur par défaut' : 'Supprimer'}
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

            <div className={styles.configInstructions}>
              <h3>Pour mettre à jour la configuration</h3>
              <p>Pour rendre les changements permanents, modifiez le fichier <code>src/config/admins.ts</code> avec le contenu suivant :</p>
              <pre className={styles.codeBlock}>
                {`// List of admin user emails
export const ADMIN_EMAILS = [
  ${admins.map(email => `'${email}'`).join(',\n  ')}
];

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 