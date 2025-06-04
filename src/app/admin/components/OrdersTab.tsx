'use client';

import { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '@/services/order.service';
import { Order } from '@/types/database.types';
import styles from '../admin.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faEye, faCheck, faTimes, faUndo } from '@fortawesome/free-solid-svg-icons';

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const ordersData = await getAllOrders();
      setOrders(ordersData);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Erreur lors du chargement des commandes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: 'paid' | 'failed' | 'refunded') => {
    try {
      await updateOrderStatus(orderId, newStatus);
      await fetchOrders(); // Refresh the orders list
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Erreur lors de la mise à jour du statut');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        <p>Chargement des commandes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{error}</p>
        <button onClick={fetchOrders} className={styles.btnRetry}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className={styles.tabContent}>
      <h2>Commandes</h2>
      
      {orders.length === 0 ? (
        <p className={styles.noData}>Aucune commande trouvée</p>
      ) : (
        <div className={styles.ordersList}>
          {orders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div className={styles.orderInfo}>
                  <h3>Commande #{order.id.slice(0, 8)}</h3>
                  <p className={styles.orderDate}>{formatDate(order.created_at)}</p>
                </div>
                <div className={styles.orderStatus}>
                  <div className={styles.statusMarkSection}>
                    <span className={`${styles.statusMark} ${styles[`${order.status}Mark`]}`}></span>
                    <span className={`${styles.statusLabel}`}>
                      {order.status === 'paid' && 'Payée'}
                      {order.status === 'pending' && 'En attente'}
                      {order.status === 'failed' && 'Échouée'}
                      {order.status === 'refunded' && 'Remboursée'}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.orderDetails}>
                <div className={styles.customerInfo}>
                  <h4>Client</h4>
                  <p>{order.shipping_address.name}</p>
                  <p>{order.shipping_address.address}</p>
                  <p>{order.shipping_address.postal_code} {order.shipping_address.city}</p>
                  <p>{order.shipping_address.country}</p>
                </div>

                <div className={styles.orderSummary}>
                  <h4>Résumé</h4>
                  <p>Total: {formatPrice(order.total_amount)}</p>
                  <p>Articles: {order.items.length}</p>
                </div>

                <div className={styles.orderActions}>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className={styles.btnView}
                    title="Voir les détails"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'paid')}
                        className={styles.btnApprove}
                        title="Marquer comme payée"
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'failed')}
                        className={styles.btnReject}
                        title="Marquer comme échouée"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </>
                  )}
                  
                  {order.status === 'paid' && (
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'refunded')}
                      className={styles.btnRefund}
                      title="Rembourser"
                    >
                      <FontAwesomeIcon icon={faUndo} />
                    </button>
                  )}
                </div>
              </div>

              {selectedOrder?.id === order.id && (
                <div className={styles.orderItems}>
                  <h4>Articles commandés</h4>
                  {order.items.map((item, index) => (
                    <div key={index} className={styles.orderItem}>
                      <div className={styles.itemInfo}>
                        <p className={styles.itemName}>{item.name}</p>
                        <p className={styles.itemQuantity}>Quantité: {item.quantity}</p>
                      </div>
                      <p className={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 