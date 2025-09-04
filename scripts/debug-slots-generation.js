require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugSlotsGeneration() {
  try {
    console.log('🔍 Debugando geração de slots...\n');

    // 1. Verificar regras no banco
    console.log('1️⃣ Regras no banco:');
    const rules = await prisma.availabilityRule.findMany({
      where: { serviceId: null },
      orderBy: { weekday: "asc" },
    });

    console.log(`   Total de regras: ${rules.length}`);
    rules.forEach(rule => {
      const dayName = getDayNameFromWeekday(rule.weekday);
      console.log(`   ${dayName} (weekday ${rule.weekday}): ${rule.start}-${rule.end}`);
    });

    // 2. Simular exatamente a lógica da API de slots
    console.log('\n2️⃣ Simulando lógica da API de slots:');
    
    // Parâmetros que o frontend envia
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Segunda-feira
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Domingo
    weekEnd.setHours(23, 59, 59, 999);

    console.log(`   weekStart: ${weekStart.toISOString()}`);
    console.log(`   weekEnd: ${weekEnd.toISOString()}`);

    // Parse dates exatamente como na API
    const startDate = new Date(weekStart);
    const endDate = new Date(weekEnd);
    
    const startDateStr = weekStart.toISOString().split('T')[0];
    const endDateStr = weekEnd.toISOString().split('T')[0];
    
    const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number);
    
    const normalizedStartDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
    const normalizedEndDate = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);

    console.log(`   normalizedStartDate: ${normalizedStartDate.toISOString()}`);
    console.log(`   normalizedEndDate: ${normalizedEndDate.toISOString()}`);

    // 3. Simular geração de dias
    console.log('\n3️⃣ Simulando geração de dias:');
    const daysMap = new Map();
    const currentDate = new Date(normalizedStartDate);

    while (currentDate <= normalizedEndDate) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      
      const weekday = currentDate.getDay();
      const dayName = getDayNameFromWeekday(weekday);

      // Check if this date is in the past
      const today = new Date();
      const todayYear = today.getFullYear();
      const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
      const todayDay = String(today.getDate()).padStart(2, '0');
      const todayString = `${todayYear}-${todayMonth}-${todayDay}`;
      
      const isDateInPast = dateKey < todayString;

      console.log(`   ${dateKey} (${dayName}, weekday: ${weekday}):`);
      console.log(`     É data passada: ${isDateInPast}`);

      if (!isDateInPast) {
        // Find rules for this weekday
        const dayRules = rules.filter((rule) => rule.weekday === weekday);
        console.log(`     Regras para este dia: ${dayRules.length}`);

        if (dayRules.length > 0) {
          console.log(`     ✅ GERANDO SLOTS`);
          dayRules.forEach(rule => {
            console.log(`       - ${rule.start}-${rule.end}`);
          });
          // Simular slots
          const mockSlots = ['08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45'];
          daysMap.set(dateKey, mockSlots);
        } else {
          console.log(`     ❌ SEM REGRAS - não gera slots`);
        }
      } else {
        console.log(`     ❌ DATA PASSADA - pula`);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 4. Resultado final
    console.log('\n4️⃣ Resultado final:');
    console.log(`   Dias com slots: ${daysMap.size}`);
    daysMap.forEach((slots, dateKey) => {
      const date = new Date(dateKey);
      const weekday = date.getDay();
      const dayName = getDayNameFromWeekday(weekday);
      console.log(`   ${dateKey} (${dayName}, weekday: ${weekday}): ${slots.length} slots`);
    });

    // 5. Verificar se há problema
    console.log('\n5️⃣ Verificando se há problema:');
    const expectedDays = ['monday', 'tuesday'];
    const actualDays = [];
    
    daysMap.forEach((slots, dateKey) => {
      const date = new Date(dateKey);
      const weekday = date.getDay();
      const dayName = getDayNameFromWeekday(weekday);
      actualDays.push(dayName);
    });

    console.log(`   Dias esperados: ${expectedDays.join(', ')}`);
    console.log(`   Dias encontrados: ${actualDays.join(', ')}`);

    if (actualDays.includes('sunday') && !expectedDays.includes('sunday')) {
      console.log('   ❌ PROBLEMA: Domingo aparece quando não deveria!');
    }

    if (!actualDays.includes('tuesday') && expectedDays.includes('tuesday')) {
      console.log('   ❌ PROBLEMA: Terça não aparece quando deveria!');
    }

    console.log('\n✅ Debug de geração de slots concluído!');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
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

debugSlotsGeneration();
