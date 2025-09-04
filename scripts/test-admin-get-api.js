require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAdminGetAPI() {
  try {
    console.log('🔍 Testando API GET do painel admin...\n');

    // Simular exatamente o que a API GET faz
    const rules = await prisma.availabilityRule.findMany({
      orderBy: [{ weekday: 'asc' }, { start: 'asc' }]
    });

    const blackouts = await prisma.blackoutDate.findMany({
      orderBy: { date: 'asc' }
    });

    const response = {
      success: true,
      data: {
        rules: rules.map(rule => ({
          id: rule.id,
          weekday: rule.weekday,
          start: rule.start,
          end: rule.end,
          serviceId: rule.serviceId || undefined,
        })),
        blackouts: blackouts.map(blackout => ({
          id: blackout.id,
          date: blackout.date,
          reason: blackout.reason || "",
        }))
      }
    };

    console.log('📊 Resposta da API GET:');
    console.log(`   Success: ${response.success}`);
    console.log(`   Rules: ${response.data.rules.length}`);
    console.log(`   Blackouts: ${response.data.blackouts.length}`);

    console.log('\n📅 Regras encontradas:');
    response.data.rules.forEach(rule => {
      const dayName = getDayNameFromWeekday(rule.weekday);
      console.log(`   ${dayName} (${rule.weekday}): ${rule.start}-${rule.end}`);
    });

    // Simular o processamento do frontend
    console.log('\n🔄 Simulando processamento do frontend:');
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
    response.data.rules.forEach(rule => {
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

    console.log('\n📋 Schedule processado pelo frontend:');
    schedule.forEach(day => {
      const status = day.enabled ? '✅ ATIVO' : '❌ INATIVO';
      console.log(`   ${day.day}: ${status} (${day.timeSlots.length} horários)`);
      if (day.timeSlots.length > 0) {
        day.timeSlots.forEach(slot => {
          console.log(`     - ${slot.startTime}-${slot.endTime}`);
        });
      }
    });

    console.log('\n✅ Teste da API GET concluído!');

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

testAdminGetAPI();
