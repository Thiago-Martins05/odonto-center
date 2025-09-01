const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testPrismaConnection() {
  try {
    console.log("🔌 Testando conexão com o banco de dados...");

    // Testar conexão
    await prisma.$connect();
    console.log("✅ Conexão com banco de dados estabelecida");

    // Testar consulta simples
    const userCount = await prisma.user.count();
    console.log(`📊 Total de usuários no banco: ${userCount}`);

    // Testar consulta específica
    const admin = await prisma.user.findUnique({
      where: { email: "admin@odontocenter.com" },
    });

    if (admin) {
      console.log("✅ Usuário admin encontrado via Prisma");
      console.log(`   ID: ${admin.id}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Nome: ${admin.name}`);
    } else {
      console.log("❌ Usuário admin não encontrado via Prisma");
    }
  } catch (error) {
    console.error("❌ Erro na conexão com banco de dados:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaConnection();
