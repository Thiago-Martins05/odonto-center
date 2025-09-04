require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { getDailySlots } = require('../src/lib/availability');

const prisma = new PrismaClient();

async function debugSlotGeneration() {
  try {
    console.log('🔍 Debugando geração de slots...\n');

    // 1. Buscar regras do banco
    const rules = await prisma.availabilityRule.findMany({
      where: { serviceId: null },
      orderBy: { weekday: "asc" },
    });

    console.log('1️⃣ Regras no banco:');
    rules.forEach(rule => {
      const dayName = getDayNameFromWeekday(rule.weekday);
      console.log(`   ${dayName} (weekday ${rule.weekday}): ${rule.start}-${rule.end}`);
    });

    // 2. Testar geração de slots para hoje (quinta-feira)
    const today = new Date();
    const todayWeekday = today.getDay();
    
    if (todayWeekday === 4) { // Quinta-feira
      console.log('\n2️⃣ Testando geração de slots para hoje:');
      
      // Buscar regras para quinta-feira
      const thursdayRules = rules.filter(rule => rule.weekday === 4);
      console.log(`   Regras para quinta-feira: ${thursdayRules.length}`);
      
      if (thursdayRules.length > 0) {
        // Converter para formato da função getDailySlots
        const availabilityRules = thursdayRules.map(rule => ({
          id: rule.id,
          weekday: rule.weekday,
          start: rule.start,
          end: rule.end,
          serviceId: rule.serviceId || undefined,
        }));

        // Buscar agendamentos existentes
        const existingAppointments = await prisma.appointment.findMany({
          where: {
            startsAt: {
              gte: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0),
              lte: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999),
            },
            status: { not: "cancelled" },
          },
          select: { id: true, startsAt: true, endsAt: true },
        });

        console.log(`   Agendamentos existentes: ${existingAppointments.length}`);

        // Gerar slots
        const slots = getDailySlots({
          date: today,
          serviceDurationMin: 60, // 1 hora
          rules: availabilityRules,
          blackouts: [],
          existingAppointments: existingAppointments,
          stepMin: 15,
          bufferMin: 10,
        });

        console.log(`   Slots gerados: ${slots.length}`);
        
        if (slots.length > 0) {
          console.log(`   Primeiro slot: ${slots[0].toISOString()}`);
          console.log(`   Último slot: ${slots[slots.length - 1].toISOString()}`);
          
          // Mostrar alguns slots
          console.log('\n   Primeiros 5 slots:');
          slots.slice(0, 5).forEach((slot, index) => {
            const time = slot.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            console.log(`     ${index + 1}. ${time} (${slot.toISOString()})`);
          });
          
          if (slots.length > 5) {
            console.log(`     ... e mais ${slots.length - 5} slots`);
          }
        }
      }
    } else {
      console.log('\n2️⃣ Hoje não é quinta-feira, não é possível testar');
    }

    // 3. Testar com data específica (quinta-feira)
    console.log('\n3️⃣ Testando com data específica (quinta-feira):');
    const testDate = new Date(2025, 8, 4); // 4 de setembro de 2025
    
    const thursdayRules = rules.filter(rule => rule.weekday === 4);
    if (thursdayRules.length > 0) {
      const availabilityRules = thursdayRules.map(rule => ({
        id: rule.id,
        weekday: rule.weekday,
        start: rule.start,
        end: rule.end,
        serviceId: rule.serviceId || undefined,
      }));

      const slots = getDailySlots({
        date: testDate,
        serviceDurationMin: 60,
        rules: availabilityRules,
        blackouts: [],
        existingAppointments: [],
        stepMin: 15,
        bufferMin: 10,
      });

      console.log(`   Slots gerados para ${testDate.toISOString().split('T')[0]}: ${slots.length}`);
      
      if (slots.length > 0) {
        console.log(`   Primeiro slot: ${slots[0].toISOString()}`);
        console.log(`   Último slot: ${slots[slots.length - 1].toISOString()}`);
      }
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

debugSlotGeneration();
