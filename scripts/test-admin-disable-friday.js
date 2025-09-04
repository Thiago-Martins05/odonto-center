require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAdminDisableFriday() {
  try {
    console.log('🔍 Testando desabilitação de sexta-feira no painel admin...\n');

    // Simular o que o painel admin envia quando sexta-feira é desabilitada
    const schedule = [
      { day: 'monday', enabled: true, timeSlots: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
      { day: 'tuesday', enabled: true, timeSlots: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
      { day: 'wednesday', enabled: true, timeSlots: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
      { day: 'thursday', enabled: true, timeSlots: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
      { day: 'friday', enabled: false, timeSlots: [] }, // SEXTA DESABILITADA
      { day: 'saturday', enabled: true, timeSlots: [{ start: '08:00', end: '12:00' }] },
      { day: 'sunday', enabled: false, timeSlots: [] }, // DOMINGO DESABILITADO
    ];

    console.log('📤 Dados que o painel admin enviaria:');
    schedule.forEach(day => {
      const status = day.enabled ? '✅ ATIVO' : '❌ INATIVO';
      console.log(`   ${day.day}: ${status} (${day.timeSlots.length} horários)`);
    });
    console.log('');

    // Simular o processamento da API admin/availability
    console.log('🔄 Processando salvamento...\n');

    // Primeiro, verificar regras atuais
    const currentRules = await prisma.availabilityRule.findMany({
      orderBy: { weekday: "asc" },
    });

    console.log(`📊 Regras atuais: ${currentRules.length}`);
    currentRules.forEach(rule => {
      const dayName = getDayNameFromWeekday(rule.weekday);
      console.log(`   ${dayName} (${rule.weekday}): ${rule.start}-${rule.end}`);
    });
    console.log('');

    // Simular o que a API deveria fazer
    const weekdayMap = {
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6,
      'sunday': 0,
    };

    for (const dayData of schedule) {
      const weekday = weekdayMap[dayData.day];
      const dayName = getDayNameFromWeekday(weekday);
      
      console.log(`🔧 Processando ${dayName} (${dayData.day}):`);
      console.log(`   Habilitado: ${dayData.enabled}`);
      console.log(`   Horários: ${dayData.timeSlots.length}`);
      
      if (dayData.enabled && dayData.timeSlots.length > 0) {
        console.log(`   ✅ Deveria ter regras`);
        dayData.timeSlots.forEach(slot => {
          console.log(`     - ${slot.start}-${slot.end}`);
        });
      } else {
        console.log(`   ❌ Deveria NÃO ter regras (será removido)`);
      }
      console.log('');
    }

    // Verificar se sexta-feira tem regras no banco
    const fridayRules = await prisma.availabilityRule.findMany({
      where: { weekday: 5 }, // Sexta-feira
    });

    console.log(`🔍 Regras de sexta-feira no banco: ${fridayRules.length}`);
    fridayRules.forEach(rule => {
      console.log(`   ${rule.start}-${rule.end} (ID: ${rule.id})`);
    });

    if (fridayRules.length > 0) {
      console.log('\n❌ PROBLEMA: Sexta-feira ainda tem regras no banco!');
      console.log('   Isso significa que o painel admin não está removendo as regras corretamente.');
    } else {
      console.log('\n✅ OK: Sexta-feira não tem regras no banco.');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
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

testAdminDisableFriday();
