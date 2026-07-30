import express from 'express';
import prisma from '../lib/prisma.js'
import { sendPushToUser } from '../lib/sendPush.js';

const router = express.Router();

function sameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear()
      && d1.getMonth()    === d2.getMonth()
      && d1.getDate()     === d2.getDate();
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// GET /api/cron/giras-reminder — chamado pelo Vercel Cron (diariamente às 11:00 UTC = 08:00 BRT)
// Vercel Cron Jobs sempre disparam via GET, então a rota precisa aceitar esse método.
router.get('/giras-reminder', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const cfg = await prisma.notificacaoConfig.findUnique({ where: { id: 1 } });
    if (!cfg) return res.json({ ok: true, sent: 0 });

    const hoje = new Date();
    const em7  = addDays(hoje, 7);
    const em1  = addDays(hoje, 1);

    const giras = await prisma.gira.findMany({
      where: {
        status: { in: ['AGUARDANDO', 'EM_ANDAMENTO'] },
        data:   { gte: hoje },
      },
    });

    // Usuários com push ativo
    const subs = await prisma.pushSubscription.findMany({
      select: { userId: true },
      distinct: ['userId'],
    });
    const userIds = subs.map(s => s.userId);

    let sent = 0;
    for (const gira of giras) {
      const dataGira = new Date(gira.data);
      const giraDate = gira.data.toISOString().slice(0, 10);

      let title = null, baseBody = null;

      if (cfg.gira1Semana && sameDay(dataGira, em7)) {
        title    = 'Gira em 1 semana!';
        baseBody = `"${gira.titulo}" acontece em 7 dias. Prepare-se!`;
      } else if (cfg.gira1Dia && sameDay(dataGira, em1)) {
        title    = 'Gira amanhã!';
        baseBody = `"${gira.titulo}" é amanhã. Não esqueça!`;
      } else if (cfg.giraNoDia && sameDay(dataGira, hoje)) {
        title    = 'Gira hoje!';
        baseBody = `"${gira.titulo}" acontece hoje. Axé!`;
      }

      if (!title || !userIds.length) continue;

      // Verifica quais usuários já responderam para esta gira
      const presencas = await prisma.presencaGira.findMany({
        where: { giraId: gira.id, userId: { in: userIds } },
        select: { userId: true, dataRespondida: true },
      });
      const respondidoIds = new Set(
        presencas
          .filter(p => p.dataRespondida?.toISOString().slice(0, 10) === giraDate)
          .map(p => p.userId)
      );

      for (const userId of userIds) {
        const jaRespondeu = respondidoIds.has(userId);
        const body = jaRespondeu
          ? baseBody
          : `${baseBody} Confirme sua presença no app!`;
        await sendPushToUser(userId, title, body, { url: '/calendario' });
        sent++;
      }
    }

    res.json({ ok: true, sent });
  } catch (err) {
    console.error('[cron/giras-reminder]', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
