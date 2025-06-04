'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import styles from './page.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faShoppingBag, faExclamationTriangle, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { createOrder } from '@/services/order.service';
import { validatePromoCode } from '@/services/promo.service';

// Load Stripe outside of component render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image_url?: string;
}

interface FormData {
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingPhone: string;
  billingName: string;
  billingAddress: string;
  billingCity: string;
  billingPostalCode: string;
  billingPhone: string;
  email: string;
  shippingMethod: string;
}

// Custom payment form component
function PaymentForm({ 
  formData, 
  cart, 
  totalAmount, 
  onSuccess, 
  onError 
}: { 
  formData: FormData;
  cart: CartItem[];
  totalAmount: number;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      console.error('Stripe not initialized');
      onError('Payment system is not initialized. Please try again.');
      return;
    }

    setIsProcessing(true);

    try {
      console.log('Creating payment intent for amount:', totalAmount * 100);
      
      // Create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(totalAmount * 100), // Convert to cents and ensure integer
          currency: 'eur',
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          customer: {
            email: formData.email,
            name: formData.shippingName,
            address: {
              line1: formData.shippingAddress,
              city: formData.shippingCity,
              postal_code: formData.shippingPostalCode,
              country: 'FR'
            },
          },
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Payment intent creation failed:', responseData);
        throw new Error(responseData.error || 'Failed to create payment intent');
      }

      if (!responseData.clientSecret) {
        console.error('No client secret in response:', responseData);
        throw new Error('Invalid response from payment server');
      }

      console.log('Payment intent created, confirming payment...');

      // Confirm the payment
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(responseData.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: formData.billingName,
            email: formData.email,
            address: {
              line1: formData.billingAddress,
              city: formData.billingCity,
              postal_code: formData.billingPostalCode,
              country: 'FR'
            },
          },
        },
      });

      if (paymentError) {
        console.error('Payment confirmation error:', paymentError);
        onError(paymentError.message || 'Payment failed');
      } else if (paymentIntent) {
        console.log('Payment successful:', {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount
        });
        onSuccess(paymentIntent);
      }
    } catch (error: any) {
      console.error('Payment processing error:', error);
      onError(error.message || 'An error occurred during payment processing');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.paymentForm}>
      <div className={styles.cardElementContainer}>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className={styles.payButton}
      >
        {isProcessing ? (
          <FontAwesomeIcon icon={faSpinner} spin />
        ) : (
          `Pay ${totalAmount.toFixed(2)}€`
        )}
      </button>
    </form>
  );
}

