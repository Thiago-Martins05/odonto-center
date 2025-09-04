require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSlotsAPIFriday() {
  try {
    console.log('🔍 Testando API de slots especificamente para sexta-feira...\n');

    // Simular exatamente os parâmetros que estão sendo enviados
    const weekStart = '2025-09-01T16:05:58.318Z';
    const weekEnd = '2025-09-07T16:05:58.318Z';
    const serviceId = 'cmf5j4pj90000l20a36xac3tw';

    console.log('📅 Parâmetros:');
    console.log(`   weekStart: ${weekStart}`);
    console.log(`   weekEnd: ${weekEnd}`);
    console.log(`   serviceId: ${serviceId}\n`);

    // Parse dates exatamente como na API
    const startDate = new Date(weekStart);
    const endDate = new Date(weekEnd);
    
    const startDateStr = weekStart.split('T')[0];
    const endDateStr = weekEnd.split('T')[0];
    
    const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number);
    
    const normalizedStartDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
    const normalizedEndDate = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);

    console.log('📅 Datas normalizadas:');
    console.log(`   normalizedStartDate: ${normalizedStartDate.toISOString()}`);
    console.log(`   normalizedEndDate: ${normalizedEndDate.toISOString()}\n`);

    // Fetch availability rules
    const rules = await prisma.availabilityRule.findMany({
      where: {
        OR: [
          ...(serviceId ? [{ serviceId }] : []),
          { serviceId: null },
        ],
      },
      orderBy: { weekday: "asc" },
    });

    console.log(`🔍 Regras encontradas: ${rules.length}`);
    rules.forEach(rule => {
      const dayName = getDayNameFromWeekday(rule.weekday);
      console.log(`   ${dayName} (${rule.weekday}): ${rule.start}-${rule.end} (serviceId: ${rule.serviceId})`);
    });
    console.log('');

    // Simular geração de dias focando em sexta-feira
    console.log('📅 Simulando geração de dias (foco em sexta-feira):');
    const currentDate = new Date(normalizedStartDate);
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
    const todayDay = String(today.getDate()).padStart(2, '0');
    const todayString = `${todayYear}-${todayMonth}-${todayDay}`;

    while (currentDate <= normalizedEndDate) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      
      const weekday = currentDate.getDay();
      const dayName = getDayNameFromWeekday(weekday);
      
      const isDateInPast = dateKey < todayString;
      
      // Focar apenas em sexta-feira
      if (weekday === 5) { // Sexta-feira
        console.log(`   ${dateKey} (${dayName}, weekday: ${weekday}) - SEXTA-FEIRA:`);
        console.log(`     É data passada: ${isDateInPast}`);
        
        if (isDateInPast) {
          console.log(`     ❌ PULANDO - Data passada`);
        } else {
          // Find rules for this weekday
          const dayRules = rules.filter((rule) => rule.weekday === weekday);
          console.log(`     Regras para sexta-feira: ${dayRules.length}`);
          
          if (dayRules.length > 0) {
            dayRules.forEach(rule => {
              console.log(`       - ${rule.start}-${rule.end} (serviceId: ${rule.serviceId})`);
            });
            console.log(`     ✅ GERANDO SLOTS PARA SEXTA-FEIRA`);
          } else {
            console.log(`     ❌ PULANDO - Sem regras para sexta-feira`);
          }
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log('\n🔍 Verificação específica de sexta-feira:');
    const fridayRules = rules.filter(rule => rule.weekday === 5);
    console.log(`   Regras de sexta-feira: ${fridayRules.length}`);
    
    if (fridayRules.length === 0) {
      console.log('   ✅ CORRETO: Sexta-feira não tem regras, não deveria aparecer');
    } else {
      console.log('   ❌ PROBLEMA: Sexta-feira tem regras, mas não deveria ter');
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

testSlotsAPIFriday();
