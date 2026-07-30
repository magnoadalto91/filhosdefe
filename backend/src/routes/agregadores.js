import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

// GET / — listar (todos autenticados)
router.get('/', authenticate, async (_req, res) => {
  try {
    const list = await prisma.agregador.findMany({
      orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
      include: { _count: { select: { musicas: true } } },
    })
    res.json(list)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST / — criar (admin)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { nome, ordem = 0 } = req.body
  if (!nome?.trim()) return res.status(400).json({ error: 'Nome é obrigatório.' })
  try {
    const item = await prisma.agregador.create({
      data: { nome: nome.trim(), ordem: Number(ordem) },
    })
    res.status(201).json(item)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /:id — editar (admin)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const id = Number(req.params.id)
  const { nome, ordem } = req.body
  if (!nome?.trim()) return res.status(400).json({ error: 'Nome é obrigatório.' })
  try {
    const item = await prisma.agregador.update({
      where: { id },
      data: { nome: nome.trim(), ...(ordem !== undefined && { ordem: Number(ordem) }) },
    })
    res.json(item)
  } catch {
    res.status(404).json({ error: 'Agregador não encontrado.' })
  }
})

// DELETE /:id — remover (admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  const id = Number(req.params.id)
  try {
    await prisma.agregador.delete({ where: { id } })
    res.status(204).end()
  } catch {
    res.status(404).json({ error: 'Agregador não encontrado.' })
  }
})

export default router
