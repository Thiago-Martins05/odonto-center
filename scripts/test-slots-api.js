#!/usr/bin/env node

/**
 * Script para testar a API de slots diretamente
 */

// Carregar variáveis de ambiente do arquivo .env.local
require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSlotsAPI() {
  try {
    console.log('🧪 Testando API de slots...');

    // Verificar se o banco está conectado
    await prisma.$connect();
    console.log('✅ Conexão com banco estabelecida');

    // Simular parâmetros da API
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Segunda-feira
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6); // Domingo

    console.log(`📅 Semana: ${weekStart.toISOString().split('T')[0]} a ${weekEnd.toISOString().split('T')[0]}`);

    // Buscar serviço
    const service = await prisma.service.findFirst({
      where: { active: true }
    });

    if (!service) {
      console.log('❌ Nenhum serviço ativo encontrado!');
      return;
    }

    console.log(`🔧 Serviço: ${service.name} (${service.durationMin}min)`);

    // Buscar regras de disponibilidade
    const rules = await prisma.availabilityRule.findMany({
      where: {
        OR: [
          { serviceId: service.id },
          { serviceId: null },
        ],
      },
      orderBy: { weekday: "asc" },
    });

    console.log(`📋 Regras encontradas: ${rules.length}`);
    rules.forEach(rule => {
      const dayName = getDayNameFromWeekday(rule.weekday);
      console.log(`   ${dayName}: ${rule.start} - ${rule.end}`);
    });

    // Buscar datas bloqueadas
    const blackoutDates = await prisma.blackoutDate.findMany({
      where: {
        date: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    });

    console.log(`🚫 Datas bloqueadas: ${blackoutDates.length}`);

    // Buscar agendamentos existentes
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        startsAt: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    });

    console.log(`📅 Agendamentos existentes: ${existingAppointments.length}`);

    // Simular geração de slots para hoje
    const today = new Date();
    const todayWeekday = today.getDay();
    const todayRules = rules.filter(rule => rule.weekday === todayWeekday);

    console.log(`\n📅 Regras para hoje (${getDayNameFromWeekday(todayWeekday)}): ${todayRules.length}`);
    
    if (todayRules.length > 0) {
      console.log('✅ Deveria haver horários disponíveis hoje!');
      todayRules.forEach(rule => {
        console.log(`   ${rule.start} - ${rule.end}`);
      });
    } else {
      console.log('❌ Nenhuma regra para hoje - não haverá horários disponíveis');
    }

    // Testar para amanhã
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowWeekday = tomorrow.getDay();
    const tomorrowRules = rules.filter(rule => rule.weekday === tomorrowWeekday);

    console.log(`\n📅 Regras para amanhã (${getDayNameFromWeekday(tomorrowWeekday)}): ${tomorrowRules.length}`);
    
    if (tomorrowRules.length > 0) {
      console.log('✅ Deveria haver horários disponíveis amanhã!');
      tomorrowRules.forEach(rule => {
        console.log(`   ${rule.start} - ${rule.end}`);
      });
    } else {
      console.log('❌ Nenhuma regra para amanhã - não haverá horários disponíveis');
    }

    console.log('\n💡 Diagnóstico:');
    if (rules.length === 0) {
      console.log('❌ PROBLEMA: Nenhuma regra de disponibilidade encontrada!');
      console.log('   Solução: Configure os horários no painel administrativo');
    } else if (service.durationMin <= 0) {
      console.log('❌ PROBLEMA: Duração do serviço inválida!');
      console.log('   Solução: Verifique a duração dos serviços');
    } else {
      console.log('✅ Configuração parece estar correta');
      console.log('   Se os horários não aparecem, pode ser um problema de cache ou timezone');
    }

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

testSlotsAPI();
