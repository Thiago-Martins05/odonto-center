import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
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
      highlights: "Biossegurança, Tecnologia, Atendimento humanizado",
    },
  });

  // Criar os 10 serviços odontológicos
  const services = await prisma.$transaction([
    prisma.service.upsert({
      where: { slug: "limpeza-dental-profunda" },
      update: {},
      create: {
        name: "Limpeza Dental Profunda",
        slug: "limpeza-dental-profunda",
        durationMin: 40,
        priceCents: 8000,
        description: "A limpeza profissional, também conhecida como profilaxia, é fundamental para a saúde bucal. Remove tártaro, placa bacteriana e manchas superficiais dos dentes, ajudando a prevenir doenças como gengivite e cáries. Além disso, proporciona hálito fresco e sensação de limpeza imediata.",
        active: true,
      },
    }),
    prisma.service.upsert({
      where: { slug: "clareamento-dental" },
      update: {},
      create: {
        name: "Clareamento Dental",
        slug: "clareamento-dental",
        durationMin: 60,
        priceCents: 30000,
        description: "O clareamento dental é um procedimento seguro e eficaz que remove pigmentações causadas por café, vinho, cigarro e outros alimentos. Pode ser feito em consultório com laser ou em casa com moldeiras. O resultado é um sorriso mais claro e rejuvenescido, sem danificar o esmalte dental.",
        active: true,
      },
    }),
    prisma.service.upsert({
      where: { slug: "restauracoes-obturacao" },
      update: {},
      create: {
        name: "Restaurações (Obturações)",
        slug: "restauracoes-obturacao",
        durationMin: 45,
        priceCents: 10000,
        description: "A restauração dentária recupera a forma e a função de dentes danificados por cáries ou pequenas fraturas. Utiliza materiais como resina composta, que se adapta à cor natural dos dentes, garantindo estética e resistência. O procedimento é rápido, indolor e evita problemas maiores no futuro.",
        active: true,
      },
    }),
    prisma.service.upsert({
      where: { slug: "extracao-simples-siso" },
      update: {},
      create: {
        name: "Extração (Simples e Siso)",
        slug: "extracao-simples-siso",
        durationMin: 45,
        priceCents: 12000,
        description: "A extração dentária é indicada quando o dente está comprometido por cárie extensa, mobilidade, ou em casos de dentes do siso impactados. É realizada com anestesia local e acompanhamento profissional, garantindo segurança, conforto e recuperação rápida com os devidos cuidados.",
        active: true,
      },
    }),
    prisma.service.upsert({
      where: { slug: "tratamento-canal-endodontia" },
      update: {},
      create: {
        name: "Tratamento de Canal (Endodontia)",
        slug: "tratamento-canal-endodontia",
        durationMin: 90,
        priceCents: 35000,
        description: "O tratamento de canal é necessário quando a polpa dentária (nervo) está inflamada ou infectada. O procedimento remove o tecido comprometido, desinfeta o canal e o sela com material próprio. Evita a perda do dente e alivia dores intensas, restaurando a saúde bucal.",
        active: true,
      },
    }),
    prisma.service.upsert({
      where: { slug: "aparelhos-ortodonticos" },
      update: {},
      create: {
        name: "Aparelhos Ortodônticos",
        slug: "aparelhos-ortodonticos",
        durationMin: 60,
        priceCents: 180000,
        description: "A ortodontia trata problemas de posicionamento dental e mordida, com aparelhos fixos ou estéticos. Além do benefício estético, melhora a mastigação, dicção e higiene bucal. O tratamento é individualizado e pode incluir aparelhos tradicionais, autoligados ou alinhadores invisíveis.",
        active: true,
      },
    }),
    prisma.service.upsert({
      where: { slug: "proteses-dentarias" },
      update: {},
      create: {
        name: "Próteses Dentárias",
        slug: "proteses-dentarias",
        durationMin: 30,
        priceCents: 50000,
        description: "As próteses devolvem a função mastigatória e a aparência natural dos dentes perdidos. Podem ser parciais ou totais, removíveis ou fixas, conforme a necessidade do paciente. São produzidas sob medida, garantindo adaptação, conforto e um sorriso mais harmônico.",
        active: true,
      },
    }),
    prisma.service.upsert({
      where: { slug: "implantes-dentarios" },
      update: {},
      create: {
        name: "Implantes Dentários",
        slug: "implantes-dentarios",
        durationMin: 90,
        priceCents: 150000,
        description: "O implante dentário é uma estrutura de titânio inserida no osso para suportar uma prótese. É a solução mais moderna e durável para reposição dentária. Proporciona estabilidade, estética e função semelhante ao dente natural, com grande taxa de sucesso e conforto.",
        active: true,
      },
    }),
    prisma.service.upsert({
      where: { slug: "cirurgias-bucais" },
      update: {},
      create: {
        name: "Cirurgias Bucais",
        slug: "cirurgias-bucais",
        durationMin: 45,
        priceCents: 25000,
        description: "Englobam cirurgias como frenectomia (remoção do freio labial ou lingual), biópsias, remoção de cistos, entre outras. São procedimentos rápidos e realizados com anestesia local. Visam corrigir alterações que afetam a saúde ou a estética bucal, com recuperação tranquila.",
        active: true,
      },
    }),
    prisma.service.upsert({
      where: { slug: "tratamento-gengiva-periodontia" },
      update: {},
      create: {
        name: "Tratamento de Gengiva (Periodontia)",
        slug: "tratamento-gengiva-periodontia",
        durationMin: 45,
        priceCents: 15000,
        description: "O tratamento periodontal é essencial para combater gengivite e periodontite. Inclui raspagens e orientações de higiene bucal. Ajuda a evitar a perda dentária e melhora o hálito, o conforto e a estética. Pode exigir acompanhamento regular para manter os resultados.",
        active: true,
      },
    }),
  ]);

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

  console.log("Seed done:", services.map((s: { name: string }) => s.name));
}

main().finally(() => prisma.$disconnect());
