require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAdminSync() {
  try {
    console.log('🔍 Testando sincronização do painel admin...\n');

    // 1. Verificar estado inicial
    console.log('1️⃣ Estado inicial:');
    const initialRules = await prisma.availabilityRule.findMany({
      orderBy: { weekday: "asc" },
    });
    console.log(`   Regras iniciais: ${initialRules.length}`);

    // 2. Simular dados que o painel admin enviaria
    console.log('\n2️⃣ Simulando salvamento do painel admin:');
    const mockSchedule = [
      { day: 'monday', enabled: true, timeSlots: [{ startTime: '08:00', endTime: '12:00' }, { startTime: '14:00', endTime: '18:00' }] },
      { day: 'tuesday', enabled: true, timeSlots: [{ startTime: '08:00', endTime: '12:00' }, { startTime: '14:00', endTime: '18:00' }] },
      { day: 'wednesday', enabled: true, timeSlots: [{ startTime: '08:00', endTime: '12:00' }, { startTime: '14:00', endTime: '18:00' }] },
      { day: 'thursday', enabled: true, timeSlots: [{ startTime: '08:00', endTime: '12:00' }, { startTime: '14:00', endTime: '18:00' }] },
      { day: 'friday', enabled: false, timeSlots: [] }, // SEXTA DESABILITADA
      { day: 'saturday', enabled: true, timeSlots: [{ startTime: '08:00', endTime: '12:00' }] },
      { day: 'sunday', enabled: false, timeSlots: [] }, // DOMINGO DESABILITADO
    ];

    console.log('   Dados simulados:');
    mockSchedule.forEach(day => {
      const status = day.enabled ? '✅ ATIVO' : '❌ INATIVO';
      console.log(`   ${day.day}: ${status} (${day.timeSlots.length} horários)`);
    });

    // 3. Simular o processamento da API admin
    console.log('\n3️⃣ Processando salvamento...');
    
    // Limpar regras existentes
    await prisma.availabilityRule.deleteMany({});
    console.log('   ✅ Regras existentes removidas');

    // Criar novas regras
    const rulesToCreate = [];
    for (const day of mockSchedule) {
      if (day.enabled && day.timeSlots && day.timeSlots.length > 0) {
        for (const slot of day.timeSlots) {
          const rule = {
            weekday: getWeekdayNumber(day.day),
            start: slot.startTime,
            end: slot.endTime,
            serviceId: null,
          };
          rulesToCreate.push(rule);
        }
      }
    }

    if (rulesToCreate.length > 0) {
      await prisma.availabilityRule.createMany({
        data: rulesToCreate
      });
      console.log(`   ✅ ${rulesToCreate.length} regras criadas`);
    }

    // 4. Verificar resultado
    console.log('\n4️⃣ Verificando resultado:');
    const finalRules = await prisma.availabilityRule.findMany({
      orderBy: { weekday: "asc" },
    });

    console.log(`   Total de regras: ${finalRules.length}`);

    const rulesByDay = {};
    finalRules.forEach(rule => {
      const dayName = getDayNameFromWeekday(rule.weekday);
      if (!rulesByDay[dayName]) {
        rulesByDay[dayName] = [];
      }
      rulesByDay[dayName].push(rule);
    });

    const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    
    days.forEach(day => {
      const dayRules = rulesByDay[day] || [];
      console.log(`   ${day}: ${dayRules.length} regras`);
      if (dayRules.length > 0) {
        dayRules.forEach(rule => {
          console.log(`     - ${rule.start}-${rule.end}`);
        });
      }
    });

    // 5. Verificar se sexta-feira está corretamente desabilitada
    const fridayRules = finalRules.filter(rule => rule.weekday === 5);
    console.log(`\n🔍 SEXTA-FEIRA: ${fridayRules.length} regras`);
    
    if (fridayRules.length === 0) {
      console.log('   ✅ CORRETO: Sexta-feira desabilitada');
    } else {
      console.log('   ❌ PROBLEMA: Sexta-feira tem regras!');
    }

    console.log('\n✅ Teste de sincronização concluído!');

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

testAdminSync();

