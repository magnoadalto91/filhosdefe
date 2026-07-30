import { Router } from 'express';
import prisma from '../lib/prisma.js'
import { authenticate, requireAdmin } from '../middleware/auth.js';
import uploadMiddleware from '../middleware/upload.js';
import { uploadToCloudinary } from '../lib/uploadToCloudinary.js';
import { sendPushToAll, isEnabled } from '../lib/sendPush.js';

const router = Router();

// GET /api/ervas
router.get('/', async (_req, res) => {
  try {
    const ervas = await prisma.erva.findMany({ orderBy: { nome: 'asc' } });
    return res.json(ervas);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/ervas/quintal
router.get('/quintal', async (_req, res) => {
  try {
    const ervas = await prisma.erva.findMany({
      where: { noQuintal: true },
      orderBy: { nome: 'asc' },
    });
    return res.json(ervas);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/ervas/:id
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const erva = await prisma.erva.findUnique({ where: { id } });
    if (!erva) return res.status(404).json({ error: 'Erva not found' });

    return res.json(erva);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/ervas - admin only
router.post('/', authenticate, requireAdmin, uploadMiddleware, async (req, res) => {
  try {
    const { nome, descricao, usos, noQuintal, emEstoque, emFalta } = req.body;

    if (!nome) {
      return res.status(400).json({ error: 'nome is required' });
    }

    let fotoUrl = null;
    if (req.file) {
      fotoUrl = await uploadToCloudinary(req.file.buffer, 'filhosdefe/ervas');
    }

    const erva = await prisma.erva.create({
      data: {
        nome,
        descricao: descricao || '',
        usos: usos || '',
        fotoUrl,
        noQuintal: noQuintal === 'true' || noQuintal === true,
        emEstoque: emEstoque === 'true' || emEstoque === true,
        emFalta: emFalta === 'true' || emFalta === true,
      },
    });

    if (await isEnabled('novaErva')) {
      sendPushToAll('🌿 Nova Erva Sagrada', `"${erva.nome}" foi adicionada. Confira!`, { url: '/aprenda?tab=ervas' }).catch(() => {})
    }
    return res.status(201).json(erva);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/ervas/:id - admin only
router.put('/:id', authenticate, requireAdmin, uploadMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const existing = await prisma.erva.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Erva not found' });

    const { nome, descricao, usos, noQuintal, emEstoque, emFalta } = req.body;
    const data = {};

    if (nome !== undefined) data.nome = nome;
    if (descricao !== undefined) data.descricao = descricao;
    if (usos !== undefined) data.usos = usos;
    if (noQuintal !== undefined) data.noQuintal = noQuintal === 'true' || noQuintal === true;
    if (emEstoque !== undefined) data.emEstoque = emEstoque === 'true' || emEstoque === true;
    if (emFalta !== undefined) data.emFalta = emFalta === 'true' || emFalta === true;

    if (req.file) {
      data.fotoUrl = await uploadToCloudinary(req.file.buffer, 'filhosdefe/ervas');
    }

    const erva = await prisma.erva.update({ where: { id }, data });
    return res.json(erva);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/ervas/:id - admin only
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const existing = await prisma.erva.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Erva not found' });

    await prisma.erva.delete({ where: { id } });
    return res.json({ message: 'Erva deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
