const fs = require("fs");

try {
  const envContent = fs.readFileSync(".env.local", "utf8");
  console.log("📄 Conteúdo do .env.local:");
  console.log(envContent);
} catch (error) {
  console.error("❌ Erro ao ler .env.local:", error.message);
}

