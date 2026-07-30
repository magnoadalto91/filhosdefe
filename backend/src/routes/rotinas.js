import { Router } from 'express';
import prisma from '../lib/prisma.js'
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// GET /api/rotinas
router.get('/', async (_req, res) => {
  try {
    const rotinas = await prisma.rotina.findMany({ orderBy: { createdAt: 'asc' } });
    return res.json(rotinas);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/rotinas/:id
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const rotina = await prisma.rotina.findUnique({ where: { id } });
    if (!rotina) return res.status(404).json({ error: 'Rotina not found' });

    return res.json(rotina);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/rotinas - admin only
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { titulo, descricao, ordem } = req.body;

    if (!titulo) {
      return res.status(400).json({ error: 'titulo is required' });
    }

    const rotina = await prisma.rotina.create({
      data: { titulo, descricao: descricao || '', ordem: 0 },
    });

    return res.status(201).json(rotina);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/rotinas/:id - admin only
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const existing = await prisma.rotina.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Rotina not found' });

    const { titulo, descricao, ordem } = req.body;
    const data = {};

    if (titulo !== undefined) data.titulo = titulo;
    if (descricao !== undefined) data.descricao = descricao;
    if (ordem !== undefined) data.ordem = parseInt(ordem);

    const rotina = await prisma.rotina.update({ where: { id }, data });
    return res.json(rotina);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/rotinas/:id - admin only
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const existing = await prisma.rotina.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Rotina not found' });

    await prisma.rotina.delete({ where: { id } });
    return res.json({ message: 'Rotina deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
