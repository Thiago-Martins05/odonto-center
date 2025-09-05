require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAdminSaveFlow() {
  try {
    console.log('🔍 Testando fluxo completo de salvamento do painel admin...\n');

    // 1. Verificar estado inicial
    console.log('1️⃣ Estado inicial do banco:');
    const initialRules = await prisma.availabilityRule.findMany({
      orderBy: { weekday: "asc" },
    });
    console.log(`   Regras iniciais: ${initialRules.length}`);

    // 2. Simular dados que o painel admin deveria enviar
    console.log('\n2️⃣ Simulando dados do painel admin:');
    const mockSchedule = [
      { day: 'monday', enabled: true, timeSlots: [{ startTime: '08:00', endTime: '12:00' }, { startTime: '14:00', endTime: '18:00' }] },
      { day: 'tuesday', enabled: true, timeSlots: [{ startTime: '08:00', endTime: '12:00' }, { startTime: '14:00', endTime: '18:00' }] },
      { day: 'wednesday', enabled: true, timeSlots: [{ startTime: '08:00', endTime: '12:00' }, { startTime: '14:00', endTime: '18:00' }] },
      { day: 'thursday', enabled: true, timeSlots: [{ startTime: '08:00', endTime: '12:00' }, { startTime: '14:00', endTime: '18:00' }] }, // QUINTA ATIVA
      { day: 'friday', enabled: false, timeSlots: [] }, // SEXTA DESABILITADA
      { day: 'saturday', enabled: true, timeSlots: [{ startTime: '08:00', endTime: '12:00' }] },
      { day: 'sunday', enabled: false, timeSlots: [] }, // DOMINGO DESABILITADO
    ];

    console.log('   Dados que o painel admin deveria enviar:');
    mockSchedule.forEach(day => {
      const status = day.enabled ? '✅ ATIVO' : '❌ INATIVO';
      console.log(`   ${day.day}: ${status} (${day.timeSlots.length} horários)`);
    });

    // 3. Simular o processamento da API admin (POST)
    console.log('\n3️⃣ Simulando processamento da API admin:');
    
    // Limpar regras existentes
    await prisma.availabilityRule.deleteMany({});
    console.log('   ✅ Regras existentes removidas');

    // Criar novas regras
    const rulesToCreate = [];
    for (const day of mockSchedule) {
      if (day.enabled && day.timeSlots && day.timeSlots.length > 0) {
        for (const slot of day.timeSlots) {
          const rule = {
            weekday: getWeekdayNumber(day.day),
            start: slot.startTime,
            end: slot.endTime,
            serviceId: null,
          };
          rulesToCreate.push(rule);
        }
      }
    }

    if (rulesToCreate.length > 0) {
      await prisma.availabilityRule.createMany({
        data: rulesToCreate
      });
      console.log(`   ✅ ${rulesToCreate.length} regras criadas`);
    }

    // 4. Verificar resultado
    console.log('\n4️⃣ Verificando resultado após salvamento:');
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
      if (dayRules.length > 0) {
        dayRules.forEach(rule => {
          console.log(`     - ${rule.start}-${rule.end}`);
        });
      }
    });

    // 5. Simular chamada da API GET (para o painel admin)
    console.log('\n5️⃣ Simulando API GET para o painel admin:');
    const getResponse = {
      success: true,
      data: {
        rules: finalRules.map(rule => ({
          id: rule.id,
          weekday: rule.weekday,
          start: rule.start,
          end: rule.end,
          serviceId: rule.serviceId || undefined,
        })),
        blackouts: []
      }
    };

    console.log(`   API GET retorna: ${getResponse.data.rules.length} regras`);

    // 6. Simular processamento do frontend
    console.log('\n6️⃣ Simulando processamento do frontend:');
    const daysOfWeek = [
      { value: "monday", label: "Segunda-feira" },
      { value: "tuesday", label: "Terça-feira" },
      { value: "wednesday", label: "Quarta-feira" },
      { value: "thursday", label: "Quinta-feira" },
      { value: "friday", label: "Sexta-feira" },
      { value: "saturday", label: "Sábado" },
      { value: "sunday", label: "Domingo" },
    ];

    const scheduleMap = new Map();
    
    // Inicializar todos os dias como desabilitados
    daysOfWeek.forEach(day => {
      scheduleMap.set(day.value, {
        day: day.value,
        enabled: false,
        timeSlots: []
      });
    });
    
    // Processar regras do banco
    getResponse.data.rules.forEach(rule => {
      const dayName = getDayNameFromWeekday(rule.weekday);
      const existingDay = scheduleMap.get(dayName);
      
      if (existingDay) {
        existingDay.enabled = true;
        existingDay.timeSlots.push({
          id: rule.id,
          startTime: rule.start,
          endTime: rule.end
        });
      }
    });
    
    const schedule = Array.from(scheduleMap.values());

    console.log('   Schedule processado pelo frontend:');
    schedule.forEach(day => {
      const status = day.enabled ? '✅ ATIVO' : '❌ INATIVO';
      console.log(`   ${day.day}: ${status} (${day.timeSlots.length} horários)`);
    });

    console.log('\n✅ Teste do fluxo completo concluído!');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function getWeekdayNumber(dayName) {
  const dayMap = {
    'sunday': 0,
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6,
  };
  
  return dayMap[dayName.toLowerCase()] ?? 1;
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

testAdminSaveFlow();

