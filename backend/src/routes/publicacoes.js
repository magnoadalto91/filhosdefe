import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import uploadMiddleware from '../middleware/upload.js'
import uploadPubMiddleware from '../middleware/uploadPub.js'
import { uploadToCloudinary, uploadDocToCloudinary } from '../lib/uploadToCloudinary.js'
import { sendPushToAll, isEnabled } from '../lib/sendPush.js'
import cloudinary from '../lib/cloudinary.js'

const router = Router()

// Extrai o public_id de uma URL do Cloudinary para poder deletar o asset
function extractPublicId(url, isRaw = false) {
  if (!url) return null
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/)
    if (!match) return null
    let pubId = match[1]
    if (!isRaw) pubId = pubId.replace(/\.[^.]+$/, '') // imagens: remove extensão
    return pubId
  } catch { return null }
}

async function deleteCloudinaryAsset(url, isRaw = false) {
  const pubId = extractPublicId(url, isRaw)
  if (!pubId) return
  try {
    const result = await cloudinary.uploader.destroy(pubId, { resource_type: isRaw ? 'raw' : 'image' })
    console.log(`[cloudinary] delete ${isRaw ? 'raw' : 'image'} "${pubId}":`, result.result)
  } catch (e) {
    console.error(`[cloudinary] erro ao deletar "${pubId}":`, e.message)
  }
}

function ensureExtension(originalname, mimetype) {
  let nome = (originalname || 'arquivo').trim()
  if (!nome.includes('.')) {
    if (mimetype === 'application/pdf') nome += '.pdf'
    else if (mimetype.startsWith('image/')) nome += '.' + mimetype.split('/')[1]
  }
  return nome
}

async function handleArquivo(file) {
  if (!file) return null
  const nome = ensureExtension(file.originalname, file.mimetype)
  if (file.mimetype === 'application/pdf') {
    const url = await uploadDocToCloudinary(file.buffer, nome, 'filhosdefe/publicacoes')
    return { arquivoUrl: url, arquivoType: 'pdf', arquivoNome: nome, arquivoTamanho: file.size }
  }
  const url = await uploadToCloudinary(file.buffer, 'filhosdefe/publicacoes')
  return { arquivoUrl: url, arquivoType: file.mimetype.split('/')[1], arquivoNome: nome, arquivoTamanho: file.size }
}

