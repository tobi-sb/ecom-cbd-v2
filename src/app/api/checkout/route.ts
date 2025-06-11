import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Helper function to validate and format image URLs
function getValidImageUrl(imageUrl: string | undefined, origin: string | null): string[] {
  if (!imageUrl) return [];
  
  try {
    // If the image URL is already absolute (with http or https), use it as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      // Check if it's a valid URL by attempting to create a URL object
      new URL(imageUrl);
      return [imageUrl];
    }
    
    // If it's a relative URL starting with '/', prepend the origin
    if (imageUrl.startsWith('/') && origin) {
      try {
        const fullUrl = `${origin}${imageUrl}`;
        new URL(fullUrl); // Validate it's a proper URL
        return [fullUrl];
      } catch (_) {
        return []; // Invalid URL, return empty array
      }
    }
    
    // Not a valid URL format we can handle
    return [];
  } catch (_) {
    console.error("Invalid image URL:", imageUrl);
    return []; // Return empty array for any errors
  }
}

export async function POST(request: Request) {
  try {
    // Extract user info and items from the request body
    const body = await request.json();
    const { items, userInfo, shippingMethod, promoCode } = body;
    
    // Verify user info is present
    if (!userInfo || !userInfo.id || !userInfo.email) {
      return NextResponse.json(
        { error: 'Informations utilisateur manquantes' },
        { status: 400 }
      );
    }
    
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    
    // Verify items are present
    if (!items || !items.length) {
      return NextResponse.json(
        { error: 'Aucun article dans le panier' },
        { status: 400 }
      );
    }

    // Create line items for Stripe
    const lineItems = items.map((item: { name: string; description?: string; image?: string; price: number; quantity: number }) => {
      // Create the base product data
      const productData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData.ProductData = {
        name: item.name,
        description: item.description || '',
      };
      
      // Add images only if they're valid URLs
      const validImages = getValidImageUrl(item.image, origin);
      if (validImages.length > 0) {
        productData.images = validImages;
      }
      
      return {
        price_data: {
          currency: 'eur',
          product_data: productData,
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      };
    });

    // Calculate shipping cost based on method
    const shippingCosts = {
      point_relais_48h: 4.55,
      domicile_48h: 5.25,
      express_point_relais_24h: 8.50
    };
    
    // Calculate subtotal
    const subtotal = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    const shippingCost = subtotal >= 80 ? 0 : shippingCosts[shippingMethod as keyof typeof shippingCosts] || shippingCosts.point_relais_48h;

    // Add shipping as a line item only if not free
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Frais de livraison',
            description: `Livraison - ${shippingMethod.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}`,
          },
          unit_amount: Math.round(shippingCost * 100), // Convert to cents
        },
        quantity: 1,
      });
    }

    // Handle promo code if provided
    let discountAmount = 0;
    if (promoCode) {
      const { data: promoData, error: promoError } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (!promoError && promoData) {
        const promo = promoData;
        // Check if promo code has expired
        if (!promo.expires_at || new Date(promo.expires_at) > new Date()) {
          // Check minimum order amount
          if (subtotal >= promo.min_order_amount) {
            discountAmount = (subtotal * promo.discount_percent) / 100;
            
            // Add discount as a negative line item
            lineItems.push({
              price_data: {
                currency: 'eur',
                product_data: {
                  name: 'Réduction',
                  description: `Code promo: ${promo.code} (-${promo.discount_percent}%)`,
                },
                unit_amount: -Math.round(discountAmount * 100), // Convert to cents and make negative
              },
              quantity: 1,
            });
          }
        }
      }
    }

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || origin}/cart`,
      shipping_address_collection: {
        allowed_countries: ['FR', 'BE', 'LU', 'CH', 'MC'],
      },
      customer_email: userInfo.email,
      metadata: {
        // Add metadata for order processing in webhook
        orderId: `order-${Date.now()}`,
        customerId: userInfo.id,
        shippingMethod: shippingMethod,
        promoCode: promoCode || '',
        discountAmount: discountAmount.toString(),
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement: ' + error.message },
      { status: 500 }
    );
  }
} 