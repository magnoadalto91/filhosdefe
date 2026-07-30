import { Router } from 'express';
import prisma from '../lib/prisma.js'
import { authenticate, requireAdmin } from '../middleware/auth.js';
import uploadMiddleware from '../middleware/upload.js';
import { uploadToCloudinary } from '../lib/uploadToCloudinary.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    return res.json(await prisma.banho.findMany({ orderBy: { nome: 'asc' } }));
  } catch (err) { console.error(err); return res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
    const banho = await prisma.banho.findUnique({ where: { id } });
    if (!banho) return res.status(404).json({ error: 'Banho not found' });
    return res.json(banho);
  } catch (err) { console.error(err); return res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/', authenticate, requireAdmin, uploadMiddleware, async (req, res) => {
  try {
    const { nome, descricao, ingredientes } = req.body;
    if (!nome) return res.status(400).json({ error: 'nome is required' });
    let fotoUrl = null;
    if (req.file) fotoUrl = await uploadToCloudinary(req.file.buffer, 'filhosdefe/banhos');
    const banho = await prisma.banho.create({
      data: { nome, descricao: descricao || '', ingredientes: ingredientes || null, fotoUrl },
    });
    return res.status(201).json(banho);
  } catch (err) { console.error(err); return res.status(500).json({ error: 'Internal server error' }); }
});

router.put('/:id', authenticate, requireAdmin, uploadMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
    const existing = await prisma.banho.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Banho not found' });
    const { nome, descricao, ingredientes } = req.body;
    const data = {};
    if (nome !== undefined) data.nome = nome;
    if (descricao !== undefined) data.descricao = descricao;
    if (ingredientes !== undefined) data.ingredientes = ingredientes || null;
    if (req.file) data.fotoUrl = await uploadToCloudinary(req.file.buffer, 'filhosdefe/banhos');
    return res.json(await prisma.banho.update({ where: { id }, data }));
  } catch (err) { console.error(err); return res.status(500).json({ error: 'Internal server error' }); }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
    if (!await prisma.banho.findUnique({ where: { id } })) return res.status(404).json({ error: 'Banho not found' });
    await prisma.banho.delete({ where: { id } });
    return res.json({ message: 'Banho deleted successfully' });
  } catch (err) { console.error(err); return res.status(500).json({ error: 'Internal server error' }); }
});

export default router;
