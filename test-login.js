const http = require("http");

function testLogin() {
  console.log("🧪 Testando login completo...");

  const postData = JSON.stringify({
    email: "admin@odontocenter.com",
    password: "admin123",
  });

  const options = {
    hostname: "localhost",
    port: 3000,
    path: "/api/auth/signin/credentials",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
    },
  };

  const req = http.request(options, (res) => {
    console.log(`📡 Status: ${res.statusCode}`);

    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      console.log("📄 Resposta do login:");
      console.log(data);

      if (res.statusCode === 200) {
        console.log("✅ Login funcionando!");
      } else {
        console.log("❌ Login com erro:", res.statusCode);
      }
    });
  });

  req.on("error", (error) => {
    console.error("❌ Erro na requisição:", error.message);
  });

  req.write(postData);
  req.end();
}

testLogin();

