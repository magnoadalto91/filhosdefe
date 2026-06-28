import sharp from 'sharp';
import cloudinary from './cloudinary.js';

async function toWebp(buffer) {
  return sharp(buffer)
    .rotate()
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
  // Normaliza o nome: remove acentos, substitui espaços e chars especiais
  const safeName = (originalname || 'arquivo')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
  // Separa base e extensão para inserir timestamp antes da extensão
  const dotIdx = safeName.lastIndexOf('.')
  const base = dotIdx > 0 ? safeName.slice(0, dotIdx) : safeName
  const ext  = dotIdx > 0 ? safeName.slice(dotIdx)    : ''
  // Sem extensão no public_id: incluir .pdf/ext faz o CDN do Cloudinary
  // interpretar como formato e retornar ERR_INVALID_RESPONSE
  const publicId = `${folder}/${base}_${Date.now()}`

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { public_id: publicId, resource_type: 'raw', overwrite: false },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}
