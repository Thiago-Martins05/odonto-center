const http = require("http");

function testSimpleAPI() {
  console.log("🧪 Testando rota simples...");

  const postData = JSON.stringify({
    test: "data",
  });

  const options = {
    hostname: "localhost",
    port: 3000,
    path: "/api/test",
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

testSimpleAPI();
