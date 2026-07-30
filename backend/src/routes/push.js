import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// GET /api/push/vapid-public-key  (sem auth — necessário antes de logar)
router.get('/vapid-public-key', (_req, res) => {
  res.json({ key: process.env.VAPID_PUBLIC_KEY })
})

// POST /api/push/subscribe
router.post('/subscribe', authenticate, async (req, res) => {
  const { endpoint, keys } = req.body
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ error: 'Dados de subscription inválidos.' })
  }
  try {
    await prisma.pushSubscription.upsert({
      where:  { endpoint },
      create: { userId: req.user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth },
      update: { userId: req.user.id, p256dh: keys.p256dh, auth: keys.auth },
    })
    return res.status(201).json({ ok: true })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// POST /api/push/permissao — salva o estado de Notification.permission do cliente
router.post('/permissao', authenticate, async (req, res) => {
  const { permissao } = req.body
  if (!['granted', 'denied', 'default'].includes(permissao)) {
    return res.status(400).json({ error: 'Valor inválido.' })
  }
  try {
    await prisma.user.update({ where: { id: req.user.id }, data: { pushPermissao: permissao } })
    return res.json({ ok: true })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// DELETE /api/push/unsubscribe
router.delete('/unsubscribe', authenticate, async (req, res) => {
  const { endpoint } = req.body
  if (!endpoint) return res.status(400).json({ error: 'endpoint obrigatório.' })
  try {
    await prisma.pushSubscription.deleteMany({ where: { endpoint, userId: req.user.id } })
    return res.json({ ok: true })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

export default router
