#!/usr/bin/env node

/**
 * Script para verificar as regras atuais no banco
 */

// Carregar variáveis de ambiente do arquivo .env.local
require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCurrentRules() {
  try {
    console.log('🔍 Verificando regras atuais no banco...');

    // Verificar se o banco está conectado
    await prisma.$connect();
    console.log('✅ Conexão com banco estabelecida');

    // Buscar todas as regras
    const rules = await prisma.availabilityRule.findMany({
      orderBy: [{ weekday: 'asc' }, { start: 'asc' }]
    });

    console.log(`📊 Total de regras: ${rules.length}`);

    if (rules.length === 0) {
      console.log('❌ Nenhuma regra encontrada!');
      return;
    }

    // Agrupar por dia
    const rulesByDay = {};
    rules.forEach(rule => {
      const dayName = getDayNameFromWeekday(rule.weekday);
      if (!rulesByDay[dayName]) {
        rulesByDay[dayName] = [];
      }
      rulesByDay[dayName].push(`${rule.start}-${rule.end}`);
    });

    console.log('\n📅 Regras por dia:');
    const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    
    days.forEach(day => {
      if (rulesByDay[day]) {
        console.log(`   ✅ ${day}: ${rulesByDay[day].join(', ')}`);
      } else {
        console.log(`   ❌ ${day}: SEM REGRAS`);
      }
    });

    // Verificar especificamente a sexta-feira
    if (rulesByDay['Sexta']) {
      console.log('\n❌ PROBLEMA: Sexta-feira ainda tem regras!');
      console.log('   Isso significa que a API não está removendo as regras corretamente');
    } else {
      console.log('\n✅ CORRETO: Sexta-feira não tem regras');
    }

    // Mostrar detalhes das regras
    console.log('\n📋 Detalhes das regras:');
    rules.forEach(rule => {
      const dayName = getDayNameFromWeekday(rule.weekday);
      console.log(`   ${rule.id}: ${dayName} (${rule.weekday}) ${rule.start}-${rule.end}`);
    });

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
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

checkCurrentRules();
