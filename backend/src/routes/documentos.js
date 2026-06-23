import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import uploadDocMiddleware from '../middleware/uploadDoc.js'
import { uploadDocToCloudinary } from '../lib/uploadToCloudinary.js'
import { sendPushToAll, isEnabled } from '../lib/sendPush.js'

const router = Router()
const prisma  = new PrismaClient()

// GET / — requer auth; retorna lista com abertura + conclusão do usuário
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id
    const list = await prisma.documento.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { leituras: true } },
        leituras: { where: { userId }, select: { aberturaEm: true, concluidoEm: true } },
      },
    })
    return res.json(list.map(({ leituras, _count, ...d }) => ({
      ...d,
      totalAberturas: _count.leituras,
      totalConclusoes: 0, // calculado no endpoint de leituras; não necessário aqui
      aberto: leituras.length > 0,
      concluido: leituras[0]?.concluidoEm != null,
    })))
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

// POST /:id/leitura — registra abertura
router.post('/:id/leitura', authenticate, async (req, res) => {
  try {
    const documentoId = Number(req.params.id)
    if (isNaN(documentoId)) return res.status(400).json({ error: 'ID inválido' })
    const userId = req.user.id
    await prisma.leituraDocumento.upsert({
      where: { userId_documentoId: { userId, documentoId } },
      create: { userId, documentoId },
      update: {},
    })
    return res.json({ ok: true })
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

// POST /:id/conclusao — registra que o usuário chegou à última página
router.post('/:id/conclusao', authenticate, async (req, res) => {
  try {
    const documentoId = Number(req.params.id)
    if (isNaN(documentoId)) return res.status(400).json({ error: 'ID inválido' })
    const userId = req.user.id
    await prisma.leituraDocumento.upsert({
      where: { userId_documentoId: { userId, documentoId } },
      create: { userId, documentoId, concluidoEm: new Date() },
      update: { concluidoEm: new Date() },
    })
    return res.json({ ok: true })
  } catch (err) { return res.status(500).json({ error: err.message }) }
})

// GET /:id/leituras — admin: lista com dois status por usuário
router.get('/:id/leituras', authenticate, requireAdmin, async (req, res) => {
  try {
    const documentoId = Number(req.params.id)
    if (isNaN(documentoId)) return res.status(400).json({ error: 'ID inválido' })
    const leituras = await prisma.leituraDocumento.findMany({
      where: { documentoId },
      include: { user: { select: { id: true, nome: true, email: true } } },
      orderBy: { aberturaEm: 'desc' },
    })
    return res.json(leituras)
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

// GET /:id/download — somente admin
router.get('/:id/download', authenticate, requireAdmin, async (req, res) => {
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
