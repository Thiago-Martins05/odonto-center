const http = require("http");

function testNextAuthAPI() {
  console.log("🧪 Testando rota de API do NextAuth...");

  const options = {
    hostname: "localhost",
    port: 3000,
    path: "/api/auth/providers",
    method: "GET",
  };

  const req = http.request(options, (res) => {
    console.log(`📡 Status: ${res.statusCode}`);
    console.log(`📡 Headers:`, res.headers);

    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      console.log("📄 Resposta recebida:");
      console.log(data);

      if (res.statusCode === 200) {
        console.log("✅ API funcionando!");
      } else {
        console.log("❌ API com erro:", res.statusCode);
      }
    });
  });

  req.on("error", (error) => {
    console.error("❌ Erro na requisição:", error.message);
  });

  req.end();
}

// Aguardar um pouco para o servidor estar rodando
setTimeout(testNextAuthAPI, 2000);