// GET / — públicas
router.get('/', async (_req, res) => {
  try {
    const list = await prisma.publicacao.findMany({
      where: { publicado: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, titulo: true, conteudo: true, capaUrl: true, createdAt: true },
    })
    return res.json(list)
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

// GET /all — admin (inclui não publicadas)
router.get('/all', authenticate, requireAdmin, async (_req, res) => {
  try {
    const list = await prisma.publicacao.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, titulo: true, capaUrl: true, arquivoUrl: true, arquivoNome: true, publicado: true, createdAt: true },
    })
    return res.json(list)
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

// GET /:id — detalhe completo (público)
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' })
    const item = await prisma.publicacao.findUnique({ where: { id } })
    if (!item) return res.status(404).json({ error: 'Publicação não encontrada.' })
    return res.json(item)
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

// POST / — admin
router.post('/', authenticate, requireAdmin, uploadPubMiddleware, async (req, res) => {
  try {
    const { titulo, conteudo, publicado } = req.body
    if (!titulo?.trim()) return res.status(400).json({ error: 'Título é obrigatório.' })

    let capaUrl = null
    if (req.files?.foto?.[0]) capaUrl = await uploadToCloudinary(req.files.foto[0].buffer, 'filhosdefe/publicacoes')

    const arquivoData = await handleArquivo(req.files?.arquivo?.[0])

    const item = await prisma.publicacao.create({
      data: {
        titulo: titulo.trim(),
        conteudo: conteudo || '',
        capaUrl,
        publicado: publicado !== 'false',
        ...arquivoData,
      },
    })

    if (await isEnabled('novaPublicacao')) {
      sendPushToAll('Nova publicação nos Estudos', `"${item.titulo}" foi publicada. Confira!`, { url: '/estudos' }).catch(() => {})
    }

    return res.status(201).json(item)
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

// PUT /:id — admin
router.put('/:id', authenticate, requireAdmin, uploadPubMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' })
    const existing = await prisma.publicacao.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ error: 'Publicação não encontrada.' })

    const { titulo, conteudo, publicado, removeCapa, removeArquivo } = req.body
    const data = {}
    if (titulo    !== undefined) data.titulo    = titulo.trim()
    if (conteudo  !== undefined) data.conteudo  = conteudo
    if (publicado !== undefined) data.publicado = publicado !== 'false' && publicado !== false

    if (req.files?.foto?.[0]) {
      if (existing.capaUrl) deleteCloudinaryAsset(existing.capaUrl, false)
      data.capaUrl = await uploadToCloudinary(req.files.foto[0].buffer, 'filhosdefe/publicacoes')
    } else if (removeCapa === 'true') {
      if (existing.capaUrl) deleteCloudinaryAsset(existing.capaUrl, false)
      data.capaUrl = null
    }

    if (req.files?.arquivo?.[0]) {
      if (existing.arquivoUrl) deleteCloudinaryAsset(existing.arquivoUrl, existing.arquivoType === 'pdf')
      const arquivoData = await handleArquivo(req.files.arquivo[0])
      Object.assign(data, arquivoData)
    } else if (removeArquivo === 'true') {
      if (existing.arquivoUrl) deleteCloudinaryAsset(existing.arquivoUrl, existing.arquivoType === 'pdf')
      data.arquivoUrl = null
      data.arquivoType = null
      data.arquivoNome = null
      data.arquivoTamanho = null
    }

    const item = await prisma.publicacao.update({ where: { id }, data })

    if (await isEnabled('novaPublicacao')) {
      sendPushToAll('Publicação atualizada nos Estudos', `"${item.titulo}" foi atualizada. Confira!`, { url: '/estudos' }).catch(() => {})
    }

    return res.json(item)
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

// DELETE /:id — admin
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' })
    const existing = await prisma.publicacao.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ error: 'Publicação não encontrada.' })

    if (existing.capaUrl) deleteCloudinaryAsset(existing.capaUrl, false)
    if (existing.arquivoUrl) deleteCloudinaryAsset(existing.arquivoUrl, existing.arquivoType === 'pdf')

    await prisma.publicacao.delete({ where: { id } })
    return res.status(204).end()
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

// GET /:id/arquivo — proxy de download com Content-Disposition correto
// Resolve CORS e naming no WebView da PWA sem depender de fl_attachment
router.get('/:id/arquivo', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' })
    const item = await prisma.publicacao.findUnique({
      where: { id },
      select: { arquivoUrl: true, arquivoNome: true, arquivoType: true },
    })
    if (!item?.arquivoUrl) return res.status(404).json({ error: 'Arquivo não encontrado.' })

    const upstream = await fetch(item.arquivoUrl)
    if (!upstream.ok) return res.status(502).json({ error: 'Erro ao buscar arquivo no Cloudinary.' })

    const contentType = item.arquivoType === 'pdf'
      ? 'application/pdf'
      : (upstream.headers.get('content-type') || 'application/octet-stream')

    const filename = encodeURIComponent(item.arquivoNome || 'arquivo')
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${filename}`)
    res.setHeader('Cache-Control', 'no-store')

    const buf = await upstream.arrayBuffer()
    return res.end(Buffer.from(buf))
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

// POST /image — upload de imagem para inserir no editor
router.post('/image', authenticate, requireAdmin, uploadMiddleware, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada.' })
    const url = await uploadToCloudinary(req.file.buffer, 'filhosdefe/publicacoes')
    return res.json({ url })
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

export default router
