import { supabase } from '@/lib/supabase';
import { Order } from '@/types/database.types';

/**
 * Create a new order after successful payment
 */
export const createOrder = async (orderData: {
  stripe_payment_intent_id: string;
  stripe_customer_id?: string;
  total_amount: number;
  currency: string;
  shipping_address: any;
  billing_address: any;
  items: any[];
  shipping_method: string;
}): Promise<Order> => {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    throw new Error('User must be authenticated to create an order');
  }

  const { data, error } = await supabase
    .from('orders')
    .insert([{
      user_id: userData.user.id,
      status: 'paid', // Since this is called after successful payment
      ...orderData
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }

  return data;
};

/**
 * Get all orders for the current user
 */
export const getUserOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }

  return data || [];
};

/**
 * Get all orders (admin only)
 */
export const getAllOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all orders:', error);
    throw error;
  }

  // Parse JSON fields for admin UI
  return (data || []).map(order => ({
    ...order,
    shipping_address: typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address,
    billing_address: typeof order.billing_address === 'string' ? JSON.parse(order.billing_address) : order.billing_address,
    items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
  }));
};

/**
 * Get a single order by ID
 */
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, users:user_id(email)')
    .eq('id', orderId)
    .single();

  if (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    throw error;
  }

  return data;
};

/**
 * Update order status
 */
export const updateOrderStatus = async (
  orderId: string,
  status: 'pending' | 'paid' | 'failed' | 'refunded'
): Promise<Order> => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error(`Error updating order ${orderId}:`, error);
    throw error;
  }

  return data;
}; 