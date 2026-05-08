import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/musicas
router.get('/', async (_req, res) => {
  try {
    const musicas = await prisma.musica.findMany({
      orderBy: { titulo: 'asc' },
    });
    return res.json(musicas);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/musicas/:id
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const musica = await prisma.musica.findUnique({ where: { id } });
    if (!musica) return res.status(404).json({ error: 'Musica not found' });

    return res.json(musica);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/musicas - admin only
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { titulo, letra, youtubeUrl } = req.body;

    if (!titulo) {
      return res.status(400).json({ error: 'titulo is required' });
    }

    const musica = await prisma.musica.create({
      data: { titulo, letra: letra || '', youtubeUrl: youtubeUrl || null },
    });

    return res.status(201).json(musica);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/musicas/:id - admin only
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const { titulo, letra, youtubeUrl } = req.body;

    const existing = await prisma.musica.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Musica not found' });

    const musica = await prisma.musica.update({
      where: { id },
      data: {
        ...(titulo !== undefined && { titulo }),
        ...(letra !== undefined && { letra }),
        ...(youtubeUrl !== undefined && { youtubeUrl }),
      },
    });

    return res.json(musica);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/musicas/:id - admin only
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const existing = await prisma.musica.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Musica not found' });

    await prisma.musica.delete({ where: { id } });
    return res.json({ message: 'Musica deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
