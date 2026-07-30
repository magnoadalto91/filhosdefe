import { Router } from 'express'
import prisma from '../lib/prisma.js'
import bcrypt from 'bcryptjs'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

// GET / — listar todos os usuários (admin)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, nome: true, role: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    })
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST / — criar usuário (admin)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { email, password, nome, role = 'USER' } = req.body
  if (!email || !password) return res.status(400).json({ error: 'email e password são obrigatórios.' })
  if (password.length < 6) return res.status(400).json({ error: 'Senha deve ter ao menos 6 caracteres.' })
  if (!['ADMIN', 'USER'].includes(role)) return res.status(400).json({ error: 'Role inválida.' })
  try {
    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, password: hashed, nome: nome?.trim() || null, role },
      select: { id: true, email: true, nome: true, role: true, createdAt: true },
    })
    res.status(201).json(user)
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'E-mail já cadastrado.' })
    res.status(500).json({ error: err.message })
  }
})

// PUT /:id — editar usuário (admin)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const { id } = req.params
  const { nome, email, password, role } = req.body

  if (role && !['ADMIN', 'USER'].includes(role)) {
    return res.status(400).json({ error: 'Role inválida.' })
  }
  if (password && password.length < 6) {
    return res.status(400).json({ error: 'Senha deve ter ao menos 6 caracteres.' })
  }

  try {
    const data = {}
    if (nome  !== undefined) data.nome  = nome?.trim() || null
    if (email !== undefined) data.email = email
    if (role  !== undefined) data.role  = role
    if (password)            data.password = await bcrypt.hash(password, 10)

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data,
      select: { id: true, email: true, nome: true, role: true, createdAt: true },
    })
    res.json(user)
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'E-mail já cadastrado.' })
    res.status(404).json({ error: 'Usuário não encontrado.' })
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
