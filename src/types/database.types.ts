export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at?: string;
  order?: number;
}

export interface ColorVariant {
  id: string;
  product_id: string;
  color_name: string;
  image_url?: string;
  price_adjustment: number;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PriceOption {
  id: string;
  product_id: string;
  price: number;
  weight: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price_3g: number;
  price_5g: number;
  price_10g: number;
  price_30g: number;
  price_50g: number;
  base_price: number;
  discounted_price?: number | null;
  cbd_percentage?: number | null;
  culture_type: 'indoor' | 'outdoor' | 'none';
  origin?: string;
  created_at?: string;
  image_url?: string;
  category?: string;
  category_id?: string;
  tag?: string;
  is_featured?: boolean;
  review_count?: number;
  rating?: number;
  categories?: Category;
  color_variants?: ColorVariant[];
  product_images?: ProductImage[];
  price_options?: PriceOption[];
}

export interface ProductWithCategory extends Product {
  categoryDetails?: Category;
}

export type ProductWithPrices = Product & {
  weightOptions: { weight: string; price: number }[];
};

export type Order = {
  id: string;
  user_id: string;
  stripe_payment_intent_id: string;
  stripe_customer_id?: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  total_amount: number;
  currency: string;
  shipping_method: string;
  shipping_address: {
    name: string;
    address: string;
    city: string;
    postal_code: string;
    country: string;
    phone?: string;
  };
  billing_address: {
    name: string;
    address: string;
    city: string;
    postal_code: string;
    country: string;
    phone?: string;
  };
  items: Array<{
    product_id: string;
    name: string;
    quantity: number;
    price: number;
    image_url?: string;
  }>;
  created_at: string;
  updated_at: string;
};

export interface Database {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at'>;
        Update: Partial<Omit<Product, 'id' | 'created_at'>>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at'>;
        Update: Partial<Omit<Category, 'id' | 'created_at'>>;
      };
      color_variants: {
        Row: ColorVariant;
        Insert: Omit<ColorVariant, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ColorVariant, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
} 