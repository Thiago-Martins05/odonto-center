require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCurrentState() {
  try {
    console.log('🔍 Verificando estado atual do sistema...\n');

    // 1. Verificar regras de disponibilidade
    console.log('1️⃣ Regras de disponibilidade:');
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
          console.log(`     - ${rule.start}-${rule.end} (serviceId: ${rule.serviceId})`);
        });
      }
    });

    // 2. Verificar serviços
    console.log('\n2️⃣ Serviços disponíveis:');
    const services = await prisma.service.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });

    console.log(`   Total de serviços: ${services.length}`);
    services.forEach(service => {
      console.log(`   - ${service.name}: ${service.durationMin}min (ID: ${service.id})`);
    });

    // 3. Verificar agendamentos existentes
    console.log('\n3️⃣ Agendamentos existentes:');
    const appointments = await prisma.appointment.findMany({
      where: {
        status: { not: "cancelled" },
        startsAt: { gte: new Date() },
      },
      orderBy: { startsAt: "asc" },
      take: 10, // Apenas os próximos 10
    });

    console.log(`   Próximos agendamentos: ${appointments.length}`);
    appointments.forEach(appointment => {
      const date = appointment.startsAt.toLocaleDateString('pt-BR');
      const time = appointment.startsAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      console.log(`   - ${date} ${time}: ${appointment.status}`);
    });

    // 4. Verificar datas bloqueadas
    console.log('\n4️⃣ Datas bloqueadas:');
    const blackouts = await prisma.blackoutDate.findMany({
      where: {
        date: { gte: new Date() },
      },
      orderBy: { date: "asc" },
    });

    console.log(`   Total de datas bloqueadas: ${blackouts.length}`);
    blackouts.forEach(blackout => {
      const date = blackout.date.toLocaleDateString('pt-BR');
      console.log(`   - ${date}: ${blackout.reason || 'Sem motivo'}`);
    });

    // 5. Simular chamada da API de slots
    console.log('\n5️⃣ Simulando API de slots para próxima semana:');
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1); // Segunda-feira
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Domingo
    weekEnd.setHours(23, 59, 59, 999);

    console.log(`   Semana: ${weekStart.toLocaleDateString('pt-BR')} - ${weekEnd.toLocaleDateString('pt-BR')}`);

    // Simular geração de slots
    const currentDate = new Date(weekStart);
    const daysWithSlots = [];

    while (currentDate <= weekEnd) {
      const weekday = currentDate.getDay();
      const dayRules = rules.filter(rule => rule.weekday === weekday);
      
      if (dayRules.length > 0) {
        const dayName = getDayNameFromWeekday(weekday);
        const dateStr = currentDate.toLocaleDateString('pt-BR');
        daysWithSlots.push(`${dayName} (${dateStr}): ${dayRules.length} regras`);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(`   Dias com slots disponíveis: ${daysWithSlots.length}`);
    daysWithSlots.forEach(day => {
      console.log(`   - ${day}`);
    });

    console.log('\n✅ Verificação concluída!');

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

checkCurrentState();
