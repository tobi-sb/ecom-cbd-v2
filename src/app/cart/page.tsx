'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faMinus, faArrowLeft, faShoppingBag, faInfoCircle, faUser, faSpinner } from '@fortawesome/free-solid-svg-icons';
import styles from './page.module.css';
import { validatePromoCode } from '@/services/promo.service';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoCodeResult, setPromoCodeResult] = useState<{ valid: boolean; discount: number; message?: string } | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    setIsUpdating(true);
    updateQuantity(productId, newQuantity);
    // Simulate network delay for user feedback
    setTimeout(() => setIsUpdating(false), 300);
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
  };

  const handlePromoCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setIsValidatingPromo(true);
    try {
      const result = await validatePromoCode(promoCode, cartTotal);
      setPromoCodeResult(result);
    } catch (error) {
      console.error('Error validating promo code:', error);
      setPromoCodeResult({
        valid: false,
        discount: 0,
        message: 'Erreur lors de la validation du code promo'
      });
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const cartTotal = getCartTotal();
  const shippingCosts = {
    point_relais_48h: 4.55,
    domicile_48h: 5.25,
    express_point_relais_24h: 8.50
  };
  const shippingCost = cartTotal >= 80 ? 0 : shippingCosts.point_relais_48h;
  const discount = promoCodeResult?.valid ? promoCodeResult.discount : 0;
  const totalWithShippingAndDiscount = cartTotal + shippingCost - discount;

  if (cart.length === 0) {
    return (
      <div className={styles.emptyCartContainer}>
        <div className={styles.emptyCart}>
          <FontAwesomeIcon icon={faShoppingBag} className={styles.emptyCartIcon} />
          <h2>Votre panier est vide</h2>
          <p>Vous n'avez pas encore ajouté de produits à votre panier.</p>
          <Link href="/products" className={styles.continueShopping}>
            <FontAwesomeIcon icon={faArrowLeft} className={styles.arrowIcon} />
            Découvrir nos produits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cartContainer}>
      <h1 className={styles.cartTitle}>Votre Panier</h1>
      
      <div className={styles.cartContent}>
        <div className={styles.cartItems}>
          <div className={styles.cartItemsContent}>
            <div className={styles.cartHeader}>
              <div className={styles.productColumn}>Produit</div>
              <div className={styles.priceColumn}>Prix</div>
              <div className={styles.quantityColumn}>Quantité</div>
              <div className={styles.totalColumn}>Total</div>
              <div className={styles.actionColumn}></div>
            </div>
            
            {cart.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.productColumn}>
                  <div className={styles.productInfo}>
                    <div className={styles.productImage}>
                      {/* Use image placeholder if image doesn't exist */}
                      {item.image ? (
                        <Image 
                          src={item.image} 
                          alt={item.name} 
                          width={80} 
                          height={80} 
                          objectFit="cover"
                        />
                      ) : (
                        <div className={styles.imagePlaceholder}>
                          CBD
                        </div>
                      )}
                    </div>
                    <div className={styles.productDetails}>
                      <h3>{item.name}</h3>
                      {item.description && <p className={styles.productDescription}>{item.description}</p>}
                    </div>
                  </div>
                </div>
                
                <div className={styles.priceColumn}>
                  {item.price.toFixed(2)}€
                </div>
                
                <div className={styles.quantityColumn}>
                  <div className={styles.quantityControl}>
                    <button 
                      className={styles.quantityBtn}
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={isUpdating}
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                    <span className={styles.quantityValue}>{item.quantity}</span>
                    <button 
                      className={styles.quantityBtn}
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      disabled={isUpdating}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </div>
                </div>
                
                <div className={styles.totalColumn}>
                  {(item.price * item.quantity).toFixed(2)}€
                </div>
                
                <div className={styles.actionColumn}>
                  <button 
                    className={styles.removeBtn}
                    onClick={() => handleRemoveItem(item.id)}
                    aria-label="Supprimer l&apos;article"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className={styles.cartActions}>
            <Link href="/products" className={styles.continueShopping}>
              <FontAwesomeIcon icon={faArrowLeft} className={styles.arrowIcon} />
              Continuer vos achats
            </Link>
            <button onClick={clearCart} className={styles.clearCart}>
              Vider le panier
            </button>
          </div>
        </div>
        
        <div className={styles.cartSummary}>
          <h2>Récapitulatif de commande</h2>
          
          <div className={styles.summaryRow}>
            <span>Sous-total</span>
            <span>{cartTotal.toFixed(2)}€</span>
          </div>

          {/* Promo Code Section */}
          <div className={styles.promoCodeSection}>
            <form onSubmit={handlePromoCodeSubmit} className={styles.promoCodeForm}>
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Code promo"
                className={styles.promoCodeInput}
                disabled={isValidatingPromo}
              />
              <button
                type="submit"
                className={styles.promoCodeButton}
                disabled={isValidatingPromo || !promoCode.trim()}
              >
                {isValidatingPromo ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : (
                  'Appliquer'
                )}
              </button>
            </form>
            {promoCodeResult && (
              <div className={`${styles.promoCodeMessage} ${promoCodeResult.valid ? styles.success : styles.error}`}>
                {promoCodeResult.message || (promoCodeResult.valid && `-${promoCodeResult.discount.toFixed(2)}€`)}
              </div>
            )}
          </div>
          
          <div className={styles.summaryRow}>
            <span>Livraison</span>
            <span>
              {shippingCost === 0 
                ? <span className={styles.freeShipping}>Gratuite</span> 
                : `${shippingCost.toFixed(2)}€`
              }
            </span>
          </div>
          
          {cartTotal < 80 && (
            <div className={styles.shippingMessage}>
              <p>Plus que {(80 - cartTotal).toFixed(2)}€ pour bénéficier de la livraison gratuite!</p>
            </div>
          )}

          {promoCodeResult?.valid && (
            <div className={styles.summaryRow}>
              <span>Réduction</span>
              <span className={styles.discount}>-{promoCodeResult.discount.toFixed(2)}€</span>
            </div>
          )}
          
          <div className={`${styles.summaryRow} ${styles.totalRow}`}>
            <span>Total</span>
            <span>{totalWithShippingAndDiscount.toFixed(2)}€</span>
          </div>
          
          {!isAuthenticated && (
            <div className={styles.loginMessage}>
              <FontAwesomeIcon icon={faInfoCircle} className={styles.infoIcon} />
              <p>Vous devez être connecté pour passer une commande</p>
              <Link href="/login?redirect=/cart" className={styles.loginBtn}>
                <FontAwesomeIcon icon={faUser} className={styles.userIcon} />
                Se connecter
              </Link>
            </div>
          )}
          
          <div className={styles.checkoutActions}>
            <Link 
              href={isAuthenticated ? "/checkout" : "/login?redirect=/checkout"} 
              className={styles.checkoutBtn}
            >
              {isAuthenticated ? "Passer commande" : "Se connecter pour commander"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 