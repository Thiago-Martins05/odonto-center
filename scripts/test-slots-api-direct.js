#!/usr/bin/env node

/**
 * Script para testar a API de slots diretamente
 */

// Carregar variáveis de ambiente do arquivo .env.local
require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSlotsAPIDirect() {
  try {
    console.log('🧪 Testando API de slots diretamente...');

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

    // Simular exatamente o que a API faz
    console.log('\n🔍 Simulando busca de regras (como na API):');
    
    const rules = await prisma.availabilityRule.findMany({
      where: {
        OR: [
          { serviceId: service.id },
          { serviceId: null },
        ],
      },
      orderBy: { weekday: "asc" },
    });

    console.log(`📊 Regras encontradas: ${rules.length}`);
    rules.forEach(rule => {
      const dayName = getDayNameFromWeekday(rule.weekday);
      console.log(`   ${dayName}: ${rule.start}-${rule.end}`);
    });

    // Verificar se sexta-feira tem regras
    const fridayRules = rules.filter(rule => rule.weekday === 5);
    if (fridayRules.length > 0) {
      console.log('\n❌ PROBLEMA: Sexta-feira ainda tem regras!');
      console.log('   Isso explica por que os horários aparecem');
    } else {
      console.log('\n✅ CORRETO: Sexta-feira não tem regras');
      console.log('   Se os horários ainda aparecem, pode ser cache ou outro problema');
    }

    // Testar para hoje e amanhã
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
    } else if (fridayRules.length > 0) {
      console.log('❌ PROBLEMA: Sexta-feira ainda tem regras no banco!');
      console.log('   Solução: Verificar se o salvamento no painel admin está funcionando');
    } else {
      console.log('✅ Configuração do banco está correta');
      console.log('   Se os horários ainda aparecem, pode ser:');
      console.log('   1. Cache do navegador');
      console.log('   2. Problema na API de slots');
      console.log('   3. Problema no frontend');
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

testSlotsAPIDirect();

