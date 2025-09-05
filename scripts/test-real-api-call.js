require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testRealAPICall() {
  try {
    console.log('🔍 Testando chamada real da API de slots...\n');

    // 1. Verificar estado atual do banco
    console.log('1️⃣ Estado atual do banco:');
    const rules = await prisma.availabilityRule.findMany({
      orderBy: { weekday: "asc" },
    });

    console.log(`   Total de regras: ${rules.length}`);
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
      console.log(`   ${day}: ${dayRules.length} regras`);
      if (dayRules.length > 0) {
        dayRules.forEach(rule => {
          console.log(`     - ${rule.start}-${rule.end}`);
        });
      }
    });

    // 2. Simular exatamente a chamada da API de slots
    console.log('\n2️⃣ Simulando chamada da API de slots:');
    
    // Parâmetros que o frontend envia
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Segunda-feira
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Domingo
    weekEnd.setHours(23, 59, 59, 999);

    const serviceId = 'cmf5j4pj90000l20a36xac3tw'; // ID do serviço "extração"

    console.log(`   weekStart: ${weekStart.toISOString()}`);
    console.log(`   weekEnd: ${weekEnd.toISOString()}`);
    console.log(`   serviceId: ${serviceId}`);

    // 3. Simular exatamente a lógica da API
    console.log('\n3️⃣ Simulando lógica da API:');
    
    // Parse dates
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

    // Fetch availability rules - ONLY GLOBAL RULES
    const apiRules = await prisma.availabilityRule.findMany({
      where: {
        serviceId: null, // Only global rules
      },
      orderBy: { weekday: "asc" },
    });

    console.log(`   Regras globais encontradas: ${apiRules.length}`);
    apiRules.forEach(rule => {
      const dayName = getDayNameFromWeekday(rule.weekday);
      console.log(`     ${dayName}: ${rule.start}-${rule.end}`);
    });

    // 4. Simular geração de dias
    console.log('\n4️⃣ Simulando geração de dias:');
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

      console.log(`   ${dateKey} (${dayName}):`);
      console.log(`     É data passada: ${isDateInPast}`);

      if (!isDateInPast) {
        // Find rules for this weekday
        const dayRules = apiRules.filter((rule) => rule.weekday === weekday);
        console.log(`     Regras para este dia: ${dayRules.length}`);

        if (dayRules.length > 0) {
          console.log(`     ✅ GERANDO SLOTS`);
          // Simular slots (simplificado)
          const mockSlots = ['08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45'];
          daysMap.set(dateKey, mockSlots);
          console.log(`     ${mockSlots.length} slots simulados`);
        } else {
          console.log(`     ❌ SEM REGRAS - não gera slots`);
        }
      } else {
        console.log(`     ❌ DATA PASSADA - pula`);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 5. Resultado final
    console.log('\n5️⃣ Resultado final:');
    console.log(`   Dias com slots: ${daysMap.size}`);
    daysMap.forEach((slots, dateKey) => {
      const date = new Date(dateKey);
      const dayName = getDayNameFromWeekday(date.getDay());
      console.log(`   ${dateKey} (${dayName}): ${slots.length} slots`);
    });

    console.log('\n✅ Teste da API real concluído!');

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

testRealAPICall();

