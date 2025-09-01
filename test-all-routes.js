const http = require("http");

const routes = [
  { path: "/api/auth/providers", method: "GET", name: "Providers" },
  { path: "/api/auth/csrf", method: "GET", name: "CSRF" },
  { path: "/api/auth/session", method: "GET", name: "Session" },
  { path: "/api/auth/signout", method: "GET", name: "Signout" },
];

function testRoute(route) {
  return new Promise((resolve) => {
    const options = {
      hostname: "localhost",
      port: 3000,
      path: route.path,
      method: route.method,
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        const success = res.statusCode === 200;
        console.log(
          `${success ? "✅" : "❌"} ${route.name}: ${res.statusCode}`
        );
        if (!success) {
          console.log(`   Erro: ${data}`);
        }
        resolve(success);
      });
    });

    req.on("error", (error) => {
      console.log(`❌ ${route.name}: Erro de conexão`);
      resolve(false);
    });

    req.end();
  });
}

async function testAllRoutes() {
  console.log("🧪 Testando todas as rotas de autenticação...\n");

  const results = [];
  for (const route of routes) {
    const success = await testRoute(route);
    results.push(success);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Aguardar entre testes
  }

  console.log(
    `\n📊 Resultado: ${results.filter(Boolean).length}/${
      results.length
    } rotas funcionando`
  );

  if (results.every(Boolean)) {
    console.log("🎉 Todas as rotas estão funcionando!");
  } else {
    console.log("⚠️  Algumas rotas ainda têm problemas.");
  }
}

testAllRoutes();

