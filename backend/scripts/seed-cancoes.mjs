import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const prisma = new PrismaClient()

const { cancoes } = JSON.parse(
  readFileSync(join(__dirname, '../../cancoes.json'), 'utf8')
)

async function main() {
  console.log(`Importando ${cancoes.length} agregadores...`)

  for (let i = 0; i < cancoes.length; i++) {
    const { agregador: nome, pontos } = cancoes[i]

    // Cria o agregador (ou reutiliza se já existir com o mesmo nome)
    let ag = await prisma.agregador.findFirst({ where: { nome } })
    if (!ag) {
      ag = await prisma.agregador.create({ data: { nome, ordem: i } })
    }
    console.log(`  [${i + 1}/${cancoes.length}] Agregador: ${ag.nome} (id=${ag.id})`)

    // Cria as músicas vinculadas
    for (const p of pontos) {
      if (!p.nome && !p.letra) continue
      await prisma.musica.create({
        data: {
          titulo:     p.nome  || '(sem título)',
          letra:      p.letra || '',
          youtubeUrl: null,
          agregadorId: ag.id,
        },
      })
    }
    console.log(`     → ${pontos.length} ponto(s) inserido(s)`)
  }

  const totalMusicas  = await prisma.musica.count()
  const totalAgregadores = await prisma.agregador.count()
  console.log(`\nConcluído! Banco: ${totalAgregadores} agregadores, ${totalMusicas} músicas.`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
