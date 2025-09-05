require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugWeekdayMapping() {
  try {
    console.log('🔍 Debugando mapeamento de dias da semana...\n');

    // 1. Verificar regras atuais
    console.log('1️⃣ Regras atuais no banco:');
    const rules = await prisma.availabilityRule.findMany({
      orderBy: { weekday: "asc" },
    });

    console.log(`   Total de regras: ${rules.length}`);
    rules.forEach(rule => {
      const dayName = getDayNameFromWeekday(rule.weekday);
      console.log(`   ID: ${rule.id} | weekday: ${rule.weekday} | ${dayName} | ${rule.start}-${rule.end}`);
    });

    // 2. Testar mapeamento de dias
    console.log('\n2️⃣ Testando mapeamento de dias:');
    const testDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    testDays.forEach(day => {
      const weekday = getWeekdayNumber(day);
      const backToDay = getDayNameFromWeekday(weekday);
      console.log(`   ${day} -> weekday: ${weekday} -> ${backToDay} ${day === backToDay ? '✅' : '❌'}`);
    });

    // 3. Verificar se há regras duplicadas ou com weekday incorreto
    console.log('\n3️⃣ Verificando regras por weekday:');
    const rulesByWeekday = {};
    rules.forEach(rule => {
      if (!rulesByWeekday[rule.weekday]) {
        rulesByWeekday[rule.weekday] = [];
      }
      rulesByWeekday[rule.weekday].push(rule);
    });

    for (let weekday = 0; weekday <= 6; weekday++) {
      const dayRules = rulesByWeekday[weekday] || [];
      const dayName = getDayNameFromWeekday(weekday);
      console.log(`   weekday ${weekday} (${dayName}): ${dayRules.length} regras`);
      if (dayRules.length > 0) {
        dayRules.forEach(rule => {
          console.log(`     - ${rule.start}-${rule.end} (ID: ${rule.id})`);
        });
      }
    }

    // 4. Verificar se há regras com weekday inválido
    console.log('\n4️⃣ Verificando regras com weekday inválido:');
    const invalidRules = rules.filter(rule => rule.weekday < 0 || rule.weekday > 6);
    if (invalidRules.length > 0) {
      console.log(`   ❌ ${invalidRules.length} regras com weekday inválido:`);
      invalidRules.forEach(rule => {
        console.log(`     - ID: ${rule.id}, weekday: ${rule.weekday}`);
      });
    } else {
      console.log('   ✅ Todas as regras têm weekday válido');
    }

    // 5. Recriar regras corretas
    console.log('\n5️⃣ Recriando regras corretas:');
    
    // Limpar todas as regras
    await prisma.availabilityRule.deleteMany({});
    console.log('   ✅ Regras existentes removidas');

    // Criar regras corretas
    const correctRules = [
      // Segunda-feira
      { weekday: 1, start: '08:00', end: '12:00', serviceId: null },
      { weekday: 1, start: '14:00', end: '18:00', serviceId: null },
      // Terça-feira
      { weekday: 2, start: '08:00', end: '12:00', serviceId: null },
      { weekday: 2, start: '14:00', end: '18:00', serviceId: null },
      // Quarta-feira
      { weekday: 3, start: '08:00', end: '12:00', serviceId: null },
      { weekday: 3, start: '14:00', end: '18:00', serviceId: null },
      // Quinta-feira
      { weekday: 4, start: '08:00', end: '12:00', serviceId: null },
      { weekday: 4, start: '14:00', end: '18:00', serviceId: null },
      // Sábado
      { weekday: 6, start: '08:00', end: '12:00', serviceId: null },
    ];

    await prisma.availabilityRule.createMany({
      data: correctRules
    });
    console.log(`   ✅ ${correctRules.length} regras corretas criadas`);

    // 6. Verificar resultado final
    console.log('\n6️⃣ Verificando resultado final:');
    const finalRules = await prisma.availabilityRule.findMany({
      orderBy: { weekday: "asc" },
    });

    console.log(`   Total de regras: ${finalRules.length}`);
    finalRules.forEach(rule => {
      const dayName = getDayNameFromWeekday(rule.weekday);
      console.log(`   ${dayName} (${rule.weekday}): ${rule.start}-${rule.end}`);
    });

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

debugWeekdayMapping();

