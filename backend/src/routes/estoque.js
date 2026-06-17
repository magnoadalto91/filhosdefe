import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import uploadMiddleware from '../middleware/upload.js'
import { uploadToCloudinary } from '../lib/uploadToCloudinary.js'

const router = Router()
const prisma = new PrismaClient()

// GET /api/estoque
router.get('/', authenticate, requireAdmin, async (_req, res) => {
  try {
    const items = await prisma.estoqueItem.findMany({ orderBy: { nome: 'asc' } })
    return res.json(items)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// POST /api/estoque
router.post('/', authenticate, requireAdmin, uploadMiddleware, async (req, res) => {
  try {
    const { nome, quantidade } = req.body
    if (!nome) return res.status(400).json({ error: 'nome obrigatório' })
    let fotoUrl = null
    if (req.file) {
      fotoUrl = await uploadToCloudinary(req.file.buffer, 'filhosdefe/estoque')
    }
    const item = await prisma.estoqueItem.create({
      data: { nome, quantidade: parseInt(quantidade) || 0, fotoUrl },
    })
    return res.status(201).json(item)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// PUT /api/estoque/:id
router.put('/:id', authenticate, requireAdmin, uploadMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' })
    const { nome, quantidade } = req.body
    const data = {}
    if (nome !== undefined) data.nome = nome
    if (quantidade !== undefined) data.quantidade = parseInt(quantidade) || 0
    if (req.file) {
      data.fotoUrl = await uploadToCloudinary(req.file.buffer, 'filhosdefe/estoque')
    }
    const item = await prisma.estoqueItem.update({ where: { id }, data })
    return res.json(item)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// PATCH /api/estoque/:id/lista — move para/de lista de compras
router.patch('/:id/lista', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' })
    const { precisaRepor } = req.body
    const item = await prisma.estoqueItem.update({
      where: { id },
      data: { precisaRepor: !!precisaRepor },
    })
    return res.json(item)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// DELETE /api/estoque/:id
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' })
    await prisma.estoqueItem.delete({ where: { id } })
    return res.json({ ok: true })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

export default router
