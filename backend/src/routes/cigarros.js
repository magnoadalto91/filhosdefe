import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import uploadMiddleware from '../middleware/upload.js';
import { uploadToCloudinary } from '../lib/uploadToCloudinary.js';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req, res) => {
  try {
    return res.json(await prisma.cigarro.findMany({ orderBy: { nome: 'asc' } }));
  } catch (err) { console.error(err); return res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
    const cigarro = await prisma.cigarro.findUnique({ where: { id } });
    if (!cigarro) return res.status(404).json({ error: 'Cigarro not found' });
    return res.json(cigarro);
  } catch (err) { console.error(err); return res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/', authenticate, requireAdmin, uploadMiddleware, async (req, res) => {
  try {
    const { nome, descricao, observacoes } = req.body;
    if (!nome) return res.status(400).json({ error: 'nome is required' });
    let fotoUrl = null;
    if (req.file) fotoUrl = await uploadToCloudinary(req.file.buffer, 'filhosdefe/cigarros');
    const cigarro = await prisma.cigarro.create({
      data: { nome, descricao: descricao || '', observacoes: observacoes || null, fotoUrl },
    });
    return res.status(201).json(cigarro);
  } catch (err) { console.error(err); return res.status(500).json({ error: 'Internal server error' }); }
});

router.put('/:id', authenticate, requireAdmin, uploadMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
    const existing = await prisma.cigarro.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Cigarro not found' });
    const { nome, descricao, observacoes } = req.body;
    const data = {};
    if (nome !== undefined) data.nome = nome;
    if (descricao !== undefined) data.descricao = descricao;
    if (observacoes !== undefined) data.observacoes = observacoes || null;
    if (req.file) data.fotoUrl = await uploadToCloudinary(req.file.buffer, 'filhosdefe/cigarros');
    return res.json(await prisma.cigarro.update({ where: { id }, data }));
  } catch (err) { console.error(err); return res.status(500).json({ error: 'Internal server error' }); }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
    if (!await prisma.cigarro.findUnique({ where: { id } })) return res.status(404).json({ error: 'Cigarro not found' });
    await prisma.cigarro.delete({ where: { id } });
    return res.json({ message: 'Cigarro deleted successfully' });
  } catch (err) { console.error(err); return res.status(500).json({ error: 'Internal server error' }); }
});

export default router;
