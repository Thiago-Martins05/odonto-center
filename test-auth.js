const bcrypt = require("bcryptjs");

async function testAuth() {
  const email = "admin@odontocenter.com";
  const password = "admin123";

  console.log("🧪 Testando autenticação...");
  console.log(`Email: ${email}`);
  console.log(`Senha: ${password}`);

  // Simular o hash da senha como no seed
  const hashedPassword = await bcrypt.hash(password, 12);
  console.log(`Hash da senha: ${hashedPassword}`);

  // Verificar se a senha está correta
  const isValid = await bcrypt.compare(password, hashedPassword);
  console.log(`Senha válida: ${isValid}`);

  // Testar com senha incorreta
  const isInvalid = await bcrypt.compare("senhaerrada", hashedPassword);
  console.log(`Senha incorreta válida: ${isInvalid}`);
}

testAuth().catch(console.error);
