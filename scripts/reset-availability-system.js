require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetAvailabilitySystem() {
  try {
    console.log('🔄 Resetando sistema de disponibilidade...\n');

    // 1. Limpar TODAS as regras existentes
    console.log('1️⃣ Limpando todas as regras existentes...');
    const deleteAllRules = await prisma.availabilityRule.deleteMany({});
    console.log(`   ✅ ${deleteAllRules.count} regras removidas`);

    // 2. Criar regras padrão (segunda a quinta + sábado)
    console.log('\n2️⃣ Criando regras padrão...');
    const defaultRules = [
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

    const createdRules = await prisma.availabilityRule.createMany({
      data: defaultRules,
    });

    console.log(`   ✅ ${createdRules.count} regras criadas`);

    // 3. Verificar resultado
    console.log('\n3️⃣ Verificando resultado...');
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

    console.log('\n✅ Sistema de disponibilidade resetado com sucesso!');
    console.log('   - Segunda a Quinta: 08:00-12:00, 14:00-18:00');
    console.log('   - Sábado: 08:00-12:00');
    console.log('   - Sexta e Domingo: SEM REGRAS (desabilitados)');

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

resetAvailabilitySystem();

