const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log("🌱 Criando usuário administrador...");

    const adminEmail = "admin@odontocenter.com";
    const adminPassword = "admin123";

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      console.log("ℹ️  Usuário administrador já existe");
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Nome: ${existingUser.name}`);
      console.log(`   Role: ${existingUser.role}`);
      return;
    }

    // Criar hash da senha
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Administrador",
        password: hashedPassword,
        role: "admin",
        active: true,
      },
    });

    console.log("✅ Usuário administrador criado com sucesso!");
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Nome: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Senha: ${adminPassword}`);
    console.log("   ⚠️  IMPORTANTE: Altere a senha padrão em produção!");
  } catch (error) {
    console.error("❌ Erro ao criar usuário:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();

