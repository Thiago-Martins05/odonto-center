const fs = require("fs");

const newEnvContent = `DATABASE_URL=file:./prisma/dev.db
NEXTAUTH_SECRET=odonto-center-secret-key-2024-development
NEXTAUTH_URL=http://localhost:3000`;

try {
  fs.writeFileSync(".env.local", newEnvContent);
  console.log("✅ Arquivo .env.local atualizado com sucesso!");
  console.log("📄 Novo conteúdo:");
  console.log(newEnvContent);
} catch (error) {
  console.error("❌ Erro ao atualizar .env.local:", error.message);
}

