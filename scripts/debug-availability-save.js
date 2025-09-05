#!/usr/bin/env node

/**
 * Script para debugar o salvamento de disponibilidade
 */

// Carregar variáveis de ambiente do arquivo .env.local
require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugAvailabilitySave() {
  try {
    console.log('🔍 Debugando salvamento de disponibilidade...');

    // Verificar se o banco está conectado
    await prisma.$connect();
    console.log('✅ Conexão com banco estabelecida');

    // Simular dados que seriam enviados pelo painel admin
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
        enabled: true,
        timeSlots: [
          { id: '9', startTime: '08:00', endTime: '12:00' },
          { id: '10', startTime: '14:00', endTime: '18:00' }
        ]
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

    console.log('📝 Dados de teste:');
    mockSchedule.forEach(day => {
      if (day.enabled) {
        console.log(`   ${day.day}: ${day.timeSlots.length} períodos`);
        day.timeSlots.forEach(slot => {
          console.log(`     ${slot.startTime} - ${slot.endTime}`);
        });
      } else {
        console.log(`   ${day.day}: DESABILITADO`);
      }
    });

    // Simular o processamento da API
    console.log('\n🔄 Processando dados...');
    
    const rulesToCreate = [];

    for (const day of mockSchedule) {
      if (day.enabled && day.timeSlots && day.timeSlots.length > 0) {
        for (const slot of day.timeSlots) {
          const weekday = getWeekdayNumber(day.day);
          rulesToCreate.push({
            weekday: weekday,
            start: slot.startTime,
            end: slot.endTime,
            serviceId: null, // Regra global
          });
          
          console.log(`   Criando regra: ${day.day} (${weekday}) ${slot.startTime}-${slot.endTime}`);
        }
      }
    }

    console.log(`\n📊 Total de regras a criar: ${rulesToCreate.length}`);

    // Verificar regras existentes
    const existingRules = await prisma.availabilityRule.findMany();
    console.log(`📊 Regras existentes: ${existingRules.length}`);

    // Mostrar regras por dia
    const rulesByDay = {};
    existingRules.forEach(rule => {
      const dayName = getDayNameFromWeekday(rule.weekday);
      if (!rulesByDay[dayName]) {
        rulesByDay[dayName] = [];
      }
      rulesByDay[dayName].push(`${rule.start}-${rule.end}`);
    });

    console.log('\n📅 Regras atuais por dia:');
    Object.keys(rulesByDay).forEach(day => {
      console.log(`   ${day}: ${rulesByDay[day].join(', ')}`);
    });

    console.log('\n💡 Diagnóstico:');
    if (!rulesByDay['Sexta']) {
      console.log('❌ PROBLEMA: Não há regras para sexta-feira!');
      console.log('   Isso explica por que não há horários disponíveis na sexta');
    }

  } catch (error) {
    console.error('❌ Erro durante o debug:', error);
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

debugAvailabilitySave();

