const http = require("http");

function testProviders() {
  console.log("🧪 Testando rota de providers...");

  const options = {
    hostname: "localhost",
    port: 3000,
    path: "/api/auth/providers",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);

    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      console.log("Response:", data);
    });
  });

  req.on("error", (e) => {
    console.error(`Erro na requisição: ${e.message}`);
  });

  req.end();
}

testProviders();
