import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

const DEFAULT_CONFIG = {
  novaEntidade:   true,
  novaErva:       true,
  novaMusica:     true,
  novaGira:       true,
  novaPublicacao: true,
  novoDocumento:  true,
  gira1Semana:    true,
  gira1Dia:       true,
  giraNoDia:      true,
  horaEnvio:      '08:00',
}

// GET /api/notificacoes/playlist  (público — retorna só a URL da playlist)
router.get('/playlist', async (_req, res) => {
  try {
    const cfg = await prisma.notificacaoConfig.findUnique({ where: { id: 1 } })
    return res.json({ playlistUrl: cfg?.playlistUrl || null })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// GET /api/notificacoes/config
router.get('/config', authenticate, requireAdmin, async (_req, res) => {
  try {
    let cfg = await prisma.notificacaoConfig.findUnique({ where: { id: 1 } })
    if (!cfg) {
      cfg = await prisma.notificacaoConfig.create({ data: { id: 1, ...DEFAULT_CONFIG } })
    }
    return res.json(cfg)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// PUT /api/notificacoes/config
router.put('/config', authenticate, requireAdmin, async (req, res) => {
  const fields = ['novaEntidade','novaErva','novaMusica','novaGira','novaPublicacao','novoDocumento','gira1Semana','gira1Dia','giraNoDia','horaEnvio','playlistUrl']
  const data = {}
  fields.forEach(f => { if (req.body[f] !== undefined) data[f] = req.body[f] })

  if (data.horaEnvio && !/^\d{2}:\d{2}$/.test(data.horaEnvio)) {
    return res.status(400).json({ error: 'horaEnvio deve estar no formato HH:MM.' })
  }

  try {
    const cfg = await prisma.notificacaoConfig.upsert({
      where:  { id: 1 },
      create: { id: 1, ...DEFAULT_CONFIG, ...data },
      update: data,
    })
    return res.json(cfg)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

export default router
