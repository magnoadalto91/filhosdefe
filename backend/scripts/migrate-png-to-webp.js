/**
 * Migra todas as imagens PNG salvas no banco para WebP no Cloudinary.
 * Uso: node scripts/migrate-png-to-webp.js
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { v2 as cloudinary } from 'cloudinary'
import sharp from 'sharp'
import https from 'https'
import http from 'http'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const prisma = new PrismaClient()

function download(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    client.get(url, res => {
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => resolve(Buffer.concat(chunks)))
      res.on('error', reject)
    }).on('error', reject)
  })
}

function extractPublicId(url) {
  // https://res.cloudinary.com/<cloud>/image/upload/v123/filhosdefe/abc.png
  // → filhosdefe/abc
  const match = url.match(/\/image\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/)
  return match ? match[1] : null
}

function uploadWebp(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', format: 'webp' },
      (err, result) => err ? reject(err) : resolve(result.secure_url)
    )
    stream.end(buffer)
  })
}

async function migrateRecord(model, id, fotoUrl, updateFn) {
  if (!fotoUrl || !fotoUrl.match(/\.png(\?|$)/i)) return false

  console.log(`  Baixando: ${fotoUrl}`)
  const raw = await download(fotoUrl)
  const webpBuf = await sharp(raw).webp({ quality: 82 }).toBuffer()

  const folder = fotoUrl.includes('/filhosdefe/') ? 'filhosdefe' : 'filhosdefe'
  const newUrl = await uploadWebp(webpBuf, folder)
  console.log(`  → Novo URL: ${newUrl}`)

  await updateFn(id, newUrl)

  const publicId = extractPublicId(fotoUrl)
  if (publicId) {
    try {
      await cloudinary.uploader.destroy(publicId)
      console.log(`  Deletado Cloudinary: ${publicId}`)
    } catch (e) {
      console.warn(`  Aviso: não conseguiu deletar ${publicId}: ${e.message}`)
    }
  }

  return true
}

async function main() {
  console.log('=== Migração PNG → WebP ===\n')

  // Entidades
  const entidades = await prisma.entidade.findMany({
    where: { fotoUrl: { contains: '.png' } },
    select: { id: true, nome: true, fotoUrl: true },
  })
  console.log(`Entidades com PNG: ${entidades.length}`)
  for (const e of entidades) {
    console.log(`[Entidade #${e.id}] ${e.nome}`)
    await migrateRecord('entidade', e.id, e.fotoUrl, (id, url) =>
      prisma.entidade.update({ where: { id }, data: { fotoUrl: url } })
    )
  }

  // Ervas
  const ervas = await prisma.erva.findMany({
    where: { fotoUrl: { contains: '.png' } },
    select: { id: true, nome: true, fotoUrl: true },
  })
  console.log(`\nErvas com PNG: ${ervas.length}`)
  for (const e of ervas) {
    console.log(`[Erva #${e.id}] ${e.nome}`)
    await migrateRecord('erva', e.id, e.fotoUrl, (id, url) =>
      prisma.erva.update({ where: { id }, data: { fotoUrl: url } })
    )
  }

  console.log('\n=== Concluído ===')
  await prisma.$disconnect()
}

main().catch(async err => {
  console.error(err)
  await prisma.$disconnect()
  process.exit(1)
})
