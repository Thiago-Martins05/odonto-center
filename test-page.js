const http = require("http");

function testPage() {
  console.log("🧪 Testando se a página de teste está acessível...");

  const options = {
    hostname: "localhost",
    port: 3000,
    path: "/test-auth",
    method: "GET",
  };

  const req = http.request(options, (res) => {
    console.log(`📡 Status: ${res.statusCode}`);

    if (res.statusCode === 200) {
      console.log("✅ Página de teste acessível!");
      console.log("🌐 Acesse: http://localhost:3000/test-auth");
    } else {
      console.log("❌ Página com erro:", res.statusCode);
    }
  });

  req.on("error", (error) => {
    console.error("❌ Erro ao acessar página:", error.message);
  });

  req.end();
}

testPage();