export default function Checkout() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { cart, getCartTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<FormData>({
    shippingName: '',
    shippingAddress: '',
    shippingCity: '',
    shippingPostalCode: '',
    shippingPhone: '',
    billingName: '',
    billingAddress: '',
    billingCity: '',
    billingPostalCode: '',
    billingPhone: '',
    email: user?.email || '',
    shippingMethod: 'point_relais_48h'
  });

  const [promoCode, setPromoCode] = useState('');
  const [promoCodeResult, setPromoCodeResult] = useState<{ valid: boolean; discount: number; message?: string } | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Redirect to cart if cart is empty or login if not authenticated
  useEffect(() => {
    if (cart.length === 0) {
      router.push('/cart');
    } else if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
    }
  }, [cart, router, isAuthenticated]);

  // Calculate cart totals
  const cartTotal = getCartTotal();
  const shippingCosts = {
    point_relais_48h: 4.55,
    domicile_48h: 5.25,
    express_point_relais_24h: 8.50
  };
  const shippingCost = cartTotal >= 80 ? 0 : shippingCosts[formData.shippingMethod as keyof typeof shippingCosts];
  const discount = promoCodeResult?.valid ? promoCodeResult.discount : 0;
  const totalWithShippingAndDiscount = cartTotal + shippingCost - discount;

  const handlePaymentSuccess = async (paymentIntent: any) => {
    try {
      console.log('Starting order creation process...');
      console.log('Payment Intent:', paymentIntent);
      console.log('Form Data:', formData);
      console.log('Cart Items:', cart);

      // Create order in Supabase
      const orderData = {
        stripe_payment_intent_id: paymentIntent.id,
        stripe_customer_id: paymentIntent.customer,
        total_amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        shipping_address: {
          name: formData.shippingName,
          address: formData.shippingAddress,
          city: formData.shippingCity,
          postal_code: formData.shippingPostalCode,
          country: 'FR',
          phone: formData.shippingPhone
        },
        billing_address: {
          name: formData.billingName,
          address: formData.billingAddress,
          city: formData.billingCity,
          postal_code: formData.billingPostalCode,
          country: 'FR',
          phone: formData.billingPhone
        },
        items: cart.map((item: CartItem) => ({
          product_id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image_url: item.image_url
        })),
        shipping_method: formData.shippingMethod
      };

      console.log('Order data to be saved:', orderData);

      const order = await createOrder(orderData);
      console.log('Order created successfully:', order);

      // Clear cart and redirect to success page
      clearCart();
      router.push('/checkout/success');
    } catch (error) {
      console.error('Error saving order:', error);
      setError('Une erreur est survenue lors de l\'enregistrement de votre commande. Veuillez contacter le support.');
    }
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

  if (cart.length === 0 || !isAuthenticated) {
    return <div className={styles.loading}><FontAwesomeIcon icon={faSpinner} spin /></div>;
  }

  return (
    <div className={styles.checkoutContainer}>
      <h1 className={styles.checkoutTitle}>Finaliser votre commande</h1>
      
      <div className={styles.checkoutContent}>
        <div className={styles.orderSummary}>
          <h2>Récapitulatif de commande</h2>
          
          <div className={styles.productsList}>
            {cart.map((item) => (
              <div key={item.id} className={styles.productItem}>
                <div className={styles.productInfo}>
                  <div className={styles.productImagePlaceholder}>
                    {/* Display first letter of product name if no image */}
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <h3>{item.name}</h3>
                    <p className={styles.productQuantity}>Quantité: {item.quantity}</p>
                  </div>
                </div>
                <div className={styles.productPrice}>
                  {(item.price * item.quantity).toFixed(2)}€
                </div>
              </div>
            ))}
          </div>
          
          <div className={styles.divider}></div>
          
          <div className={styles.costSummary}>
            <div className={styles.costRow}>
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
            
            <div className={styles.costRow}>
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
              <div className={styles.costRow}>
                <span>Réduction</span>
                <span className={styles.discount}>-{promoCodeResult.discount.toFixed(2)}€</span>
              </div>
            )}
            
            <div className={`${styles.costRow} ${styles.totalRow}`}>
              <span>Total</span>
              <span>{totalWithShippingAndDiscount.toFixed(2)}€</span>
            </div>
          </div>
        </div>
        
        <div className={styles.checkoutForm}>
          <h2>Options de livraison</h2>
          <div className={styles.shippingOptions}>
            <label className={styles.shippingOption}>
              <input
                type="radio"
                name="shippingMethod"
                value="point_relais_48h"
                checked={formData.shippingMethod === 'point_relais_48h'}
                onChange={handleInputChange}
              />
              <span>Point relais 48h - 4.55€</span>
            </label>
            <label className={styles.shippingOption}>
              <input
                type="radio"
                name="shippingMethod"
                value="domicile_48h"
                checked={formData.shippingMethod === 'domicile_48h'}
                onChange={handleInputChange}
              />
              <span>À domicile 48h - 5.25€</span>
            </label>
            <label className={styles.shippingOption}>
              <input
                type="radio"
                name="shippingMethod"
                value="express_point_relais_24h"
                checked={formData.shippingMethod === 'express_point_relais_24h'}
                onChange={handleInputChange}
              />
              <span>Express point relais 24h - 8.50€</span>
            </label>
          </div>

          <h2>Informations de livraison</h2>
          <div className={styles.formGrid}>
            <input
              type="text"
              name="shippingName"
              placeholder="Nom complet"
              value={formData.shippingName}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="shippingAddress"
              placeholder="Adresse"
              value={formData.shippingAddress}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="shippingCity"
              placeholder="Ville"
              value={formData.shippingCity}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="shippingPostalCode"
              placeholder="Code postal"
              value={formData.shippingPostalCode}
              onChange={handleInputChange}
              required
            />
            <input
              type="tel"
              name="shippingPhone"
              placeholder="Téléphone"
              value={formData.shippingPhone}
              onChange={handleInputChange}
              required
            />
          </div>

          <h2>Informations de facturation</h2>
          <div className={styles.formGrid}>
            <input
              type="text"
              name="billingName"
              placeholder="Nom complet"
              value={formData.billingName}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="billingAddress"
              placeholder="Adresse"
              value={formData.billingAddress}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="billingCity"
              placeholder="Ville"
              value={formData.billingCity}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="billingPostalCode"
              placeholder="Code postal"
              value={formData.billingPostalCode}
              onChange={handleInputChange}
              required
            />
            <input
              type="tel"
              name="billingPhone"
              placeholder="Téléphone"
              value={formData.billingPhone}
              onChange={handleInputChange}
              required
            />
          </div>

          <h2>Paiement</h2>
          {error && (
            <div className={styles.errorMessage}>
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <span>{error}</span>
            </div>
          )}
          
          <Elements stripe={stripePromise}>
            <PaymentForm
              formData={formData}
              cart={cart}
              totalAmount={totalWithShippingAndDiscount}
              onSuccess={handlePaymentSuccess}
              onError={setError}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
} 