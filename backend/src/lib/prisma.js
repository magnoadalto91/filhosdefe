import { PrismaClient } from '@prisma/client'

// Singleton: em serverless (Vercel), cada `new PrismaClient()` abre seu próprio
// pool de conexões. Com múltiplos arquivos instanciando o client, um único
// cold start podia abrir dezenas de conexões simultâneas ao pooler do Neon,
// esgotando o limite e causando "Can't reach database server" de forma
// intermitente. Uma instância só, compartilhada por toda a app, evita isso.
const globalForPrisma = globalThis

const prisma = globalForPrisma.__prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma = prisma
}

export default prisma
