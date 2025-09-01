const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log("🔍 Testando conexão com o banco de dados...");

    // Testar conexão
    await prisma.$connect();
    console.log("✅ Conexão com banco estabelecida");

    // Verificar se a tabela User existe
    const userCount = await prisma.user.count();
    console.log(`📊 Total de usuários no banco: ${userCount}`);

    // Buscar usuário admin
    const adminUser = await prisma.user.findUnique({
      where: { email: "admin@odontocenter.com" },
    });

    if (adminUser) {
      console.log("👤 Usuário admin encontrado:");
      console.log(`   ID: ${adminUser.id}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Nome: ${adminUser.name}`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   Ativo: ${adminUser.active}`);
      console.log(`   Criado em: ${adminUser.createdAt}`);
    } else {
      console.log("❌ Usuário admin não encontrado");
    }

    // Listar todas as tabelas
    console.log("\n📋 Estrutura do banco:");
    const tables =
      await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table'`;
    console.log(tables);
  } catch (error) {
    console.error("❌ Erro ao testar banco:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();

