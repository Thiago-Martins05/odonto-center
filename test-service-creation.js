const testServiceCreation = async () => {
  try {
    console.log("🧪 Testando criação de serviço...");

    const testData = {
      name: "Teste de Serviço",
      description:
        "Este é um serviço de teste para verificar se a criação está funcionando",
      durationMin: 60,
      priceCents: 25000,
      active: true,
    };

    console.log("📤 Enviando dados:", testData);

    const response = await fetch("http://localhost:3000/api/admin/services", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    console.log("📥 Status da resposta:", response.status);
    console.log("📥 Headers:", Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Serviço criado com sucesso:", result);
    } else {
      const error = await response.text();
      console.log("❌ Erro na criação:", error);
    }

    // Testar listagem
    console.log("\n📋 Testando listagem de serviços...");
    const listResponse = await fetch(
      "http://localhost:3000/api/admin/services"
    );

    if (listResponse.ok) {
      const services = await listResponse.json();
      console.log("✅ Serviços encontrados:", services.length);
      services.forEach((service) => {
        console.log(
          `  - ${service.name} (${service.active ? "Ativo" : "Inativo"})`
        );
      });
    } else {
      console.log("❌ Erro ao listar serviços");
    }
  } catch (error) {
    console.error("❌ Erro no teste:", error);
  }
};

testServiceCreation();
