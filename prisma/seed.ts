import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Create services
  const services = await Promise.all([
    prisma.service.create({ data: { name: 'Consulta (30 min)', slug: 'consulta-30', durationMin: 30, priceCents: 12000, active: true } }),
    prisma.service.create({ data: { name: 'Avaliação (45 min)', slug: 'avaliacao-45', durationMin: 45, priceCents: 15000, active: true } }),
    prisma.service.create({ data: { name: 'Limpeza (60 min)', slug: 'limpeza-60', durationMin: 60, priceCents: 20000, active: true } }),
  ])

  console.log('Created services:', services.map(s => s.name))
}

main().catch(console.error).finally(() => prisma.$disconnect())
