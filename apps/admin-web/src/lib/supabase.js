import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nydusjwdmmqtapfjhrpl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_xELBZLeFdPxm2K9JNEJHDQ_NANo7OZQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload an image file to the 'product-images' bucket in Supabase Storage.
 * Returns the public URL of the uploaded image.
 *
 * @param {File} file
 * @returns {Promise<string>} publicUrl
 */
export async function uploadProductImage(file) {
  if (!file) throw new Error('No image file selected');

  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const cleanBase = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `admin/${Date.now()}_${cleanBase}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'image/jpeg',
    });

  if (error) {
    console.error('Supabase storage upload error:', error);
    throw new Error(error.message || 'Failed to upload product image to storage');
  }

  const { data: publicData } = supabase.storage
    .from('product-images')
    .getPublicUrl(data.path);

  return publicData.publicUrl;
}
