require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function forceCacheClear() {
  try {
    console.log('🧹 Forçando limpeza de cache e verificando configurações...\n');

    // 1. Verificar se há regras de sexta-feira e removê-las
    console.log('1️⃣ Verificando e removendo regras de sexta-feira...');
    const fridayRules = await prisma.availabilityRule.findMany({
      where: { weekday: 5 }
    });
    
    console.log(`   Regras de sexta-feira encontradas: ${fridayRules.length}`);
    
    if (fridayRules.length > 0) {
      const deleteResult = await prisma.availabilityRule.deleteMany({
        where: { weekday: 5 }
      });
      console.log(`   ✅ ${deleteResult.count} regras de sexta-feira removidas`);
    } else {
      console.log('   ✅ Nenhuma regra de sexta-feira encontrada');
    }

    // 2. Verificar se há regras específicas do serviço
    console.log('\n2️⃣ Verificando regras específicas do serviço...');
    const serviceId = 'cmf5j4pj90000l20a36xac3tw';
    const serviceRules = await prisma.availabilityRule.findMany({
      where: { serviceId: serviceId }
    });
    
    console.log(`   Regras específicas do serviço: ${serviceRules.length}`);
    
    if (serviceRules.length > 0) {
      const deleteResult = await prisma.availabilityRule.deleteMany({
        where: { serviceId: serviceId }
      });
      console.log(`   ✅ ${deleteResult.count} regras específicas do serviço removidas`);
    } else {
      console.log('   ✅ Nenhuma regra específica do serviço encontrada');
    }

    // 3. Verificar se há regras duplicadas
    console.log('\n3️⃣ Verificando regras duplicadas...');
    const allRules = await prisma.availabilityRule.findMany({
      orderBy: { weekday: "asc" },
    });
    
    const duplicates = [];
    for (let i = 0; i < allRules.length; i++) {
      for (let j = i + 1; j < allRules.length; j++) {
        const rule1 = allRules[i];
        const rule2 = allRules[j];
        if (rule1.weekday === rule2.weekday && 
            rule1.start === rule2.start && 
            rule1.end === rule2.end &&
            rule1.serviceId === rule2.serviceId) {
          duplicates.push(rule2); // Marcar a segunda regra para remoção
        }
      }
    }
    
    console.log(`   Regras duplicadas encontradas: ${duplicates.length}`);
    
    if (duplicates.length > 0) {
      for (const duplicate of duplicates) {
        await prisma.availabilityRule.delete({
          where: { id: duplicate.id }
        });
      }
      console.log(`   ✅ ${duplicates.length} regras duplicadas removidas`);
    } else {
      console.log('   ✅ Nenhuma regra duplicada encontrada');
    }

    // 4. Verificar resultado final
    console.log('\n4️⃣ Verificação final...');
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
    });

    // 5. Verificar se sexta-feira ainda tem regras
    const finalFridayRules = finalRules.filter(rule => rule.weekday === 5);
    console.log(`\n🔍 SEXTA-FEIRA - Regras finais: ${finalFridayRules.length}`);
    
    if (finalFridayRules.length === 0) {
      console.log('   ✅ OK: Sexta-feira não tem regras');
    } else {
      console.log('   ❌ PROBLEMA: Sexta-feira ainda tem regras!');
      finalFridayRules.forEach(rule => {
        console.log(`     - ${rule.start}-${rule.end} (ID: ${rule.id})`);
      });
    }

    console.log('\n🧹 Limpeza de cache concluída!');
    console.log('   Agora teste a aplicação novamente.');

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

forceCacheClear();
