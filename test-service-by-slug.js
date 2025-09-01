const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testServiceBySlug() {
  try {
    console.log('🧪 Testando busca de serviço por slug...');
    
    // Testar com um slug que existe no banco
    const slug = 'limpeza-dental-profunda';
    
    console.log(`🔍 Buscando serviço com slug: ${slug}`);
    
    const service = await prisma.service.findUnique({
      where: { slug: slug },
    });
    
    if (service) {
      console.log('✅ Serviço encontrado:');
      console.log(`   ID: ${service.id}`);
      console.log(`   Nome: ${service.name}`);
      console.log(`   Slug: ${service.slug}`);
      console.log(`   Descrição: ${service.description}`);
      console.log(`   Duração: ${service.durationMin} min`);
      console.log(`   Preço: ${service.priceCents} centavos`);
      console.log(`   Ativo: ${service.active}`);
    } else {
      console.log('❌ Serviço não encontrado');
      
      // Listar todos os serviços disponíveis
      console.log('📋 Serviços disponíveis no banco:');
      const allServices = await prisma.service.findMany();
      allServices.forEach(s => {
        console.log(`   - ${s.slug} (${s.name})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar serviço:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testServiceBySlug();
