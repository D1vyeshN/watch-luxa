import { randomUUID } from 'crypto';
import { getSupabase, SUPABASE_BUCKET } from '@config/supabase';
import { logger } from '@config/logger';
import { BadRequestError, AppError } from '@utils/AppError';
import { processImage } from '@utils/imageProcessing';
import { slugify } from '@utils/string';

export type UploadFolder =
  | 'brands'
  | 'categories'
  | 'collections'
  | 'products'
  | 'variants'
  | 'avatars';

export interface UploadResult {
  url: string;
  path: string;
  width: number;
  height: number;
  size: number;
}

export class StorageService {
  /**
   * Upload a single image to Supabase Storage.
   * - Processes the image (resize + WebP)
   * - Stores with a unique filename
   * - Returns the public URL
   */
  async uploadImage(
    file: Express.Multer.File,
    folder: UploadFolder,
    nameHint?: string
  ): Promise<UploadResult> {
    if (!file || !file.buffer) {
      throw new BadRequestError('No file provided');
    }

    // 1. Process image
    const processed = await processImage(file.buffer);

    // 2. Build storage path
    const slug = slugify(nameHint || 'image').slice(0, 40) || 'image';
    const uniqueId = randomUUID().split('-')[0];
    const filename = `${slug}-${uniqueId}.webp`;
    const path = `${folder}/${filename}`;

    // 3. Upload to Supabase
    const supabase = getSupabase();
    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(path, processed.buffer, {
        contentType: 'image/webp',
        cacheControl: '31536000', // 1 year
        upsert: false,
      });

    if (error) {
      logger.error({ error, path }, 'Supabase upload failed');
      throw new AppError(`Upload failed: ${error.message}`, 500);
    }

    // 4. Get public URL
    const { data: urlData } = supabase.storage
      .from(SUPABASE_BUCKET)
      .getPublicUrl(path);

    return {
      url: urlData.publicUrl,
      path,
      width: processed.width,
      height: processed.height,
      size: processed.size,
    };
  }

  /**
   * Upload multiple images in parallel.
   */
  async uploadImages(
    files: Express.Multer.File[],
    folder: UploadFolder,
    nameHint?: string
  ): Promise<UploadResult[]> {
    if (!files || files.length === 0) {
      throw new BadRequestError('No files provided');
    }

    return Promise.all(
      files.map((file) => this.uploadImage(file, folder, nameHint))
    );
  }

  /**
   * Delete a file from Supabase Storage by its path.
   */
  async deleteImage(path: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .remove([path]);

    if (error) {
      logger.error({ error, path }, 'Supabase delete failed');
      throw new AppError(`Delete failed: ${error.message}`, 500);
    }
  }

  /**
   * Delete multiple files in one call.
   */
  async deleteImages(paths: string[]): Promise<void> {
    if (paths.length === 0) return;

    const supabase = getSupabase();
    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .remove(paths);

    if (error) {
      logger.error({ error, paths }, 'Supabase bulk delete failed');
      throw new AppError(`Bulk delete failed: ${error.message}`, 500);
    }
  }

  /**
   * Extract the storage path from a public URL.
   * Useful for deletion — public URLs are stored in DB.
   */
  extractPathFromUrl(url: string): string | null {
    const marker = `/object/public/${SUPABASE_BUCKET}/`;
    const index = url.indexOf(marker);
    if (index === -1) return null;
    return url.slice(index + marker.length);
  }
}

export const storageService = new StorageService();
