const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    const admin = await prisma.user.findUnique({
      where: { email: "admin@odontocenter.com" },
    });

    if (admin) {
      console.log("✅ Usuário admin encontrado:");
      console.log(`   ID: ${admin.id}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Nome: ${admin.name}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Ativo: ${admin.active}`);
      console.log(`   Criado em: ${admin.createdAt}`);
    } else {
      console.log("❌ Usuário admin não encontrado!");
    }
  } catch (error) {
    console.error("Erro ao verificar admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
