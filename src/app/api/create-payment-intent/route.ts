import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with proper error handling
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-04-30.basil',
});

export async function POST(request: Request) {
  try {
    // Log the request headers for debugging
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));

    const body = await request.json();
    console.log('Received request body:', body);

    const { amount, currency, items, customer } = body;

    // Validate required fields
    if (!amount || !currency) {
      console.error('Missing required fields:', { amount, currency });
      return NextResponse.json(
        { error: 'Missing required fields: amount and currency are required' },
        { status: 400 }
      );
    }

    // Create a simplified items summary for metadata
    const itemsSummary = items.map((item: any) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price
    }));

    console.log('Creating payment intent with data:', {
      amount,
      currency,
      itemsSummary,
      customer
    });

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Ensure amount is an integer
      currency: currency.toLowerCase(), // Ensure currency is lowercase
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        items_count: items.length.toString(),
        customer_email: customer?.email || '',
        customer_name: customer?.name || '',
        // Store only essential item information
        items_summary: JSON.stringify(itemsSummary)
      },
    });

    console.log('Payment intent created successfully:', {
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret?.slice(0, 10) + '...', // Log only part of the secret for security
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status
    });

    if (!paymentIntent.client_secret) {
      throw new Error('No client secret received from Stripe');
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', {
      message: error.message,
      type: error.type,
      code: error.code,
      stack: error.stack
    });

    // Return a more detailed error response
    return NextResponse.json(
      { 
        error: error.message,
        type: error.type,
        code: error.code
      },
      { status: 500 }
    );
  }
} 