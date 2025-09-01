const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testPrisma() {
  try {
    console.log("🧪 Testando conexão com Prisma...");

    // Testar conexão
    await prisma.$connect();
    console.log("✅ Conexão com banco estabelecida");

    // Testar query simples
    const services = await prisma.service.findMany();
    console.log("✅ Query executada com sucesso");
    console.log(`📊 Serviços encontrados: ${services.length}`);

    services.forEach((service) => {
      console.log(
        `  - ${service.name} (${service.active ? "Ativo" : "Inativo"})`
      );
    });
  } catch (error) {
    console.error("❌ Erro no teste do Prisma:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrisma();
