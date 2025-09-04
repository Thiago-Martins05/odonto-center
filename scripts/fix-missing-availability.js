#!/usr/bin/env node

/**
 * Script para corrigir regras de disponibilidade faltantes
 */

// Carregar variáveis de ambiente do arquivo .env.local
require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixMissingAvailability() {
  try {
    console.log('🔧 Corrigindo regras de disponibilidade faltantes...');

    // Verificar se o banco está conectado
    await prisma.$connect();
    console.log('✅ Conexão com banco estabelecida');

    // Verificar regras existentes
    const existingRules = await prisma.availabilityRule.findMany();
    console.log(`📊 Regras existentes: ${existingRules.length}`);

    // Verificar quais dias têm regras
    const daysWithRules = new Set();
    existingRules.forEach(rule => {
      daysWithRules.add(rule.weekday);
    });

    console.log('📅 Dias com regras:', Array.from(daysWithRules).map(day => getDayNameFromWeekday(day)).join(', '));

    // Adicionar regras faltantes para sexta-feira
    const missingRules = [];

    // Sexta-feira (weekday 5) está faltando
    if (!daysWithRules.has(5)) {
      console.log('➕ Adicionando regras para sexta-feira...');
      missingRules.push(
        { weekday: 5, start: "08:00", end: "12:00", serviceId: null },
        { weekday: 5, start: "14:00", end: "18:00", serviceId: null }
      );
    }

    // Verificar se domingo tem regras (opcional)
    if (!daysWithRules.has(0)) {
      console.log('ℹ️  Domingo não tem regras (normal)');
    }

    if (missingRules.length > 0) {
      console.log(`📝 Criando ${missingRules.length} regras faltantes...`);
      
      for (const rule of missingRules) {
        await prisma.availabilityRule.create({
          data: rule
        });
        console.log(`   ✅ ${getDayNameFromWeekday(rule.weekday)}: ${rule.start} - ${rule.end}`);
      }

      console.log('🎉 Regras faltantes adicionadas com sucesso!');
    } else {
      console.log('✅ Todas as regras necessárias já existem');
    }

    // Verificar resultado final
    const finalRules = await prisma.availabilityRule.findMany({
      orderBy: [{ weekday: 'asc' }, { start: 'asc' }]
    });

    console.log('\n📊 Regras finais:');
    const rulesByDay = {};
    finalRules.forEach(rule => {
      const dayName = getDayNameFromWeekday(rule.weekday);
      if (!rulesByDay[dayName]) {
        rulesByDay[dayName] = [];
      }
      rulesByDay[dayName].push(`${rule.start}-${rule.end}`);
    });

    Object.keys(rulesByDay).forEach(day => {
      console.log(`   ${day}: ${rulesByDay[day].join(', ')}`);
    });

    console.log('\n✅ Correção concluída!');
    console.log('💡 Agora os horários devem aparecer corretamente no agendamento');

  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
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

fixMissingAvailability();
