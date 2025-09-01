const http = require("http");

function testManualLogin() {
  console.log("🧪 Testando rota de login manual...");

  const postData = JSON.stringify({
    email: "admin@odontocenter.com",
    password: "admin123",
  });

  const options = {
    hostname: "localhost",
    port: 3000,
    path: "/api/auth/login",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
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

      if (res.statusCode === 200) {
        console.log("✅ Login manual funcionando!");
      } else {
        console.log("❌ Login manual falhou");
      }
    });
  });

  req.on("error", (e) => {
    console.error(`Erro na requisição: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

testManualLogin();
