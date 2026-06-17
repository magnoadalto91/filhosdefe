import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { sendPushToAll, isEnabled } from '../lib/sendPush.js';

const router = Router();
const prisma = new PrismaClient();

const giraFullInclude = {
  entidades: { include: { entidade: true } },
  musicas:   { include: { musica: true } },
  banhos:    { include: { banho: true } },
};

// GET /api/giras - upcoming giras (data >= today)
router.get('/', async (_req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const giras = await prisma.gira.findMany({
      where: { data: { gte: today } },
      orderBy: { data: 'asc' },
    });

    return res.json(giras);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/giras/all - all giras
router.get('/all', async (_req, res) => {
  try {
    const giras = await prisma.gira.findMany({ orderBy: { data: 'asc' } });
    return res.json(giras);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/giras/presenca-pendente - must be before /:id to avoid route conflict
router.get('/presenca-pendente', authenticate, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const giras = await prisma.gira.findMany({
      where: {
        data: { gte: today },
        status: { not: 'CONCLUIDA' },
      },
      include: {
        presencas: { where: { userId: req.user.id } },
      },
      orderBy: { data: 'asc' },
    });

    const pending = giras
      .filter(g => {
        const presenca = g.presencas[0];
        if (!presenca) return true;
        return presenca.dataRespondida.toISOString().slice(0, 10) !== g.data.toISOString().slice(0, 10);
      })
      .map(({ presencas: _p, ...g }) => g);

    return res.json(pending);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/giras/:id - with all relations
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const gira = await prisma.gira.findUnique({
      where: { id },
      include: giraFullInclude,
    });

    if (!gira) return res.status(404).json({ error: 'Gira not found' });

    return res.json(gira);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/giras - admin only
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data, titulo, descricao, instrucoes, entidades, musicas, banhos } = req.body;

    if (!data || !titulo) {
      return res.status(400).json({ error: 'data and titulo are required' });
    }

    const gira = await prisma.gira.create({
      data: {
        data: new Date(data),
        titulo,
        descricao: descricao || null,
        instrucoes: instrucoes || null,
      },
    });

    if (Array.isArray(entidades) && entidades.length > 0) {
      await prisma.giraEntidade.createMany({
        data: entidades.map(entidadeId => ({ giraId: gira.id, entidadeId: parseInt(entidadeId) })),
        skipDuplicates: true,
      });
    }
    if (Array.isArray(musicas) && musicas.length > 0) {
      await prisma.giraMusica.createMany({
        data: musicas.map(musicaId => ({ giraId: gira.id, musicaId: parseInt(musicaId) })),
        skipDuplicates: true,
      });
    }
    if (Array.isArray(banhos) && banhos.length > 0) {
      await prisma.giraBanho.createMany({
        data: banhos.map(banhoId => ({ giraId: gira.id, banhoId: parseInt(banhoId) })),
        skipDuplicates: true,
      });
    }

    const full = await prisma.gira.findUnique({ where: { id: gira.id }, include: giraFullInclude });

    if (await isEnabled('novaGira')) {
      const dataFmt = new Date(gira.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      sendPushToAll('📅 Nova Gira cadastrada!', `"${gira.titulo}" — ${dataFmt}. Salve na agenda!`, { url: '/calendario' }).catch(() => {})
    }

    return res.status(201).json(full);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/giras/:id/status - admin only
router.patch('/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const { status } = req.body;
    if (!['AGUARDANDO', 'EM_ANDAMENTO', 'CONCLUIDA'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido.' });
    }

    const gira = await prisma.gira.update({ where: { id }, data: { status } });
    return res.json(gira);
  } catch {
    return res.status(404).json({ error: 'Gira not found' });
  }
});

// PUT /api/giras/:id - admin only
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const existing = await prisma.gira.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Gira not found' });

    if (existing.status === 'CONCLUIDA') {
      return res.status(400).json({ error: 'Giras concluídas não podem ser editadas.' });
    }

    const { data, titulo, descricao, instrucoes, entidades, musicas, banhos } = req.body;
    const updateData = {};

    // Detect date change (compare date portion only)
    const dateChanged = data !== undefined &&
      new Date(data).toISOString().slice(0, 10) !== existing.data.toISOString().slice(0, 10);

    if (data !== undefined) updateData.data = new Date(data);
    if (titulo !== undefined) updateData.titulo = titulo;
    if (descricao !== undefined) updateData.descricao = descricao;
    if (instrucoes !== undefined) updateData.instrucoes = instrucoes;

    await prisma.gira.update({ where: { id }, data: updateData });

    if (Array.isArray(entidades)) {
      await prisma.giraEntidade.deleteMany({ where: { giraId: id } });
      if (entidades.length > 0) {
        await prisma.giraEntidade.createMany({
          data: entidades.map(entidadeId => ({ giraId: id, entidadeId: parseInt(entidadeId) })),
          skipDuplicates: true,
        });
      }
    }
    if (Array.isArray(musicas)) {
      await prisma.giraMusica.deleteMany({ where: { giraId: id } });
      if (musicas.length > 0) {
        await prisma.giraMusica.createMany({
          data: musicas.map(musicaId => ({ giraId: id, musicaId: parseInt(musicaId) })),
          skipDuplicates: true,
        });
      }
    }
    if (Array.isArray(banhos)) {
      await prisma.giraBanho.deleteMany({ where: { giraId: id } });
      if (banhos.length > 0) {
        await prisma.giraBanho.createMany({
          data: banhos.map(banhoId => ({ giraId: id, banhoId: parseInt(banhoId) })),
          skipDuplicates: true,
        });
      }
    }

    const gira = await prisma.gira.findUnique({ where: { id }, include: giraFullInclude });

    if (dateChanged) {
      // Date changed: reset all confirmations and always notify
      await prisma.presencaGira.deleteMany({ where: { giraId: id } });
      const novaDataFmt = new Date(gira.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      sendPushToAll('📅 Data da Gira alterada!', `"${gira.titulo}" — nova data: ${novaDataFmt}. Confirme sua presença!`, { url: '/calendario' }).catch(() => {});
    } else if (await isEnabled('novaGira')) {
      const dataFmt = new Date(gira.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      sendPushToAll('✏️ Gira atualizada', `"${gira.titulo}" — ${dataFmt} foi atualizada. Confira os detalhes!`, { url: '/calendario' }).catch(() => {});
    }

    return res.json(gira);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/giras/:id - admin only
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const existing = await prisma.gira.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Gira not found' });

    if (existing.status === 'CONCLUIDA') {
      return res.status(400).json({ error: 'Giras concluídas não podem ser excluídas.' });
    }

    const dataFmt = new Date(existing.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    await prisma.gira.delete({ where: { id } });

    sendPushToAll('🗑️ Gira cancelada', `"${existing.titulo}" — ${dataFmt} foi removida.`, { url: '/calendario' }).catch(() => {})

    return res.json({ message: 'Gira deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/giras/:id/entidades - add entity to gira
router.post('/:id/entidades', authenticate, requireAdmin, async (req, res) => {
  try {
    const giraId = parseInt(req.params.id);
    if (isNaN(giraId)) return res.status(400).json({ error: 'Invalid ID' });

    const gira = await prisma.gira.findUnique({ where: { id: giraId } });
    if (!gira) return res.status(404).json({ error: 'Gira not found' });

    const { entidadeIds } = req.body;
    if (!entidadeIds || !Array.isArray(entidadeIds) || entidadeIds.length === 0) {
      return res.status(400).json({ error: 'entidadeIds array is required' });
    }

    const records = entidadeIds.map((entidadeId) => ({ giraId, entidadeId: parseInt(entidadeId) }));
    await prisma.giraEntidade.createMany({ data: records, skipDuplicates: true });

    const updated = await prisma.gira.findUnique({
      where: { id: giraId },
      include: giraFullInclude,
    });

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/giras/:id/entidades/:entidadeId
router.delete('/:id/entidades/:entidadeId', authenticate, requireAdmin, async (req, res) => {
  try {
    const giraId = parseInt(req.params.id);
    const entidadeId = parseInt(req.params.entidadeId);

    if (isNaN(giraId) || isNaN(entidadeId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    await prisma.giraEntidade.delete({
      where: { giraId_entidadeId: { giraId, entidadeId } },
    });

    return res.json({ message: 'Entidade removed from gira' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Association not found' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/giras/:id/musicas - add musica to gira
router.post('/:id/musicas', authenticate, requireAdmin, async (req, res) => {
  try {
    const giraId = parseInt(req.params.id);
    if (isNaN(giraId)) return res.status(400).json({ error: 'Invalid ID' });

    const gira = await prisma.gira.findUnique({ where: { id: giraId } });
    if (!gira) return res.status(404).json({ error: 'Gira not found' });

    const { musicaIds } = req.body;
    if (!musicaIds || !Array.isArray(musicaIds) || musicaIds.length === 0) {
      return res.status(400).json({ error: 'musicaIds array is required' });
    }

    const records = musicaIds.map((musicaId) => ({ giraId, musicaId: parseInt(musicaId) }));
    await prisma.giraMusica.createMany({ data: records, skipDuplicates: true });

    const updated = await prisma.gira.findUnique({
      where: { id: giraId },
      include: giraFullInclude,
    });

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/giras/:id/musicas/:musicaId
router.delete('/:id/musicas/:musicaId', authenticate, requireAdmin, async (req, res) => {
  try {
    const giraId = parseInt(req.params.id);
    const musicaId = parseInt(req.params.musicaId);

    if (isNaN(giraId) || isNaN(musicaId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    await prisma.giraMusica.delete({
      where: { giraId_musicaId: { giraId, musicaId } },
    });

    return res.json({ message: 'Musica removed from gira' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Association not found' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/giras/:id/banhos - add banho to gira
router.post('/:id/banhos', authenticate, requireAdmin, async (req, res) => {
  try {
    const giraId = parseInt(req.params.id);
    if (isNaN(giraId)) return res.status(400).json({ error: 'Invalid ID' });

    const gira = await prisma.gira.findUnique({ where: { id: giraId } });
    if (!gira) return res.status(404).json({ error: 'Gira not found' });

    const { banhoIds } = req.body;
    if (!banhoIds || !Array.isArray(banhoIds) || banhoIds.length === 0) {
      return res.status(400).json({ error: 'banhoIds array is required' });
    }

    const records = banhoIds.map((banhoId) => ({ giraId, banhoId: parseInt(banhoId) }));
    await prisma.giraBanho.createMany({ data: records, skipDuplicates: true });

    const updated = await prisma.gira.findUnique({ where: { id: giraId }, include: giraFullInclude });
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/giras/:id/presenca - submit attendance response
router.post('/:id/presenca', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const gira = await prisma.gira.findUnique({ where: { id } });
    if (!gira) return res.status(404).json({ error: 'Gira not found' });

    const { confirmado, justificativa } = req.body;
    const confirmed = confirmado === true || confirmado === 'true';

    if (!confirmed && !justificativa?.trim()) {
      return res.status(400).json({ error: 'Justificativa é obrigatória ao recusar presença.' });
    }

    const presenca = await prisma.presencaGira.upsert({
      where: { giraId_userId: { giraId: id, userId: req.user.id } },
      create: {
        giraId: id,
        userId: req.user.id,
        confirmado: confirmed,
        justificativa: confirmed ? null : justificativa.trim(),
        dataRespondida: gira.data,
      },
      update: {
        confirmado: confirmed,
        justificativa: confirmed ? null : justificativa.trim(),
        dataRespondida: gira.data,
      },
    });

    return res.json(presenca);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/giras/:id/presencas - admin only
router.get('/:id/presencas', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const [presencas, allUsers] = await Promise.all([
      prisma.presencaGira.findMany({
        where: { giraId: id },
        include: { user: { select: { id: true, nome: true, email: true } } },
        orderBy: [{ confirmado: 'desc' }, { dataRespondida: 'asc' }],
      }),
      prisma.user.findMany({
        select: { id: true, nome: true, email: true },
        orderBy: { nome: 'asc' },
      }),
    ]);

    const respondidoIds = new Set(presencas.map(p => p.userId));
    const pendentes = allUsers
      .filter(u => !respondidoIds.has(u.id))
      .map(u => ({ userId: u.id, user: u, confirmado: null, justificativa: null, pendente: true }));

    return res.json({ presencas, pendentes });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/giras/:id/banhos/:banhoId
router.delete('/:id/banhos/:banhoId', authenticate, requireAdmin, async (req, res) => {
  try {
    const giraId = parseInt(req.params.id);
    const banhoId = parseInt(req.params.banhoId);

    if (isNaN(giraId) || isNaN(banhoId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    await prisma.giraBanho.delete({
      where: { giraId_banhoId: { giraId, banhoId } },
    });

    return res.json({ message: 'Banho removed from gira' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Association not found' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
