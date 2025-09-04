require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkVercelDatabase() {
  try {
    console.log('🔍 Verificando banco de dados do VERCEL (produção)...\n');

    // Verificar se estamos conectando ao banco correto
    console.log('📊 Informações da conexão:');
    console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? 'Definida' : 'NÃO DEFINIDA'}`);
    if (process.env.DATABASE_URL) {
      const url = new URL(process.env.DATABASE_URL);
      console.log(`   Host: ${url.hostname}`);
      console.log(`   Database: ${url.pathname.substring(1)}`);
      console.log(`   Provider: ${url.protocol.replace(':', '')}`);
    }
    console.log('');

    // Buscar TODAS as regras
    const allRules = await prisma.availabilityRule.findMany({
      orderBy: { weekday: "asc" },
    });

    console.log(`📊 Total de regras no banco VERCEL: ${allRules.length}\n`);

    // Agrupar por dia da semana
    const rulesByDay = {};
    allRules.forEach(rule => {
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

    // Verificação específica de sexta-feira
    console.log('\n🔍 VERIFICAÇÃO ESPECÍFICA DE SEXTA-FEIRA:');
    const fridayRules = allRules.filter(rule => rule.weekday === 5);
    console.log(`   Regras de sexta-feira: ${fridayRules.length}`);
    
    if (fridayRules.length > 0) {
      console.log('   ❌ PROBLEMA ENCONTRADO: Sexta-feira tem regras no banco VERCEL!');
      fridayRules.forEach(rule => {
        console.log(`     - ${rule.start}-${rule.end} (ID: ${rule.id})`);
        console.log(`       serviceId: ${rule.serviceId}`);
        console.log(`       createdAt: ${rule.createdAt}`);
        console.log(`       updatedAt: ${rule.updatedAt}`);
      });
      
      console.log('\n🔧 REMOVENDO regras de sexta-feira do banco VERCEL...');
      const deleteResult = await prisma.availabilityRule.deleteMany({
        where: { weekday: 5 }
      });
      console.log(`   ✅ ${deleteResult.count} regras de sexta-feira removidas do banco VERCEL`);
      
    } else {
      console.log('   ✅ OK: Sexta-feira não tem regras no banco VERCEL');
    }

    // Verificar se há regras específicas do serviço
    console.log('\n🔍 VERIFICANDO regras específicas do serviço...');
    const serviceId = 'cmf5j4pj90000l20a36xac3tw';
    const serviceRules = allRules.filter(rule => rule.serviceId === serviceId);
    console.log(`   Regras específicas do serviço ${serviceId}: ${serviceRules.length}`);
    
    if (serviceRules.length > 0) {
      console.log('   ❌ PROBLEMA: Há regras específicas do serviço!');
      serviceRules.forEach(rule => {
        const dayName = getDayNameFromWeekday(rule.weekday);
        console.log(`     - ${dayName}: ${rule.start}-${rule.end} (ID: ${rule.id})`);
      });
    } else {
      console.log('   ✅ OK: Nenhuma regra específica do serviço');
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

checkVercelDatabase();
