const puppeteer = require("puppeteer");

async function testWebLogin() {
  console.log("🌐 Testando login via interface web...");

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Navegar para a página de login
    await page.goto("http://localhost:3000/login");
    console.log("✅ Página de login carregada");

    // Aguardar o formulário carregar
    await page.waitForSelector('input[type="email"]');
    await page.waitForSelector('input[type="password"]');
    console.log("✅ Formulário carregado");

    // Preencher credenciais
    await page.type('input[type="email"]', "admin@odontocenter.com");
    await page.type('input[type="password"]', "admin123");
    console.log("✅ Credenciais preenchidas");

    // Clicar no botão de login
    await page.click('button[type="submit"]');
    console.log("✅ Botão de login clicado");

    // Aguardar redirecionamento ou erro
    await page.waitForTimeout(3000);

    // Verificar se foi redirecionado para /admin
    const currentUrl = page.url();
    console.log(`📍 URL atual: ${currentUrl}`);

    if (currentUrl.includes("/admin")) {
      console.log("🎉 Login bem-sucedido! Redirecionado para /admin");
    } else {
      console.log("❌ Login falhou ou não foi redirecionado");

      // Verificar se há mensagem de erro
      const errorMessage = await page.$('.error, [role="alert"]');
      if (errorMessage) {
        const errorText = await errorMessage.evaluate((el) => el.textContent);
        console.log(`❌ Mensagem de erro: ${errorText}`);
      }
    }
  } catch (error) {
    console.error("❌ Erro durante o teste:", error);
  } finally {
    await browser.close();
  }
}

// Verificar se puppeteer está instalado
try {
  require("puppeteer");
  testWebLogin();
} catch (error) {
  console.log("❌ Puppeteer não está instalado. Instalando...");
  console.log("Execute: npm install puppeteer");
  console.log("Ou teste manualmente acessando: http://localhost:3000/login");
}
