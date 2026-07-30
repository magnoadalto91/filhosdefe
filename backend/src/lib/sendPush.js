import { PrismaClient } from '@prisma/client'
import webpush from './webpush.js'

const prisma = new PrismaClient()

/**
 * Envia push para todos os subscribers cadastrados.
 * @param {string} title
 * @param {string} body
 * @param {object} [data]  dados extras para o SW (ex.: url)
 */
export async function sendPushToAll(title, body, data = {}) {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return

  const subs = await prisma.pushSubscription.findMany()
  const payload = JSON.stringify({ title, body, ...data })

  const results = await Promise.allSettled(
    subs.map(s =>
      webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        payload,
      ).catch(async err => {
        // Subscription expirada ou inválida → remove do banco
        if (err.statusCode === 404 || err.statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: s.id } }).catch(() => {})
          // Se o usuário ficou sem nenhuma subscrição, marca como revogada
          const remaining = await prisma.pushSubscription.count({ where: { userId: s.userId } }).catch(() => 1)
          if (remaining === 0) {
            await prisma.user.update({ where: { id: s.userId }, data: { pushPermissao: 'revogada' } }).catch(() => {})
          }
        }
        throw err
      })
    )
  )

  const sent   = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length
  if (subs.length) console.log(`[push] ${title} → ${sent} ok, ${failed} falha(s)`)
}

/**
 * Envia push para um único usuário (por userId).
 */
export async function sendPushToUser(userId, title, body, data = {}) {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return

  const subs = await prisma.pushSubscription.findMany({ where: { userId } })
  if (!subs.length) return

  const payload = JSON.stringify({ title, body, ...data })

  const results = await Promise.allSettled(
    subs.map(s =>
      webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        payload,
      ).catch(async err => {
        if (err.statusCode === 404 || err.statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: s.id } }).catch(() => {})
          const remaining = await prisma.pushSubscription.count({ where: { userId: s.userId } }).catch(() => 1)
          if (remaining === 0) {
            await prisma.user.update({ where: { id: s.userId }, data: { pushPermissao: 'revogada' } }).catch(() => {})
          }
        }
        throw err
      })
    )
  )

  const failed = results.filter(r => r.status === 'rejected')
  if (failed.length) {
    console.error(`[push] ${title} → userId ${userId}: ${failed.length}/${subs.length} falha(s)`, failed[0].reason?.message)
  }
}

/**
 * Verifica se um tipo de notificação está habilitado.
 */
export async function isEnabled(field) {
  const cfg = await prisma.notificacaoConfig.findUnique({ where: { id: 1 } })
  if (!cfg) return true            // sem config → habilitado por padrão
  return cfg[field] === true
}
