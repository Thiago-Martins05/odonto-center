#!/usr/bin/env node

/**
 * Script para testar o salvamento do painel administrativo
 */

// Carregar variáveis de ambiente do arquivo .env.local
require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAdminSave() {
  try {
    console.log('🧪 Testando salvamento do painel administrativo...');

    // Verificar se o banco está conectado
    await prisma.$connect();
    console.log('✅ Conexão com banco estabelecida');

    // 1. Verificar estado atual
    console.log('\n📊 Estado atual das regras:');
    const currentRules = await prisma.availabilityRule.findMany({
      orderBy: [{ weekday: 'asc' }, { start: 'asc' }]
    });

    const rulesByDay = {};
    currentRules.forEach(rule => {
      const dayName = getDayNameFromWeekday(rule.weekday);
      if (!rulesByDay[dayName]) {
        rulesByDay[dayName] = [];
      }
      rulesByDay[dayName].push(`${rule.start}-${rule.end}`);
    });

    Object.keys(rulesByDay).forEach(day => {
      console.log(`   ${day}: ${rulesByDay[day].join(', ')}`);
    });

    // 2. Simular dados que seriam enviados pelo painel admin (sexta desabilitada)
    console.log('\n🔄 Simulando salvamento com sexta desabilitada...');
    
    const mockSchedule = [
      {
        day: 'monday',
        enabled: true,
        timeSlots: [
          { id: '1', startTime: '08:00', endTime: '12:00' },
          { id: '2', startTime: '14:00', endTime: '18:00' }
        ]
      },
      {
        day: 'tuesday',
        enabled: true,
        timeSlots: [
          { id: '3', startTime: '08:00', endTime: '12:00' },
          { id: '4', startTime: '14:00', endTime: '18:00' }
        ]
      },
      {
        day: 'wednesday',
        enabled: true,
        timeSlots: [
          { id: '5', startTime: '08:00', endTime: '12:00' },
          { id: '6', startTime: '14:00', endTime: '18:00' }
        ]
      },
      {
        day: 'thursday',
        enabled: true,
        timeSlots: [
          { id: '7', startTime: '08:00', endTime: '12:00' },
          { id: '8', startTime: '14:00', endTime: '18:00' }
        ]
      },
      {
        day: 'friday',
        enabled: false, // SEXTA DESABILITADA
        timeSlots: []
      },
      {
        day: 'saturday',
        enabled: true,
        timeSlots: [
          { id: '11', startTime: '08:00', endTime: '12:00' }
        ]
      },
      {
        day: 'sunday',
        enabled: false,
        timeSlots: []
      }
    ];

    // 3. Simular o processamento da API (como em /api/admin/availability)
    console.log('📝 Processando dados...');
    
    // Limpar regras existentes
    await prisma.availabilityRule.deleteMany({});
    console.log('🗑️  Regras existentes removidas');

    // Criar novas regras baseadas no schedule
    const rulesToCreate = [];

    for (const day of mockSchedule) {
      if (day.enabled && day.timeSlots && day.timeSlots.length > 0) {
        for (const slot of day.timeSlots) {
          rulesToCreate.push({
            weekday: getWeekdayNumber(day.day),
            start: slot.startTime,
            end: slot.endTime,
            serviceId: null, // Regra global
          });
          
          console.log(`   ✅ ${day.day}: ${slot.startTime}-${slot.endTime}`);
        }
      } else {
        console.log(`   ❌ ${day.day}: DESABILITADO`);
      }
    }

    if (rulesToCreate.length > 0) {
      await prisma.availabilityRule.createMany({
        data: rulesToCreate
      });
      console.log(`📊 ${rulesToCreate.length} regras criadas`);
    }

    // 4. Verificar resultado
    console.log('\n📊 Estado após salvamento:');
    const newRules = await prisma.availabilityRule.findMany({
      orderBy: [{ weekday: 'asc' }, { start: 'asc' }]
    });

    const newRulesByDay = {};
    newRules.forEach(rule => {
      const dayName = getDayNameFromWeekday(rule.weekday);
      if (!newRulesByDay[dayName]) {
        newRulesByDay[dayName] = [];
      }
      newRulesByDay[dayName].push(`${rule.start}-${rule.end}`);
    });

    Object.keys(newRulesByDay).forEach(day => {
      console.log(`   ${day}: ${newRulesByDay[day].join(', ')}`);
    });

    // 5. Verificar se sexta foi removida
    if (newRulesByDay['Sexta']) {
      console.log('\n❌ PROBLEMA: Sexta-feira ainda tem regras!');
      console.log('   Isso indica que o salvamento não está funcionando corretamente');
    } else {
      console.log('\n✅ SUCESSO: Sexta-feira foi removida corretamente!');
    }

    console.log('\n💡 Diagnóstico:');
    console.log('   Se o teste acima funcionou, o problema pode estar:');
    console.log('   1. No frontend (dados não sendo enviados corretamente)');
    console.log('   2. Na API (dados não sendo processados corretamente)');
    console.log('   3. No cache do navegador');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function getWeekdayNumber(dayName) {
  const dayMap = {
    'sunday': 0,
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6,
  };
  
  return dayMap[dayName.toLowerCase()] ?? 1;
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

testAdminSave();
