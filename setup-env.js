const fs = require("fs");
const path = require("path");

const envContent = `DATABASE_URL=file:./prisma/dev.db
NEXTAUTH_SECRET=odonto-center-secret-key-2024-development
NEXTAUTH_URL=http://localhost:3000
`;

const envPath = path.join(__dirname, ".env.local");

try {
  fs.writeFileSync(envPath, envContent);
  console.log("✅ Arquivo .env.local criado com sucesso!");
  console.log("📝 Conteúdo:");
  console.log(envContent);
} catch (error) {
  console.error("❌ Erro ao criar arquivo .env.local:", error);
}
