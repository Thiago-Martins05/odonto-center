import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Criar usuário administrador padrão
  const adminEmail = "admin@odontocenter.com";
  const adminPassword = "admin123"; // Senha padrão - deve ser alterada em produção

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Administrador",
        password: hashedPassword,
        role: "admin",
        active: true,
      },
    });

    console.log("✅ Usuário administrador criado:");
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Senha: ${adminPassword}`);
    console.log("   ⚠️  IMPORTANTE: Altere a senha padrão em produção!");
  } else {
    console.log("ℹ️  Usuário administrador já existe");
  }

  // Criar informações da clínica se não existirem
  const existingClinicInfo = await prisma.clinicInfo.findUnique({
    where: { id: "singleton" },
  });

  if (!existingClinicInfo) {
    await prisma.clinicInfo.create({
      data: {
        id: "singleton",
        name: "Odonto Center",
        slogan: "Sua saúde bucal em primeiro lugar",
        address: "Rua das Flores, 123",
        cityState: "Natal, RN",
        phone: "(11) 99999-9999",
        whatsapp: "(11) 99999-9999",
        email: "contato@odontocenter.com",
        highlights:
          "Clínica odontológica moderna com atendimento personalizado",
      },
    });
    console.log("✅ Informações da clínica criadas");
  } else {
    console.log("ℹ️  Informações da clínica já existem");
  }

  // Criar alguns serviços de exemplo se não existirem
  const existingServices = await prisma.service.count();

  if (existingServices === 0) {
    const services = [
      {
        name: "Consulta de Rotina",
        slug: "consulta-rotina",
        durationMin: 60,
        description: "Avaliação geral da saúde bucal, limpeza e orientações",
        priceCents: 15000, // R$ 150,00
      },
      {
        name: "Limpeza Profissional",
        slug: "limpeza-profissional",
        durationMin: 45,
        description: "Remoção de tártaro e placa bacteriana",
        priceCents: 12000, // R$ 120,00
      },
      {
        name: "Clareamento",
        slug: "clareamento",
        durationMin: 90,
        description: "Clareamento dental profissional",
        priceCents: 30000, // R$ 300,00
      },
    ];

    for (const service of services) {
      await prisma.service.create({
        data: service,
      });
    }

    console.log("✅ Serviços de exemplo criados");
  } else {
    console.log("ℹ️  Serviços já existem");
  }

  // Criar regras de disponibilidade padrão se não existirem
  const existingRules = await prisma.availabilityRule.count();
  
  if (existingRules === 0) {
    const defaultRules = [
      { weekday: 1, start: "08:00", end: "12:00", serviceId: null }, // Segunda
      { weekday: 1, start: "14:00", end: "18:00", serviceId: null },
      { weekday: 2, start: "08:00", end: "12:00", serviceId: null }, // Terça
      { weekday: 2, start: "14:00", end: "18:00", serviceId: null },
      { weekday: 3, start: "08:00", end: "12:00", serviceId: null }, // Quarta
      { weekday: 3, start: "14:00", end: "18:00", serviceId: null },
      { weekday: 4, start: "08:00", end: "12:00", serviceId: null }, // Quinta
      { weekday: 4, start: "14:00", end: "18:00", serviceId: null },
      { weekday: 5, start: "08:00", end: "12:00", serviceId: null }, // Sexta
      { weekday: 5, start: "14:00", end: "18:00", serviceId: null },
      { weekday: 6, start: "08:00", end: "12:00", serviceId: null }, // Sábado
    ];

    for (const rule of defaultRules) {
      await prisma.availabilityRule.create({
        data: rule
      });
    }

    console.log("✅ Regras de disponibilidade padrão criadas");
  } else {
    console.log("ℹ️  Regras de disponibilidade já existem");
  }

  console.log("🎉 Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro durante o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
