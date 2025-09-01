const { getServices } = require("./src/server/admin/services");

async function testGetServices() {
  try {
    console.log("🧪 Testando função getServices...");

    const services = await getServices();
    console.log("✅ getServices executada com sucesso");
    console.log(`📊 Serviços retornados: ${services.length}`);

    services.forEach((service) => {
      console.log(
        `  - ${service.name} (${service.active ? "Ativo" : "Inativo"})`
      );
    });
  } catch (error) {
    console.error("❌ Erro na função getServices:", error);
    console.error("Stack trace:", error.stack);
  }
}

testGetServices();
