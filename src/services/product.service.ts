import { supabase } from '@/lib/supabase';
import { Product, ProductWithPrices, Category, ColorVariant } from '@/types/database.types';

/**
 * Fetch all products from Supabase
 */
export const getAllProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories:category_id(*)');

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data || [];
};

/**
 * Get product by ID
 */
export const getProductById = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories:category_id(*)')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching product with id ${id}:`, error);
    return null;
  }

  return data;
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (categorySlug: string): Promise<Product[]> => {
  // If "all" is passed, return all products
  if (categorySlug === 'all') {
    return getAllProducts();
  }

  // First, get the category ID by slug
  const { data: categoryData, error: categoryError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single();

  if (categoryError) {
    console.error(`Error fetching category with slug ${categorySlug}:`, categoryError);
    return [];
  }

  // Then get products by category ID
  const { data, error } = await supabase
    .from('products')
    .select('*, categories:category_id(*)')
    .eq('category_id', categoryData.id);

  if (error) {
    console.error(`Error fetching products by category ${categorySlug}:`, error);
    return [];
  }

  return data || [];
};

/**
 * Format product with weight options
 */
export const formatProductWithPrices = (product: Product): ProductWithPrices => {
  // Check if product uses weight-based pricing
  const hasWeightPricing = product.price_3g > 0 || product.price_5g > 0 || 
                          product.price_10g > 0 || product.price_20g > 0;
  
  if (hasWeightPricing) {
    // If product has weight-based pricing, use those options
  const weightOptions = [
    { weight: '3g', price: product.price_3g },
    { weight: '5g', price: product.price_5g },
    { weight: '10g', price: product.price_10g },
    { weight: '20g', price: product.price_20g }
  ].filter(option => option.price > 0);

    // If no weight options are available despite being weight-based, set a default price option
    if (weightOptions.length === 0) {
      weightOptions.push({ weight: 'default', price: 0 });
    }

  return {
    ...product,
    weightOptions
  };
  } else {
    // If product has a base price, use that as the single option
    return {
      ...product,
      weightOptions: [{ weight: 'default', price: product.base_price || 0 }]
    };
  }
};

/**
 * Get product with formatted weight options
 */
export const getDetailedProduct = async (id: string): Promise<ProductWithPrices | null> => {
  const product = await getProductById(id);
  
  if (!product) {
    return null;
  }

  return formatProductWithPrices(product);
};

/**
 * Get all categories
 */
export const getAllCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
};

/**
 * Get category by slug
 */
export const getCategoryBySlug = async (slug: string): Promise<Category | null> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error(`Error fetching category with slug ${slug}:`, error);
    return null;
  }

  return data;
};

/**
 * Create a new product in Supabase
 */
export const createProduct = async (productData: Partial<Product>): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw error;
  }

  return data;
};

/**
 * Update an existing product in Supabase
 */
export const updateProduct = async (id: string, productData: Partial<Product>): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .update(productData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating product with id ${id}:`, error);
    throw error;
  }

  return data;
};

/**
 * Delete a product from Supabase
 */
export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting product with id ${id}:`, error);
    throw error;
  }
};

/**
 * Upload a product image to Supabase Storage
 */
export const uploadProductImage = async (file: File, fileName: string): Promise<string> => {
  // Create a unique file name to avoid collisions
  const uniqueFileName = `${Date.now()}_${fileName.replace(/\s+/g, '_')}`;
  const filePath = `products/${uniqueFileName}`;
  
  const { error } = await supabase
    .storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }

  // Get the public URL for the uploaded image
  const { data: urlData } = supabase
    .storage
    .from('product-images')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
};

/**
 * Create a new category in Supabase
 */
export const createCategory = async (categoryData: Partial<Category>): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .insert([categoryData])
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error);
    throw error;
  }

  return data;
};

/**
 * Get category by ID
 */
export const getCategoryById = async (id: string): Promise<Category | null> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching category with id ${id}:`, error);
    return null;
  }

  return data;
};

/**
 * Update an existing category in Supabase
 */
export const updateCategory = async (id: string, categoryData: Partial<Category>): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .update(categoryData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating category with id ${id}:`, error);
    throw error;
  }

  return data;
};

/**
 * Check if a category has associated products
 */
export const categoryHasProducts = async (categoryId: string): Promise<boolean> => {
  const { error, count } = await supabase
    .from('products')
    .select('id', { count: 'exact' })
    .eq('category_id', categoryId);
  
  if (error) {
    console.error(`Error checking if category ${categoryId} has products:`, error);
    throw error;
  }
  
  return (count || 0) > 0;
};

/**
 * Delete a category from Supabase
 */
export const deleteCategory = async (id: string): Promise<void> => {
  // First check if the category has associated products
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id')
    .eq('category_id', id);

  if (productsError) {
    console.error(`Error checking products for category ${id}:`, productsError);
    throw productsError;
  }

  if (products && products.length > 0) {
    throw {
      code: 'CATEGORY_HAS_PRODUCTS',
      message: 'Cette catégorie a des produits associés. Veuillez d\'abord supprimer ou réassigner ces produits.',
      details: 'Cette catégorie ne peut pas être supprimée car elle contient des produits. Pour la supprimer, vous devez d\'abord supprimer tous les produits associés ou les réassigner à une autre catégorie.'
    };
  }

  // If no associated products, proceed with deletion
  const { error: deleteError } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (deleteError) {
    console.error(`Error deleting category with id ${id}:`, deleteError);
    throw deleteError;
  }
};

/**
 * Upload a category image to Supabase Storage
 */
export const uploadCategoryImage = async (file: File, fileName: string): Promise<string> => {
  // Create a unique file name to avoid collisions
  const uniqueFileName = `${Date.now()}_${fileName.replace(/\s+/g, '_')}`;
  const filePath = `categories/${uniqueFileName}`;
  
  const { error } = await supabase
    .storage
    .from('product-images') // Using the same bucket as products
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }

  // Get the public URL for the uploaded image
  const { data: urlData } = supabase
    .storage
    .from('product-images')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
};

/**
 * Get color variants for a product
 */
export const getProductColorVariants = async (productId: string): Promise<ColorVariant[]> => {
  const { data, error } = await supabase
    .from('color_variants')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error(`Error fetching color variants for product ${productId}:`, error);
    return [];
  }

  return data || [];
};

/**
 * Create a new color variant
 */
export const createColorVariant = async (variantData: Omit<ColorVariant, 'id' | 'created_at' | 'updated_at'>): Promise<ColorVariant> => {
  const { data, error } = await supabase
    .from('color_variants')
    .insert([variantData])
    .select()
    .single();

  if (error) {
    console.error('Error creating color variant:', error);
    throw error;
  }

  return data;
};

/**
 * Update a color variant
 */
export const updateColorVariant = async (id: string, variantData: Partial<ColorVariant>): Promise<ColorVariant> => {
  const { data, error } = await supabase
    .from('color_variants')
    .update(variantData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating color variant ${id}:`, error);
    throw error;
  }

  return data;
};

/**
 * Delete a color variant
 */
export const deleteColorVariant = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('color_variants')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting color variant ${id}:`, error);
    throw error;
  }
};

/**
 * Upload a color variant image
 */
export const uploadColorVariantImage = async (file: File, fileName: string): Promise<string> => {
  const uniqueFileName = `${Date.now()}_${fileName.replace(/\s+/g, '_')}`;
  const filePath = `color-variants/${uniqueFileName}`;
  
  const { error } = await supabase
    .storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Error uploading color variant image:', error);
    throw error;
  }

  const { data: urlData } = supabase
    .storage
    .from('product-images')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}; 