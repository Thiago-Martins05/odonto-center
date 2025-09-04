require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugDayMapping() {
  try {
    console.log('🔍 Debugando mapeamento de dias da semana...\n');

    // 1. Verificar estado atual do banco
    console.log('1️⃣ Estado atual do banco:');
    const rules = await prisma.availabilityRule.findMany({
      orderBy: { weekday: "asc" },
    });

    console.log(`   Total de regras: ${rules.length}`);
    rules.forEach(rule => {
      const dayName = getDayNameFromWeekday(rule.weekday);
      console.log(`   weekday: ${rule.weekday} | ${dayName} | ${rule.start}-${rule.end}`);
    });

    // 2. Testar mapeamento JavaScript Date.getDay()
    console.log('\n2️⃣ Testando JavaScript Date.getDay():');
    const testDates = [
      '2025-09-01', // Segunda-feira
      '2025-09-02', // Terça-feira
      '2025-09-03', // Quarta-feira
      '2025-09-04', // Quinta-feira
      '2025-09-05', // Sexta-feira
      '2025-09-06', // Sábado
      '2025-09-07', // Domingo
    ];

    testDates.forEach(dateStr => {
      const date = new Date(dateStr);
      const weekday = date.getDay();
      const dayName = getDayNameFromWeekday(weekday);
      console.log(`   ${dateStr} -> weekday: ${weekday} -> ${dayName}`);
    });

    // 3. Verificar se há problema na função getDayNameFromWeekday
    console.log('\n3️⃣ Testando função getDayNameFromWeekday:');
    for (let weekday = 0; weekday <= 6; weekday++) {
      const dayName = getDayNameFromWeekday(weekday);
      console.log(`   weekday ${weekday} -> ${dayName}`);
    }

    // 4. Verificar se há problema na função getWeekdayNumber
    console.log('\n4️⃣ Testando função getWeekdayNumber:');
    const testDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    testDays.forEach(day => {
      const weekday = getWeekdayNumber(day);
      const backToDay = getDayNameFromWeekday(weekday);
      console.log(`   ${day} -> weekday: ${weekday} -> ${backToDay} ${day === backToDay ? '✅' : '❌'}`);
    });

    // 5. Simular o que deveria acontecer
    console.log('\n5️⃣ Simulando configuração correta:');
    console.log('   Painel admin: Segunda e Terça ATIVOS');
    console.log('   Deveria gerar: weekday 1 (monday) e weekday 2 (tuesday)');
    console.log('   Deveria aparecer: Segunda e Terça na página de agendamento');

    // 6. Verificar o que está acontecendo
    console.log('\n6️⃣ Verificando o que está acontecendo:');
    const mondayRules = rules.filter(rule => rule.weekday === 1);
    const tuesdayRules = rules.filter(rule => rule.weekday === 2);
    const sundayRules = rules.filter(rule => rule.weekday === 0);

    console.log(`   Regras de Segunda (weekday 1): ${mondayRules.length}`);
    console.log(`   Regras de Terça (weekday 2): ${tuesdayRules.length}`);
    console.log(`   Regras de Domingo (weekday 0): ${sundayRules.length}`);

    if (sundayRules.length > 0) {
      console.log('   ❌ PROBLEMA: Há regras de Domingo quando não deveria ter!');
      sundayRules.forEach(rule => {
        console.log(`     - ${rule.start}-${rule.end} (ID: ${rule.id})`);
      });
    }

    if (tuesdayRules.length === 0 && mondayRules.length > 0) {
      console.log('   ❌ PROBLEMA: Terça não tem regras mas Segunda tem!');
    }

    console.log('\n✅ Debug de mapeamento concluído!');

  } catch (error) {
    console.error('❌ Erro:', error);
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
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  };
  
  return dayMap[weekday] || 'monday';
}

debugDayMapping();
