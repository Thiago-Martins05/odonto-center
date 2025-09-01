const https = require("https");
const http = require("http");

async function testLoginAPI() {
  console.log("🧪 Testando API de login...");

  const postData = JSON.stringify({
    email: "admin@odontocenter.com",
    password: "admin123",
  });

  const options = {
    hostname: "localhost",
    port: 3000,
    path: "/api/auth/callback/credentials",
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
    });
  });

  req.on("error", (e) => {
    console.error(`Erro na requisição: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

testLoginAPI();
