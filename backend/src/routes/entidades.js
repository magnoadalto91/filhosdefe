import { Router } from 'express';
import prisma from '../lib/prisma.js'
import { authenticate, requireAdmin } from '../middleware/auth.js';
import uploadMiddleware from '../middleware/upload.js';
import { uploadToCloudinary } from '../lib/uploadToCloudinary.js';
import { sendPushToAll, isEnabled } from '../lib/sendPush.js';

const router = Router();

// GET /api/entidades
router.get('/', async (_req, res) => {
  try {
    const entidades = await prisma.entidade.findMany({ orderBy: { nome: 'asc' } });
    return res.json(entidades);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/entidades/:id - with musicas and ervas
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const entidade = await prisma.entidade.findUnique({
      where: { id },
      include: {
        musicas: { include: { musica: true } },
        ervas: { include: { erva: true } },
      },
    });

    if (!entidade) return res.status(404).json({ error: 'Entidade not found' });

    return res.json(entidade);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/entidades - admin only
router.post('/', authenticate, requireAdmin, uploadMiddleware, async (req, res) => {
  try {
    const { nome, historia, saudacao, coresVelas, diaSemana, oferendas, trono, par, elementoTrabalho } = req.body;

    if (!nome) {
      return res.status(400).json({ error: 'nome is required' });
    }

    let fotoUrl = null;
    if (req.file) {
      fotoUrl = await uploadToCloudinary(req.file.buffer, 'filhosdefe/entidades');
    }

    const entidade = await prisma.entidade.create({
      data: { nome, historia: historia || '', saudacao: saudacao || '', coresVelas: coresVelas || '', diaSemana: diaSemana || null, oferendas: oferendas || null, trono: trono || null, par: par || null, elementoTrabalho: elementoTrabalho || null, fotoUrl },
    });

    if (await isEnabled('novaEntidade')) {
      sendPushToAll('✨ Novo Orixá / Entidade', `"${entidade.nome}" foi adicionado(a). Confira!`, { url: '/aprenda?tab=entidades' }).catch(() => {})
    }
    return res.status(201).json(entidade);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/entidades/:id - admin only
router.put('/:id', authenticate, requireAdmin, uploadMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const existing = await prisma.entidade.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Entidade not found' });

    const { nome, historia, saudacao, coresVelas, diaSemana, oferendas, trono, par, elementoTrabalho } = req.body;
    const data = {};

    if (nome             !== undefined) data.nome             = nome;
    if (historia         !== undefined) data.historia         = historia;
    if (saudacao         !== undefined) data.saudacao         = saudacao;
    if (coresVelas       !== undefined) data.coresVelas       = coresVelas;
    if (diaSemana        !== undefined) data.diaSemana        = diaSemana || null;
    if (oferendas        !== undefined) data.oferendas        = oferendas || null;
    if (trono            !== undefined) data.trono            = trono || null;
    if (par              !== undefined) data.par              = par || null;
    if (elementoTrabalho !== undefined) data.elementoTrabalho = elementoTrabalho || null;

    if (req.file) {
      data.fotoUrl = await uploadToCloudinary(req.file.buffer, 'filhosdefe/entidades');
    }

    const entidade = await prisma.entidade.update({ where: { id }, data });
    return res.json(entidade);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/entidades/:id - admin only
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const existing = await prisma.entidade.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Entidade not found' });

    await prisma.entidade.delete({ where: { id } });
    return res.json({ message: 'Entidade deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/entidades/:id/musicas - associate musica(s)
router.post('/:id/musicas', authenticate, requireAdmin, async (req, res) => {
  try {
    const entidadeId = parseInt(req.params.id);
    if (isNaN(entidadeId)) return res.status(400).json({ error: 'Invalid ID' });

    const entidade = await prisma.entidade.findUnique({ where: { id: entidadeId } });
    if (!entidade) return res.status(404).json({ error: 'Entidade not found' });

    const { musicaIds } = req.body;
    if (!musicaIds || !Array.isArray(musicaIds) || musicaIds.length === 0) {
      return res.status(400).json({ error: 'musicaIds array is required' });
    }

    const records = musicaIds.map((musicaId) => ({ entidadeId, musicaId: parseInt(musicaId) }));
    await prisma.entidadeMusica.createMany({ data: records, skipDuplicates: true });

    const updated = await prisma.entidade.findUnique({
      where: { id: entidadeId },
      include: { musicas: { include: { musica: true } } },
    });

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/entidades/:id/musicas/:musicaId - remove association
router.delete('/:id/musicas/:musicaId', authenticate, requireAdmin, async (req, res) => {
  try {
    const entidadeId = parseInt(req.params.id);
    const musicaId = parseInt(req.params.musicaId);

    if (isNaN(entidadeId) || isNaN(musicaId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    await prisma.entidadeMusica.delete({
      where: { entidadeId_musicaId: { entidadeId, musicaId } },
    });

    return res.json({ message: 'Musica removed from entidade' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Association not found' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/entidades/:id/ervas - associate erva(s)
router.post('/:id/ervas', authenticate, requireAdmin, async (req, res) => {
  try {
    const entidadeId = parseInt(req.params.id);
    if (isNaN(entidadeId)) return res.status(400).json({ error: 'Invalid ID' });

    const entidade = await prisma.entidade.findUnique({ where: { id: entidadeId } });
    if (!entidade) return res.status(404).json({ error: 'Entidade not found' });

    const { ervaIds } = req.body;
    if (!ervaIds || !Array.isArray(ervaIds) || ervaIds.length === 0) {
      return res.status(400).json({ error: 'ervaIds array is required' });
    }

    const records = ervaIds.map((ervaId) => ({ entidadeId, ervaId: parseInt(ervaId) }));
    await prisma.entidadeErva.createMany({ data: records, skipDuplicates: true });

    const updated = await prisma.entidade.findUnique({
      where: { id: entidadeId },
      include: { ervas: { include: { erva: true } } },
    });

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/entidades/:id/ervas/:ervaId - remove association
router.delete('/:id/ervas/:ervaId', authenticate, requireAdmin, async (req, res) => {
  try {
    const entidadeId = parseInt(req.params.id);
    const ervaId = parseInt(req.params.ervaId);

    if (isNaN(entidadeId) || isNaN(ervaId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    await prisma.entidadeErva.delete({
      where: { entidadeId_ervaId: { entidadeId, ervaId } },
    });

    return res.json({ message: 'Erva removed from entidade' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Association not found' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
