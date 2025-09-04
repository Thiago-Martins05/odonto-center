#!/usr/bin/env node

/**
 * Script para testar a sincronização de disponibilidade
 */

// Carregar variáveis de ambiente do arquivo .env.local
require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAvailability() {
  try {
    console.log('🧪 Testando sincronização de disponibilidade...');

    // Verificar se o banco está conectado
    await prisma.$connect();
    console.log('✅ Conexão com banco estabelecida');

    // 1. Verificar regras de disponibilidade existentes
    console.log('\n📊 Regras de disponibilidade no banco:');
    const rules = await prisma.availabilityRule.findMany({
      orderBy: [{ weekday: 'asc' }, { start: 'asc' }]
    });

    if (rules.length === 0) {
      console.log('❌ Nenhuma regra de disponibilidade encontrada!');
      console.log('💡 Execute o script de correção: npm run fix:production');
      return;
    }

    rules.forEach(rule => {
      const dayName = getDayNameFromWeekday(rule.weekday);
      console.log(`   ${dayName}: ${rule.start} - ${rule.end} (${rule.serviceId ? 'Específico' : 'Global'})`);
    });

    // 2. Testar a API de slots
    console.log('\n🔍 Testando API de slots...');
    
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Segunda-feira
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6); // Domingo

    console.log(`   Semana: ${weekStart.toISOString().split('T')[0]} a ${weekEnd.toISOString().split('T')[0]}`);

    // Simular chamada da API
    const testRules = await prisma.availabilityRule.findMany({
      where: {
        OR: [
          { serviceId: null }, // Regras globais
        ],
      },
      orderBy: { weekday: "asc" },
    });

    console.log(`   Regras globais encontradas: ${testRules.length}`);

    // 3. Verificar se há serviços
    const services = await prisma.service.findMany({
      where: { active: true }
    });
    console.log(`   Serviços ativos: ${services.length}`);

    if (services.length > 0) {
      console.log('   Serviços:');
      services.forEach(service => {
        console.log(`     - ${service.name} (${service.durationMin}min)`);
      });
    }

    // 4. Verificar se há agendamentos existentes
    const appointments = await prisma.appointment.findMany({
      where: {
        startsAt: {
          gte: weekStart,
          lte: weekEnd
        }
      }
    });
    console.log(`   Agendamentos na semana: ${appointments.length}`);

    console.log('\n✅ Teste concluído!');
    console.log('\n💡 Se os horários não aparecem:');
    console.log('   1. Verifique se as regras foram salvas no painel admin');
    console.log('   2. Confirme se os serviços estão ativos');
    console.log('   3. Verifique se não há conflitos de agendamentos');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function getDayNameFromWeekday(weekday) {
  const dayMap = {
    0: 'Domingo',
    1: 'Segunda',
    2: 'Terça',
    3: 'Quarta',
    4: 'Quinta',
    5: 'Sexta',
    6: 'Sábado',
  };
  
  return dayMap[weekday] || 'Desconhecido';
}

testAvailability();
