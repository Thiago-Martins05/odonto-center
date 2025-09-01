const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testNextAuthConfig() {
  try {
    console.log("🧪 Testando configuração do NextAuth...");

    // Simular as credenciais que o NextAuth receberia
    const credentials = {
      email: "admin@odontocenter.com",
      password: "admin123",
    };

    console.log("📧 Credenciais recebidas:", credentials.email);

    // Buscar usuário (como o NextAuth faria)
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
    });

    if (!user) {
      console.log("❌ Usuário não encontrado");
      return;
    }

    console.log("✅ Usuário encontrado:", user.email);
    console.log("   Nome:", user.name);
    console.log("   Role:", user.role);
    console.log("   Ativo:", user.active);

    // Verificar senha (como o NextAuth faria)
    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      user.password
    );
    console.log("🔑 Senha válida:", isPasswordValid);

    if (isPasswordValid) {
      console.log("🎉 Autenticação simulada bem-sucedida!");
      console.log("   Dados retornados:");
      console.log("     ID:", user.id);
      console.log("     Email:", user.email);
      console.log("     Nome:", user.name);
      console.log("     Role:", user.role);
    } else {
      console.log("❌ Falha na autenticação");
    }
  } catch (error) {
    console.error("❌ Erro no teste:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testNextAuthConfig();

