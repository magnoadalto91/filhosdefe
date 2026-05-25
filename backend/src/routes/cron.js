import express from 'express';
import { PrismaClient } from '@prisma/client';
import { sendPushToAll } from '../lib/sendPush.js';

const router = express.Router();
const prisma = new PrismaClient();

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

// POST /api/cron/giras-reminder — chamado pelo Vercel Cron (diariamente às 11:00 UTC = 08:00 BRT)
router.post('/giras-reminder', async (req, res) => {
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

    let sent = 0;
    for (const gira of giras) {
      const dataGira = new Date(gira.data);

      if (cfg.gira1Semana && sameDay(dataGira, em7)) {
        await sendPushToAll('Gira em 1 semana!', `"${gira.titulo}" acontece em 7 dias. Prepare-se!`, { url: '/calendario' });
        sent++;
      }
      if (cfg.gira1Dia && sameDay(dataGira, em1)) {
        await sendPushToAll('Gira amanhã!', `"${gira.titulo}" é amanhã. Não esqueça!`, { url: '/calendario' });
        sent++;
      }
      if (cfg.giraNoDia && sameDay(dataGira, hoje)) {
        await sendPushToAll('Gira hoje!', `"${gira.titulo}" acontece hoje. Axé!`, { url: '/calendario' });
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
