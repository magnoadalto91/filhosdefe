import multer from 'multer'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter(_req, file, cb) {
    if (file.fieldname === 'foto') {
      if (file.mimetype.startsWith('image/')) cb(null, true)
      else cb(new Error('Capa deve ser uma imagem.'), false)
    } else if (file.fieldname === 'arquivo') {
      if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) cb(null, true)
      else cb(new Error('Tipo de arquivo não permitido. Envie apenas PDF ou imagem.'), false)
    } else {
      cb(null, false)
    }
  },
})

export default upload.fields([{ name: 'foto', maxCount: 1 }, { name: 'arquivo', maxCount: 1 }])
