#!/usr/bin/env node

/**
 * Script para configurar o banco de dados em produção
 * Execute após o primeiro deploy na Vercel
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupProduction() {
  try {
    console.log('🚀 Configurando banco de dados para produção...');

    // Verificar se o banco está conectado
    await prisma.$connect();
    console.log('✅ Conexão com banco estabelecida');

    // Criar usuário administrador se não existir
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log('⚠️  ADMIN_EMAIL e ADMIN_PASSWORD não configurados');
      console.log('Configure essas variáveis de ambiente na Vercel');
      return;
    }

    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log('✅ Usuário administrador já existe');
    } else {
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      await prisma.user.create({
        data: {
          email: adminEmail,
          name: 'Administrador',
          password: hashedPassword,
          role: 'admin',
          active: true
        }
      });
      
      console.log('✅ Usuário administrador criado');
    }

    // Verificar se existem serviços básicos
    const servicesCount = await prisma.service.count();
    
    if (servicesCount === 0) {
      console.log('📋 Criando serviços básicos...');
      
      const basicServices = [
        {
          name: 'Consulta de Avaliação',
          slug: 'consulta-avaliacao',
          durationMin: 30,
          description: 'Consulta inicial para avaliação do paciente',
          priceCents: 0,
          active: true
        },
        {
          name: 'Limpeza Dental',
          slug: 'limpeza-dental',
          durationMin: 60,
          description: 'Limpeza e profilaxia dental',
          priceCents: 0,
          active: true
        },
        {
          name: 'Restauração',
          slug: 'restauracao',
          durationMin: 90,
          description: 'Restauração de dente cariado',
          priceCents: 0,
          active: true
        }
      ];

      for (const service of basicServices) {
        await prisma.service.create({
          data: service
        });
      }
      
      console.log('✅ Serviços básicos criados');
    } else {
      console.log('✅ Serviços já existem');
    }

    // Verificar informações da clínica
    const clinicInfo = await prisma.clinicInfo.findUnique({
      where: { id: 'singleton' }
    });

    if (!clinicInfo) {
      console.log('🏥 Criando informações da clínica...');
      
      await prisma.clinicInfo.create({
        data: {
          id: 'singleton',
          name: 'Odonto Center',
          slogan: 'Seu sorriso é nossa prioridade',
          address: 'Endereço da clínica',
          cityState: 'Cidade - Estado',
          phone: '(11) 99999-9999',
          whatsapp: '5511999999999',
          email: 'contato@odontocenter.com',
          highlights: 'Clínica odontológica moderna com profissionais qualificados'
        }
      });
      
      console.log('✅ Informações da clínica criadas');
    } else {
      console.log('✅ Informações da clínica já existem');
    }

    console.log('🎉 Configuração de produção concluída!');
    console.log('📧 Email do admin:', adminEmail);
    console.log('🔗 Acesse: /admin para gerenciar o sistema');

  } catch (error) {
    console.error('❌ Erro na configuração:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  setupProduction();
}

module.exports = setupProduction;

