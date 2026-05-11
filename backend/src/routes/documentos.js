import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import uploadDocMiddleware from '../middleware/uploadDoc.js'
import { uploadDocToCloudinary } from '../lib/uploadToCloudinary.js'
import { sendPushToAll, isEnabled } from '../lib/sendPush.js'

const router = Router()
const prisma  = new PrismaClient()

// GET / — público
router.get('/', async (_req, res) => {
  try {
    const list = await prisma.documento.findMany({ orderBy: { createdAt: 'desc' } })
    return res.json(list)
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

// POST / — admin
router.post('/', authenticate, requireAdmin, uploadDocMiddleware, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Arquivo é obrigatório.' })
    const { nome, descricao } = req.body
    if (!nome?.trim()) return res.status(400).json({ error: 'Nome é obrigatório.' })

    const fileUrl  = await uploadDocToCloudinary(req.file.buffer, req.file.originalname)
    const ext      = req.file.originalname.split('.').pop().toLowerCase()
    const tamanho  = req.file.size

    const item = await prisma.documento.create({
      data: { nome: nome.trim(), descricao: descricao?.trim() || null, fileUrl, fileType: ext, tamanho },
    })

    if (await isEnabled('novoDocumento')) {
      sendPushToAll('Novo documento disponível', `"${item.nome}" foi adicionado nos Estudos. Confira!`, { url: '/estudos' }).catch(() => {})
    }

    return res.status(201).json(item)
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

// GET /:id/download — proxy com nome correto
router.get('/:id/download', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' })
    const doc = await prisma.documento.findUnique({ where: { id } })
    if (!doc) return res.status(404).json({ error: 'Documento não encontrado.' })

    const filename = `${doc.nome}.${doc.fileType}`
    const upstream = await fetch(doc.fileUrl)
    if (!upstream.ok) return res.status(502).json({ error: 'Erro ao buscar arquivo.' })

    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`)
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/octet-stream')

    const { Readable } = await import('stream')
    Readable.fromWeb(upstream.body).pipe(res)
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

// DELETE /:id — admin
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' })
    const existing = await prisma.documento.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ error: 'Documento não encontrado.' })
    await prisma.documento.delete({ where: { id } })
    return res.status(204).end()
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

export default router
