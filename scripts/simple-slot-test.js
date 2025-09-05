require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function simpleSlotTest() {
  try {
    console.log('🔍 Teste simples de slots...\n');

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

    // 2. Buscar agendamentos para hoje
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    
    const appointments = await prisma.appointment.findMany({
      where: {
        startsAt: { gte: todayStart, lte: todayEnd },
        status: { not: "cancelled" },
      },
      select: { id: true, startsAt: true, endsAt: true },
    });

    console.log(`\n2️⃣ Agendamentos para hoje: ${appointments.length}`);
    appointments.forEach(apt => {
      const start = apt.startsAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const end = apt.endsAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      console.log(`   ${start} - ${end}`);
    });

    // 3. Simular geração de slots manualmente
    console.log('\n3️⃣ Simulando geração de slots:');
    
    const thursdayRules = rules.filter(rule => rule.weekday === 4);
    if (thursdayRules.length > 0) {
      const rule = thursdayRules[0];
      console.log(`   Regra: ${rule.start}-${rule.end}`);
      
      // Parse horários
      const [startHour, startMin] = rule.start.split(':').map(Number);
      const [endHour, endMin] = rule.end.split(':').map(Number);
      
      console.log(`   Início: ${startHour}:${startMin.toString().padStart(2, '0')}`);
      console.log(`   Fim: ${endHour}:${endMin.toString().padStart(2, '0')}`);
      
      // Calcular buffer time
      const now = new Date();
      const bufferMin = 10;
      const bufferTime = new Date(now.getTime() + bufferMin * 60 * 1000);
      
      console.log(`   Buffer time: ${bufferTime.toLocaleTimeString('pt-BR')}`);
      
      // Gerar slots
      const slots = [];
      const stepMin = 15;
      const serviceDurationMin = 60;
      
      for (let hour = startHour; hour < endHour; hour++) {
        for (let min = 0; min < 60; min += stepMin) {
          const slotStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, min, 0, 0);
          const slotEnd = new Date(slotStart.getTime() + serviceDurationMin * 60 * 1000);
          
          // Verificar se slot é no futuro
          const isInFuture = slotStart >= bufferTime;
          
          // Verificar se slot termina antes do fim da regra
          const ruleEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), endHour, endMin, 0, 0);
          const endsBeforeRule = slotEnd <= ruleEnd;
          
          // Verificar conflitos com agendamentos
          const hasConflict = appointments.some(apt => {
            return slotStart < apt.endsAt && slotEnd > apt.startsAt;
          });
          
          if (isInFuture && endsBeforeRule && !hasConflict) {
            slots.push(slotStart);
          }
        }
      }
      
      console.log(`   Slots gerados: ${slots.length}`);
      
      if (slots.length > 0) {
        console.log(`   Primeiro slot: ${slots[0].toLocaleTimeString('pt-BR')}`);
        console.log(`   Último slot: ${slots[slots.length - 1].toLocaleTimeString('pt-BR')}`);
        
        // Mostrar alguns slots
        console.log('\n   Primeiros 5 slots:');
        slots.slice(0, 5).forEach((slot, index) => {
          const time = slot.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          console.log(`     ${index + 1}. ${time}`);
        });
        
        if (slots.length > 5) {
          console.log(`     ... e mais ${slots.length - 5} slots`);
        }
      }
    }

    console.log('\n✅ Teste simples concluído!');

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

simpleSlotTest();

