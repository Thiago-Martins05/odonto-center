require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugTimeRange() {
  try {
    console.log('🔍 Debugando problema de horários...\n');

    // 1. Verificar regras atuais no banco
    console.log('1️⃣ Regras atuais no banco:');
    const rules = await prisma.availabilityRule.findMany({
      where: { serviceId: null },
      orderBy: [{ weekday: "asc" }, { start: "asc" }],
    });

    console.log(`   Total de regras: ${rules.length}`);
    rules.forEach(rule => {
      const dayName = getDayNameFromWeekday(rule.weekday);
      console.log(`   ${dayName} (weekday ${rule.weekday}): ${rule.start}-${rule.end}`);
    });

    // 2. Verificar se há regra para quinta-feira (weekday 4)
    console.log('\n2️⃣ Verificando regras para quinta-feira:');
    const thursdayRules = rules.filter(rule => rule.weekday === 4);
    console.log(`   Regras para quinta-feira: ${thursdayRules.length}`);
    
    thursdayRules.forEach(rule => {
      console.log(`     - ${rule.start}-${rule.end} (ID: ${rule.id})`);
    });

    // 3. Testar API de slots para hoje
    console.log('\n3️⃣ Testando API de slots para hoje:');
    const today = new Date();
    const todayWeekday = today.getDay();
    const todayName = getDayNameFromWeekday(todayWeekday);
    
    console.log(`   Hoje: ${today.toISOString().split('T')[0]} (${todayName}, weekday: ${todayWeekday})`);
    
    // Se hoje é quinta-feira, testar a API
    if (todayWeekday === 4) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay() + 1);
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const baseUrl = 'https://odonto-center.vercel.app';
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      
      const url = `${baseUrl}/api/availability/slots?weekStart=${weekStart.toISOString()}&weekEnd=${weekEnd.toISOString()}&serviceId=cmf5j4pj90000l20a36xac3tw&t=${timestamp}&r=${randomId}`;
      
      console.log(`   Testando API: ${url}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success && data.data) {
        console.log(`   Status: ${response.status}`);
        console.log(`   Total de regras: ${data.data.totalRules}`);
        console.log(`   Dias com slots: ${data.data.days.length}`);
        
        // Procurar por hoje
        const todaySlots = data.data.days.find(day => {
          const dayDate = new Date(day.dateKey);
          return dayDate.toISOString().split('T')[0] === today.toISOString().split('T')[0];
        });
        
        if (todaySlots) {
          console.log(`   Slots para hoje (${todaySlots.date}): ${todaySlots.slots.length}`);
          console.log(`   Primeiro slot: ${todaySlots.slots[0]}`);
          console.log(`   Último slot: ${todaySlots.slots[todaySlots.slots.length - 1]}`);
          
          // Verificar horários
          const times = todaySlots.slots.map(slot => {
            const date = new Date(slot);
            return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          });
          
          console.log(`   Horários disponíveis: ${times.join(', ')}`);
        } else {
          console.log(`   Nenhum slot encontrado para hoje`);
        }
      } else {
        console.log(`   Erro na API: ${data.error || 'Resposta inválida'}`);
      }
    } else {
      console.log(`   Hoje não é quinta-feira, não é possível testar`);
    }

    // 4. Verificar se há problema na função getDailySlots
    console.log('\n4️⃣ Verificando lógica de geração de slots:');
    
    if (thursdayRules.length > 0) {
      const rule = thursdayRules[0];
      console.log(`   Regra: ${rule.start}-${rule.end}`);
      
      // Simular geração de slots
      const startTime = rule.start; // "09:00"
      const endTime = rule.end;     // "19:00"
      
      console.log(`   Horário de início: ${startTime}`);
      console.log(`   Horário de fim: ${endTime}`);
      
      // Verificar se há problema na conversão
      const startHour = parseInt(startTime.split(':')[0]);
      const startMin = parseInt(startTime.split(':')[1]);
      const endHour = parseInt(endTime.split(':')[0]);
      const endMin = parseInt(endTime.split(':')[1]);
      
      console.log(`   Início: ${startHour}:${startMin.toString().padStart(2, '0')}`);
      console.log(`   Fim: ${endHour}:${endMin.toString().padStart(2, '0')}`);
      
      // Calcular duração
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      const duration = endMinutes - startMinutes;
      
      console.log(`   Duração total: ${duration} minutos (${Math.floor(duration / 60)}h ${duration % 60}min)`);
    }

    console.log('\n✅ Debug de horários concluído!');

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

debugTimeRange();
