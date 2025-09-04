#!/usr/bin/env node

/**
 * Script para corrigir problemas em produção
 * Execute este script após o deploy para configurar dados iniciais
 */

// Carregar variáveis de ambiente do arquivo .env.local
require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixProduction() {
  try {
    console.log('🔧 Corrigindo configuração de produção...');

    // Verificar se o banco está conectado
    await prisma.$connect();
    console.log('✅ Conexão com banco estabelecida');

    // 1. Verificar se existem serviços
    const servicesCount = await prisma.service.count();
    console.log(`📊 Serviços encontrados: ${servicesCount}`);

    if (servicesCount === 0) {
      console.log('➕ Criando serviços básicos...');
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
    }

    // 2. Verificar se existem regras de disponibilidade
    const rulesCount = await prisma.availabilityRule.count();
    console.log(`📊 Regras de disponibilidade encontradas: ${rulesCount}`);

    if (rulesCount === 0) {
      console.log('➕ Criando regras de disponibilidade padrão...');
      const defaultRules = [
        { weekday: 1, start: "08:00", end: "12:00", serviceId: null }, // Segunda
        { weekday: 1, start: "14:00", end: "18:00", serviceId: null },
        { weekday: 2, start: "08:00", end: "12:00", serviceId: null }, // Terça
        { weekday: 2, start: "14:00", end: "18:00", serviceId: null },
        { weekday: 3, start: "08:00", end: "12:00", serviceId: null }, // Quarta
        { weekday: 3, start: "14:00", end: "18:00", serviceId: null },
        { weekday: 4, start: "08:00", end: "12:00", serviceId: null }, // Quinta
        { weekday: 4, start: "14:00", end: "18:00", serviceId: null },
        { weekday: 5, start: "08:00", end: "12:00", serviceId: null }, // Sexta
        { weekday: 5, start: "14:00", end: "18:00", serviceId: null },
        { weekday: 6, start: "08:00", end: "12:00", serviceId: null }, // Sábado
      ];

      for (const rule of defaultRules) {
        await prisma.availabilityRule.create({
          data: rule
        });
      }
      console.log('✅ Regras de disponibilidade criadas');
    }

    // 3. Verificar se existe usuário admin
    const adminCount = await prisma.user.count({
      where: { role: 'admin' }
    });
    console.log(`📊 Usuários admin encontrados: ${adminCount}`);

    if (adminCount === 0) {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@odontocenter.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      
      console.log('➕ Criando usuário administrador...');
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
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Senha: ${adminPassword}`);
    }

    // 4. Verificar informações da clínica
    const clinicInfo = await prisma.clinicInfo.findUnique({
      where: { id: 'singleton' }
    });

    if (!clinicInfo) {
      console.log('➕ Criando informações da clínica...');
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
    }

    console.log('🎉 Configuração de produção concluída com sucesso!');
    console.log('');
    console.log('📋 Próximos passos:');
    console.log('1. Acesse o painel administrativo: /admin');
    console.log('2. Configure os horários de funcionamento');
    console.log('3. Adicione mais serviços se necessário');
    console.log('4. Personalize as informações da clínica');

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixProduction();
