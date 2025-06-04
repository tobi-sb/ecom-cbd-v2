import { supabase } from '@/lib/supabase';

export interface PromoCode {
  id: string;
  code: string;
  discount_percent: number;
  discount_type: 'percentage' | 'fixed';
  min_order_amount: number;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
}

export async function validatePromoCode(code: string, orderAmount: number): Promise<{ valid: boolean; discount: number; message?: string }> {
  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error) throw error;
    if (!data) {
      return { valid: false, discount: 0, message: 'Code promo invalide' };
    }

    const promoCode = data as PromoCode;

    // Check if promo code has expired
    if (promoCode.expires_at && new Date(promoCode.expires_at) < new Date()) {
      return { valid: false, discount: 0, message: 'Ce code promo a expiré' };
    }

    // Check minimum order amount
    if (orderAmount < promoCode.min_order_amount) {
      return {
        valid: false,
        discount: 0,
        message: `Le montant minimum de commande est de ${promoCode.min_order_amount}€`
      };
    }

    return {
      valid: true,
      discount: (orderAmount * promoCode.discount_percent) / 100
    };
  } catch (error) {
    console.error('Error validating promo code:', error);
    return { valid: false, discount: 0, message: 'Erreur lors de la validation du code promo' };
  }
}

export async function getAllPromoCodes(): Promise<PromoCode[]> {
  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    throw error;
  }
}

export async function createPromoCode(promoCode: Omit<PromoCode, 'id' | 'created_at'>): Promise<PromoCode> {
  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .insert([promoCode])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating promo code:', error);
    throw error;
  }
}

export async function updatePromoCode(id: string, promoCode: Partial<PromoCode>): Promise<PromoCode> {
  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .update(promoCode)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating promo code:', error);
    throw error;
  }
}

export async function deletePromoCode(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('promo_codes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting promo code:', error);
    throw error;
  }
} 