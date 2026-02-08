import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Limpa dados existentes
  await prisma.contribution.deleteMany()
  await prisma.gift.deleteMany()
  await prisma.guest.deleteMany()
  await prisma.contactMessage.deleteMany()
  await prisma.event.deleteMany()

  // Cria o evento
  const event = await prisma.event.create({
    data: {
      coupleNames: 'Raiana & Raphael',
      date: new Date('2026-05-16T12:00:00'),
      venue: 'Rancho do Coutinho, Estrada Sao Jose do Turvo, 2195',
      venueMapsUrl: 'https://maps.google.com/?q=Estr.+de+São+José+do+Turvo+-+São+Luiz+da+Barra,+Barra+do+Piraí+-+RJ,+27165-971',
      description: 'Com grande alegria, convidamos você para celebrar conosco este momento especial! A cerimônia e a recepção serão no mesmo local.',
    }
  })

  console.log(`Evento criado: ${event.coupleNames} - ${event.id}`)

  // Cria presentes
  const gifts = [
    { title: 'Jogo de Panelas', description: 'Conjunto com 5 peças antiaderente', totalValue: 500 },
    { title: 'Cafeteira Expresso', description: 'Máquina de café espresso automática', totalValue: 800 },
    { title: 'Liquidificador', description: 'Liquidificador de alta potência', totalValue: 350 },
    { title: 'Ferro de Passar', description: 'Ferro a vapor com base cerâmica', totalValue: 200 },
    { title: 'Máquina de Lavar', description: 'Lavadora automática 12kg', totalValue: 2500 },
    { title: 'Geladeira', description: 'Geladeira frost free duplex 400L', totalValue: 4000 },
    { title: 'Micro-ondas', description: 'Micro-ondas 30 litros inox', totalValue: 600 },
    { title: 'Batedeira', description: 'Batedeira planetária 500W', totalValue: 400 },
    { title: 'Aspirador de Pó', description: 'Aspirador robô com mapeamento', totalValue: 1200 },
    { title: 'Jogo de Cama', description: 'Kit casal 400 fios algodão egípcio', totalValue: 350 },
  ]

  for (const gift of gifts) {
    await prisma.gift.create({
      data: {
        eventId: event.id,
        title: gift.title,
        description: gift.description,
        totalValue: new Prisma.Decimal(gift.totalValue),
        status: 'available',
      }
    })
  }

  console.log(`${gifts.length} presentes criados`)
  console.log('Seed concluído!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
