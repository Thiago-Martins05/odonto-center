require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugServiceRules() {
  try {
    console.log('🔍 Debugando regras específicas do serviço...\n');

    const serviceId = 'cmf5j4pj90000l20a36xac3tw';

    console.log(`🔧 Serviço: ${serviceId}\n`);

    // Buscar TODAS as regras (globais + específicas do serviço)
    const allRules = await prisma.availabilityRule.findMany({
      orderBy: { weekday: "asc" },
    });

    console.log(`📊 Total de regras no banco: ${allRules.length}`);

    // Separar regras globais e específicas
    const globalRules = allRules.filter(rule => rule.serviceId === null);
    const serviceRules = allRules.filter(rule => rule.serviceId === serviceId);

    console.log(`   Regras globais: ${globalRules.length}`);
    console.log(`   Regras específicas do serviço: ${serviceRules.length}\n`);

    // Simular exatamente a query da API
    const apiRules = await prisma.availabilityRule.findMany({
      where: {
        OR: [
          { serviceId: serviceId },
          { serviceId: null },
        ],
      },
      orderBy: { weekday: "asc" },
    });

    console.log(`🔍 Regras retornadas pela query da API: ${apiRules.length}\n`);

    const rulesByDay = {};
    apiRules.forEach(rule => {
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
          const type = rule.serviceId === null ? 'GLOBAL' : 'SERVIÇO';
          console.log(`   ✅ ${rule.start}-${rule.end} (${type}, ID: ${rule.id})`);
        });
      }
    });

    // Verificar especificamente sexta-feira
    const fridayRules = apiRules.filter(rule => rule.weekday === 5);
    console.log(`\n🔍 SEXTA-FEIRA - Regras retornadas pela API: ${fridayRules.length}`);
    
    if (fridayRules.length > 0) {
      console.log('   ❌ PROBLEMA: Sexta-feira tem regras!');
      fridayRules.forEach(rule => {
        const type = rule.serviceId === null ? 'GLOBAL' : 'SERVIÇO';
        console.log(`     - ${rule.start}-${rule.end} (${type}, ID: ${rule.id})`);
      });
    } else {
      console.log('   ✅ OK: Sexta-feira não tem regras');
    }

    // Verificar se há regras duplicadas
    console.log('\n🔍 Verificando regras duplicadas...');
    const duplicates = [];
    for (let i = 0; i < apiRules.length; i++) {
      for (let j = i + 1; j < apiRules.length; j++) {
        const rule1 = apiRules[i];
        const rule2 = apiRules[j];
        if (rule1.weekday === rule2.weekday && 
            rule1.start === rule2.start && 
            rule1.end === rule2.end) {
          duplicates.push({ rule1, rule2 });
        }
      }
    }

    if (duplicates.length > 0) {
      console.log(`   ❌ PROBLEMA: ${duplicates.length} regras duplicadas encontradas!`);
      duplicates.forEach((dup, index) => {
        const dayName = getDayNameFromWeekday(dup.rule1.weekday);
        console.log(`     ${index + 1}. ${dayName} ${dup.rule1.start}-${dup.rule1.end}`);
        console.log(`        ID1: ${dup.rule1.id} (serviceId: ${dup.rule1.serviceId})`);
        console.log(`        ID2: ${dup.rule2.id} (serviceId: ${dup.rule2.serviceId})`);
      });
    } else {
      console.log('   ✅ OK: Nenhuma regra duplicada encontrada');
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

debugServiceRules();
