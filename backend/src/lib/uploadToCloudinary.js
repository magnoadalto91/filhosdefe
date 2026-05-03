import cloudinary from './cloudinary.js';

/**
 * Uploads a buffer to Cloudinary and returns the secure URL.
 * @param {Buffer} buffer - The file buffer from multer memoryStorage.
 * @param {string} folder - The Cloudinary folder to upload into.
 * @returns {Promise<string>} The secure URL of the uploaded image.
 */
export function uploadToCloudinary(buffer, folder = 'filhosdefe') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}
