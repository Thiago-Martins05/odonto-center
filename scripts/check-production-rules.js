require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProductionRules() {
  try {
    console.log('🔍 Verificando regras no banco de PRODUÇÃO...\n');

    const rules = await prisma.availabilityRule.findMany({
      orderBy: { weekday: "asc" },
    });

    console.log(`📊 Total de regras: ${rules.length}\n`);

    const rulesByDay = {};
    rules.forEach(rule => {
      const dayName = getDayNameFromWeekday(rule.weekday);
      if (!rulesByDay[dayName]) {
        rulesByDay[dayName] = [];
      }
      rulesByDay[dayName].push(rule);
    });

    const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    
    days.forEach(day => {
      const dayRules = rulesByDay[day] || [];
      console.log(`${day}:`);
      if (dayRules.length === 0) {
        console.log(`   ❌ SEM REGRAS`);
      } else {
        dayRules.forEach(rule => {
          console.log(`   ✅ ${rule.start}-${rule.end} (ID: ${rule.id})`);
        });
      }
    });

    console.log('\n🔍 Verificação específica de sexta-feira:');
    const fridayRules = rules.filter(rule => rule.weekday === 5);
    console.log(`   Regras de sexta-feira: ${fridayRules.length}`);
    
    if (fridayRules.length > 0) {
      console.log('   ❌ PROBLEMA: Sexta-feira tem regras no banco de produção!');
      fridayRules.forEach(rule => {
        console.log(`     - ${rule.start}-${rule.end} (ID: ${rule.id})`);
      });
      
      console.log('\n🔧 Removendo regras de sexta-feira...');
      const deleteResult = await prisma.availabilityRule.deleteMany({
        where: { weekday: 5 }
      });
      console.log(`   ✅ ${deleteResult.count} regras de sexta-feira removidas`);
      
    } else {
      console.log('   ✅ OK: Sexta-feira não tem regras no banco de produção');
    }

    // Verificar resultado final
    const finalRules = await prisma.availabilityRule.findMany({
      orderBy: { weekday: "asc" },
    });

    console.log(`\n📊 Total de regras após limpeza: ${finalRules.length}`);

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

checkProductionRules();

