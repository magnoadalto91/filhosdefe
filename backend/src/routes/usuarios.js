import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

// GET / — listar todos os usuários (admin)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    })
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /:id/role — alterar role (admin)
router.patch('/:id/role', authenticate, requireAdmin, async (req, res) => {
  const { id } = req.params
  const { role } = req.body

  if (!['ADMIN', 'USER'].includes(role)) {
    return res.status(400).json({ error: 'Role inválida. Use ADMIN ou USER.' })
  }

  // impede que o próprio admin rebaixe a si mesmo
  if (Number(id) === req.user.id) {
    return res.status(400).json({ error: 'Você não pode alterar a sua própria role.' })
  }

  try {
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { role },
      select: { id: true, email: true, role: true },
    })
    res.json(user)
  } catch {
    res.status(404).json({ error: 'Usuário não encontrado.' })
  }
})

// DELETE /:id — remover usuário (admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  const { id } = req.params

  if (Number(id) === req.user.id) {
    return res.status(400).json({ error: 'Você não pode excluir sua própria conta.' })
  }

  try {
    await prisma.user.delete({ where: { id: Number(id) } })
    res.status(204).end()
  } catch {
    res.status(404).json({ error: 'Usuário não encontrado.' })
  }
})

export default router
