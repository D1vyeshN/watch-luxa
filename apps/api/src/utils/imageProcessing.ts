import sharp from 'sharp';
import { BadRequestError } from './AppError';

export interface ProcessedImage {
  buffer: Buffer;
  format: 'webp';
  width: number;
  height: number;
  size: number;
}

const MAX_WIDTH = 2000;
const MAX_HEIGHT = 2000;
const QUALITY = 85;

/**
 * Resize, convert to WebP, and compress an image buffer.
 * Preserves aspect ratio. Never enlarges small images.
 */
export const processImage = async (
  input: Buffer
): Promise<ProcessedImage> => {
  try {
    const image = sharp(input);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      throw new BadRequestError('Invalid image file');
    }

    // Resize only if larger than max dimensions
    const needsResize =
      metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT;

    let pipeline = image.rotate(); // auto-rotate based on EXIF

    if (needsResize) {
      pipeline = pipeline.resize(MAX_WIDTH, MAX_HEIGHT, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    const output = await pipeline
      .webp({ quality: QUALITY, effort: 4 })
      .toBuffer({ resolveWithObject: true });

    return {
      buffer: output.data,
      format: 'webp',
      width: output.info.width,
      height: output.info.height,
      size: output.info.size,
    };
  } catch (error) {
    if (error instanceof BadRequestError) throw error;
    throw new BadRequestError('Failed to process image');
  }
};

/**
 * Generate a thumbnail (for admin list views).
 */
export const generateThumbnail = async (
  input: Buffer,
  size = 400
): Promise<Buffer> => {
  return sharp(input)
    .rotate()
    .resize(size, size, { fit: 'cover' })
    .webp({ quality: 75 })
    .toBuffer();
};
