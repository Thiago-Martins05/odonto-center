#!/usr/bin/env node

/**
 * Script para testar a criação de serviços
 */

// Carregar variáveis de ambiente do arquivo .env.local
require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testServiceCreation() {
  try {
    console.log('🧪 Testando criação de serviço...');

    // Verificar se o banco está conectado
    await prisma.$connect();
    console.log('✅ Conexão com banco estabelecida');

    // Dados de teste
    const testService = {
      name: 'Teste de Serviço',
      description: 'Descrição do serviço de teste',
      durationMin: 60,
      priceCents: 10000,
      active: true
    };

    console.log('📝 Dados do serviço:', testService);

    // Criar slug
    let baseSlug = testService.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    console.log('🔗 Slug base:', baseSlug);

    // Verificar se o slug já existe
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      const existingService = await prisma.service.findUnique({
        where: { slug }
      });
      
      if (!existingService) {
        break;
      }
      
      console.log(`⚠️  Slug "${slug}" já existe, tentando "${baseSlug}-${counter}"`);
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    console.log('✅ Slug final:', slug);

    // Tentar criar o serviço
    const service = await prisma.service.create({
      data: {
        ...testService,
        slug,
      },
    });

    console.log('🎉 Serviço criado com sucesso!');
    console.log('📊 Dados do serviço criado:', service);

    // Limpar o serviço de teste
    await prisma.service.delete({
      where: { id: service.id }
    });

    console.log('🧹 Serviço de teste removido');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    
    if (error.code) {
      console.error('Código do erro:', error.code);
    }
    
    if (error.meta) {
      console.error('Meta do erro:', error.meta);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testServiceCreation();
