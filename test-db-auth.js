const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testDbAuth() {
  try {
    console.log("🔐 Testando autenticação com banco de dados...");

    const email = "admin@odontocenter.com";
    const password = "admin123";

    // Buscar usuário no banco
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      console.log("❌ Usuário não encontrado no banco de dados");
      return;
    }

    console.log("✅ Usuário encontrado:");
    console.log(`   Email: ${user.email}`);
    console.log(`   Nome: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Ativo: ${user.active}`);

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(`🔑 Senha válida: ${isPasswordValid}`);

    if (isPasswordValid) {
      console.log("🎉 Autenticação bem-sucedida!");
      console.log("   Dados que seriam retornados:");
      console.log(`     ID: ${user.id}`);
      console.log(`     Email: ${user.email}`);
      console.log(`     Nome: ${user.name}`);
      console.log(`     Role: ${user.role}`);
    } else {
      console.log("❌ Senha inválida");
      console.log(`   Senha fornecida: ${password}`);
      console.log(`   Hash armazenado: ${user.password.substring(0, 20)}...`);
    }
  } catch (error) {
    console.error("❌ Erro ao testar autenticação:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testDbAuth();
