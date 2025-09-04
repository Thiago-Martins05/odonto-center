require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function simulateAPICall() {
  try {
    console.log('🔍 Simulando chamada da API de slots...\n');

    // Simular exatamente os parâmetros que estão sendo enviados
    const weekStart = '2025-09-01T16:36:55.080Z';
    const weekEnd = '2025-09-07T16:36:55.080Z';
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

    // Fetch availability rules exatamente como na API
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

    // Log específico para sexta-feira
    const fridayRules = rules.filter(rule => rule.weekday === 5);
    console.log(`\n🔍 SEXTA-FEIRA - Regras encontradas: ${fridayRules.length}`);
    if (fridayRules.length > 0) {
      console.log(`   ❌ PROBLEMA: Sexta-feira tem regras!`);
      fridayRules.forEach(rule => {
        console.log(`     - ${rule.start}-${rule.end} (ID: ${rule.id})`);
      });
    } else {
      console.log(`   ✅ OK: Sexta-feira não tem regras`);
    }

    // Simular geração de dias focando em sexta-feira
    console.log('\n📅 Simulando geração de dias (foco em sexta-feira):');
    const currentDate = new Date(normalizedStartDate);
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
    const todayDay = String(today.getDate()).padStart(2, '0');
    const todayString = `${todayYear}-${todayMonth}-${todayDay}`;

    const daysMap = new Map();

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
            
            // Simular geração de slots
            const mockSlots = [
              '2025-09-06T08:00:00.000Z',
              '2025-09-06T08:15:00.000Z',
              '2025-09-06T08:30:00.000Z',
              '2025-09-06T08:45:00.000Z',
              '2025-09-06T09:00:00.000Z',
              '2025-09-06T09:15:00.000Z',
              '2025-09-06T09:30:00.000Z',
              '2025-09-06T09:45:00.000Z',
              '2025-09-06T10:00:00.000Z',
              '2025-09-06T10:15:00.000Z',
              '2025-09-06T10:30:00.000Z',
              '2025-09-06T10:45:00.000Z',
              '2025-09-06T11:00:00.000Z'
            ];
            daysMap.set(dateKey, mockSlots);
            console.log(`     📅 ${mockSlots.length} slots gerados para sexta-feira`);
          } else {
            console.log(`     ❌ PULANDO - Sem regras para sexta-feira`);
          }
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Verificar resultado final
    console.log('\n📊 Resultado final:');
    console.log(`   Dias com slots: ${daysMap.size}`);
    daysMap.forEach((slots, dateKey) => {
      const dayName = getDayNameFromWeekday(new Date(dateKey).getDay());
      console.log(`   ${dateKey} (${dayName}): ${slots.length} slots`);
    });

    if (daysMap.has('2025-09-06')) {
      console.log('\n❌ PROBLEMA: Sexta-feira (2025-09-06) tem slots gerados!');
      console.log('   Isso não deveria acontecer se não há regras para sexta-feira.');
    } else {
      console.log('\n✅ OK: Sexta-feira (2025-09-06) não tem slots gerados.');
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

simulateAPICall();
