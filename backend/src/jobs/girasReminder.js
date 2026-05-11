import cron from 'node-cron'
import { PrismaClient } from '@prisma/client'
import { sendPushToAll } from '../lib/sendPush.js'

const prisma = new PrismaClient()

function sameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear()
      && d1.getMonth()    === d2.getMonth()
      && d1.getDate()     === d2.getDate()
}

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

async function checkReminders() {
  const cfg = await prisma.notificacaoConfig.findUnique({ where: { id: 1 } })
  if (!cfg) return

  const hoje = new Date()
  const em7  = addDays(hoje, 7)
  const em1  = addDays(hoje, 1)

  const giras = await prisma.gira.findMany({
    where: {
      status: { in: ['AGUARDANDO', 'EM_ANDAMENTO'] },
      data:   { gte: hoje },
    },
  })

  for (const gira of giras) {
    const dataGira = new Date(gira.data)

    if (cfg.gira1Semana && sameDay(dataGira, em7)) {
      await sendPushToAll(
        '📅 Gira em 1 semana!',
        `"${gira.titulo}" acontece em 7 dias. Prepare-se!`,
        { url: '/calendario' }
      )
    }

    if (cfg.gira1Dia && sameDay(dataGira, em1)) {
      await sendPushToAll(
        '⏰ Gira amanhã!',
        `"${gira.titulo}" é amanhã. Não esqueça!`,
        { url: '/calendario' }
      )
    }

    if (cfg.giraNoDia && sameDay(dataGira, hoje)) {
      await sendPushToAll(
        '🌟 Gira hoje!',
        `"${gira.titulo}" acontece hoje. Axé!`,
        { url: '/calendario' }
      )
    }
  }
}

export function startGirasReminderJob() {
  // Roda todo dia no horário configurado (checa a cada minuto, executa 1x/dia na hora certa)
  cron.schedule('* * * * *', async () => {
    try {
      const cfg = await prisma.notificacaoConfig.findUnique({ where: { id: 1 } })
      if (!cfg) return

      const [hh, mm] = cfg.horaEnvio.split(':').map(Number)
      const now = new Date()
      if (now.getHours() === hh && now.getMinutes() === mm) {
        await checkReminders()
      }
    } catch (err) {
      console.error('[girasReminder]', err.message)
    }
  })

  console.log('[girasReminder] job iniciado')
}
