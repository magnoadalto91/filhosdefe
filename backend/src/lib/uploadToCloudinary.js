import sharp from 'sharp';
import cloudinary from './cloudinary.js';

async function toWebp(buffer) {
  return sharp(buffer)
    .webp({ quality: 82 })
    .toBuffer();
}

export async function uploadToCloudinary(buffer, folder = 'filhosdefe') {
  const webpBuffer = await toWebp(buffer);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', format: 'webp' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(webpBuffer);
  });
}

export async function uploadDocToCloudinary(buffer, originalname, folder = 'filhosdefe/documentos') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'raw', use_filename: true, unique_filename: true, original_filename: originalname },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}
