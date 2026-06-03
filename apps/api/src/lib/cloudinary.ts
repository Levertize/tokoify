import { v2 as cloudinary } from 'cloudinary';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';

const isConfigured = !!(
  env.CLOUDINARY_CLOUD_NAME &&
  env.CLOUDINARY_API_KEY &&
  env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
  logger.info('✅ Cloudinary: Berhasil dikonfigurasi');
} else {
  logger.warn('⚠️ Cloudinary: Kredensial tidak lengkap di .env. Mengaktifkan Mode MOCK/Fallback.');
}

export const uploadToCloudinary = async (
  buffer: Buffer,
  folder: string,
  publicId?: string
): Promise<{ url: string; publicId: string }> => {
  if (isConfigured) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: 'image',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      ).end(buffer);
    });
  }

  // Fallback / Mock Mode:
  const mockId = publicId || `mock_img_${Math.random().toString(36).substring(7)}`;
  // Use a high-quality mockup from Unsplash/Picsum
  const randomSeed = Math.floor(Math.random() * 1000);
  const mockUrl = `https://picsum.photos/seed/${randomSeed}/800/800`;
  logger.info(`📸 Cloudinary (MOCK): File di-upload ke folder '${folder}' dengan ID '${mockId}'. URL: ${mockUrl}`);
  return {
    url: mockUrl,
    publicId: `${folder}/${mockId}`,
  };
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  if (isConfigured) {
    await cloudinary.uploader.destroy(publicId);
    return;
  }
  logger.info(`🗑️ Cloudinary (MOCK): File dengan ID '${publicId}' dihapus`);
};

export default cloudinary;
