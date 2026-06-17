import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import uploadMiddleware from '../middleware/upload.js';
import { uploadToCloudinary } from '../lib/uploadToCloudinary.js';
import { sendPushToAll, isEnabled } from '../lib/sendPush.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/bebidas
router.get('/', async (_req, res) => {
  try {
    const bebidas = await prisma.bebida.findMany({ orderBy: { nome: 'asc' } });
    return res.json(bebidas);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/bebidas/:id
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const bebida = await prisma.bebida.findUnique({ where: { id } });
    if (!bebida) return res.status(404).json({ error: 'Bebida not found' });

    return res.json(bebida);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/bebidas - admin only
router.post('/', authenticate, requireAdmin, uploadMiddleware, async (req, res) => {
  try {
    const { nome, descricao, ingredientes, preparo } = req.body;

    if (!nome) return res.status(400).json({ error: 'nome is required' });

    let fotoUrl = null;
    if (req.file) {
      fotoUrl = await uploadToCloudinary(req.file.buffer, 'filhosdefe/bebidas');
    }

    const bebida = await prisma.bebida.create({
      data: {
        nome,
        descricao: descricao || '',
        ingredientes: ingredientes || '',
        preparo: preparo || null,
        fotoUrl,
      },
    });

    if (await isEnabled('novaBebida')) {
      sendPushToAll('Nova Bebida Sagrada', `"${bebida.nome}" foi adicionada. Confira!`, { url: '/aprenda?tab=ervas' }).catch(() => {})
    }
    return res.status(201).json(bebida);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/bebidas/:id - admin only
router.put('/:id', authenticate, requireAdmin, uploadMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const existing = await prisma.bebida.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Bebida not found' });

    const { nome, descricao, ingredientes, preparo } = req.body;
    const data = {};

    if (nome !== undefined) data.nome = nome;
    if (descricao !== undefined) data.descricao = descricao;
    if (ingredientes !== undefined) data.ingredientes = ingredientes;
    if (preparo !== undefined) data.preparo = preparo || null;

    if (req.file) {
      data.fotoUrl = await uploadToCloudinary(req.file.buffer, 'filhosdefe/bebidas');
    }

    const bebida = await prisma.bebida.update({ where: { id }, data });
    return res.json(bebida);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/bebidas/:id - admin only
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const existing = await prisma.bebida.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Bebida not found' });

    await prisma.bebida.delete({ where: { id } });
    return res.json({ message: 'Bebida deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
