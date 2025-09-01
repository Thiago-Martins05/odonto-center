const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function testSimpleAuth() {
  try {
    console.log("🧪 Teste simples de autenticação...");

    const email = "admin@odontocenter.com";
    const password = "admin123";

    // 1. Buscar usuário
    console.log("1. Buscando usuário...");
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      console.log("❌ Usuário não encontrado");
      return;
    }

    console.log("✅ Usuário encontrado:", user.email);

    // 2. Verificar se está ativo
    console.log("2. Verificando se está ativo...");
    if (!user.active) {
      console.log("❌ Usuário inativo");
      return;
    }

    console.log("✅ Usuário está ativo");

    // 3. Verificar senha
    console.log("3. Verificando senha...");
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log("❌ Senha inválida");
      return;
    }

    console.log("✅ Senha válida");

    // 4. Retornar dados do usuário
    console.log("4. Dados do usuário:");
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    console.log("✅ Autenticação bem-sucedida!");
    console.log("   Dados:", userData);
  } catch (error) {
    console.error("❌ Erro:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testSimpleAuth();
