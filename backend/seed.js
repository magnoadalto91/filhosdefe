import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const prisma = new PrismaClient()

const email = process.argv[2]
const password = process.argv[3]

if (!email || !password) {
  console.error('Uso: node seed.js <email> <senha>')
  process.exit(1)
}

const hash = await bcrypt.hash(password, 10)

const user = await prisma.user.upsert({
  where: { email },
  update: { role: 'ADMIN' },           // não sobrescreve senha se já existe
  create: { email, password: hash, role: 'ADMIN' },
})

console.log(`Admin criado: ${user.email} (id: ${user.id})`)
await prisma.$disconnect()
