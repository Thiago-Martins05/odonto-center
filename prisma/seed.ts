import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const services = await prisma.$transaction([
    prisma.service.upsert({
      where: { slug: "consulta-30" },
      update: {},
      create: {
        name: "Consulta (30 min)",
        slug: "consulta-30",
        durationMin: 30,
        priceCents: 12000,
        description: "Consulta clínica objetiva.",
        active: true,
      },
    }),
    prisma.service.upsert({
      where: { slug: "avaliacao-45" },
      update: {},
      create: {
        name: "Avaliação (45 min)",
        slug: "avaliacao-45",
        durationMin: 45,
        priceCents: 15000,
        description: "Avaliação detalhada com plano inicial.",
        active: true,
      },
    }),
    prisma.service.upsert({
      where: { slug: "limpeza-60" },
      update: {},
      create: {
        name: "Limpeza (60 min)",
        slug: "limpeza-60",
        durationMin: 60,
        priceCents: 20000,
        description: "Profilaxia completa e orientações.",
        active: true,
      },
    }),
  ]);

  // ClinicInfo singleton
  await prisma.clinicInfo.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      name: "Odonto Center",
      slogan: "Sorrisos saudáveis, atendimento humanizado.",
      address: "Av. Exemplo, 123 - Zona Norte",
      cityState: "Natal - RN",
      phone: "(84) 3333-0000",
      whatsapp: "(84) 9 9999-9999",
      email: "contato@odontocenter.com.br",
      openingHours: [{ day: "Seg–Sex", time: "09:00–12:00 • 14:00–18:00" }],
      mapEmbedUrl: "https://maps.google.com/",
      highlights: ["Biossegurança", "Tecnologia", "Atendimento humanizado"],
    },
  });

  // Regras (Seg a Sex – 09-12 e 14-18)
  for (const weekday of [1, 2, 3, 4, 5]) {
    for (const [start, end] of [
      ["09:00", "12:00"],
      ["14:00", "18:00"],
    ]) {
      await prisma.availabilityRule.create({ data: { weekday, start, end } });
    }
  }

  // Próximo domingo fechado
  const now = new Date();
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + ((7 - now.getDay()) % 7));
  await prisma.blackoutDate.create({
    data: {
      date: new Date(nextSunday.setHours(0, 0, 0, 0)),
      reason: "Fechado",
    },
  });

  console.log(
    "Seed done:",
    services.map((s: { name: string }) => s.name)
  );
}

main().finally(() => prisma.$disconnect());
