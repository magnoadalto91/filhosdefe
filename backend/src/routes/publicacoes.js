import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import uploadMiddleware from '../middleware/upload.js'
import { uploadToCloudinary } from '../lib/uploadToCloudinary.js'
import { sendPushToAll, isEnabled } from '../lib/sendPush.js'

const router = Router()
const prisma  = new PrismaClient()

// GET / — públicas
router.get('/', async (_req, res) => {
  try {
    const list = await prisma.publicacao.findMany({
      where: { publicado: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, titulo: true, capaUrl: true, createdAt: true },
    })
    return res.json(list)
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

// GET /all — admin (inclui não publicadas)
router.get('/all', authenticate, requireAdmin, async (_req, res) => {
  try {
    const list = await prisma.publicacao.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, titulo: true, capaUrl: true, publicado: true, createdAt: true },
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
router.post('/', authenticate, requireAdmin, uploadMiddleware, async (req, res) => {
  try {
    const { titulo, conteudo, publicado } = req.body
    if (!titulo?.trim()) return res.status(400).json({ error: 'Título é obrigatório.' })

    let capaUrl = null
    if (req.file) capaUrl = await uploadToCloudinary(req.file.buffer, 'filhosdefe/publicacoes')

    const item = await prisma.publicacao.create({
      data: { titulo: titulo.trim(), conteudo: conteudo || '', capaUrl, publicado: publicado !== 'false' },
    })

    if (await isEnabled('novaPublicacao')) {
      sendPushToAll('Nova publicação nos Estudos', `"${item.titulo}" foi publicada. Confira!`, { url: '/estudos' }).catch(() => {})
    }

    return res.status(201).json(item)
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

// PUT /:id — admin
router.put('/:id', authenticate, requireAdmin, uploadMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' })
    const existing = await prisma.publicacao.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ error: 'Publicação não encontrada.' })

    const { titulo, conteudo, publicado, removeCapa } = req.body
    const data = {}
    if (titulo    !== undefined) data.titulo    = titulo.trim()
    if (conteudo  !== undefined) data.conteudo  = conteudo
    if (publicado !== undefined) data.publicado = publicado !== 'false' && publicado !== false

    if (req.file) data.capaUrl = await uploadToCloudinary(req.file.buffer, 'filhosdefe/publicacoes')
    else if (removeCapa === 'true') data.capaUrl = null

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
    await prisma.publicacao.delete({ where: { id } })
    return res.status(204).end()
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
