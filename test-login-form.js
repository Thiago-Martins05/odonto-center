const http = require("http");

function testLoginForm() {
  console.log("🧪 Testando login com formato NextAuth...");

  // Simular o formato que o NextAuth envia
  const formData = new URLSearchParams();
  formData.append("email", "admin@odontocenter.com");
  formData.append("password", "admin123");
  formData.append("csrfToken", "test-csrf-token");

  const postData = formData.toString();

  const options = {
    hostname: "localhost",
    port: 3000,
    path: "/api/auth/callback/credentials",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
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

testLoginForm();

