import multer from 'multer'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter(_req, file, cb) {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Tipo de arquivo não permitido. Envie apenas PDF ou imagem.'), false)
    }
  },
})

export default upload.single('file')
