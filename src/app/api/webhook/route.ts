import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { createOrder } from '@/services/order.service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51RIzYF60Rzh3ncZFQo1efXrqL9WVky6WLqCThAYQnxtopgu9O7OCywKKGjldaUiv0tjNtsN0LVSZdnDraxlBvvA500EJq1z2fZ');

// This is your Stripe webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = headers();
  const sig = headersList.get('stripe-signature');

  let event;

  try {
    if (!sig || !endpointSecret) {
      // For development without webhook signature verification
      event = JSON.parse(body);
    } else {
      // For production with webhook signature verification
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    }
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      try {
        // Get the payment intent details
        const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
        
        // Create order in Supabase
        await createOrder({
          stripe_payment_intent_id: paymentIntent.id,
          stripe_customer_id: paymentIntent.customer as string,
          total_amount: paymentIntent.amount / 100, // Convert from cents to euros
          currency: paymentIntent.currency,
          shipping_address: {
            name: session.shipping_details?.name || '',
            address: session.shipping_details?.address?.line1 || '',
            city: session.shipping_details?.address?.city || '',
            postal_code: session.shipping_details?.address?.postal_code || '',
            country: session.shipping_details?.address?.country || '',
            phone: session.shipping_details?.phone || ''
          },
          billing_address: {
            name: session.customer_details?.name || '',
            address: session.customer_details?.address?.line1 || '',
            city: session.customer_details?.address?.city || '',
            postal_code: session.customer_details?.address?.postal_code || '',
            country: session.customer_details?.address?.country || '',
            phone: session.customer_details?.phone || ''
          },
          items: session.line_items?.data.map((item: any) => ({
            product_id: item.price?.product as string,
            name: item.description || '',
            quantity: item.quantity || 1,
            price: item.amount_total / 100 / (item.quantity || 1), // Convert from cents to euros and divide by quantity
            image_url: item.price?.product_data?.images?.[0]
          })) || [],
          shipping_method: session.metadata?.shippingMethod || 'point_relais_48h'
        });

        console.log('Order created successfully:', session.metadata.orderId);
      } catch (error) {
        console.error('Error handling checkout complete:', error);
        return NextResponse.json(
          { error: 'Error creating order' },
          { status: 500 }
        );
      }
      break;

    case 'payment_intent.succeeded':
      console.log('PaymentIntent was successful!', event.data.object.id);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

// To handle OPTIONS requests (CORS preflight)
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
} 