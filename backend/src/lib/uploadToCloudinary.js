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
