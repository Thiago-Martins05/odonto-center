require('dotenv').config({ path: '.env.local' });

async function testProductionAPI() {
  try {
    console.log('🔍 Testando API de produção...\n');

    // 1. Testar API de slots diretamente
    const baseUrl = 'https://odonto-center.vercel.app';
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    
    // Parâmetros para a próxima semana
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Segunda-feira
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Domingo
    weekEnd.setHours(23, 59, 59, 999);

    const url = `${baseUrl}/api/availability/slots?weekStart=${weekStart.toISOString()}&weekEnd=${weekEnd.toISOString()}&serviceId=cmf5j4pj90000l20a36xac3tw&t=${timestamp}&r=${randomId}`;
    
    console.log('1️⃣ Testando API de slots:');
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Success: ${data.success}`);
    
    if (data.success && data.data) {
      console.log(`   Total de regras: ${data.data.totalRules}`);
      console.log(`   Dias com slots: ${data.data.days.length}`);
      
      if (data.data.debug) {
        console.log('\n   Debug info:');
        console.log(`     Current time: ${data.data.debug.currentTime}`);
        console.log(`     Timezone: ${data.data.debug.timezone}`);
        console.log(`     Today string: ${data.data.debug.todayString}`);
      }
      
      console.log('\n   Regras encontradas:');
      data.data.rules.forEach(rule => {
        const dayName = getDayNameFromWeekday(rule.weekday);
        console.log(`     ${dayName} (weekday ${rule.weekday}): ${rule.start}-${rule.end}`);
      });
      
      console.log('\n   Dias com slots:');
      data.data.days.forEach(day => {
        console.log(`     ${day.date} (${day.dateKey}): ${day.slots.length} slots`);
      });
    } else {
      console.log(`   Erro: ${data.error || 'Resposta inválida'}`);
    }

    // 2. Testar API admin de disponibilidade
    console.log('\n2️⃣ Testando API admin de disponibilidade:');
    const adminUrl = `${baseUrl}/api/admin/availability`;
    
    const adminResponse = await fetch(adminUrl);
    const adminData = await adminResponse.json();
    
    console.log(`   Status: ${adminResponse.status}`);
    console.log(`   Success: ${adminData.success}`);
    
    if (adminData.success && adminData.data) {
      console.log(`   Total de regras: ${Array.isArray(adminData.data) ? adminData.data.length : 'N/A'}`);
      
      if (Array.isArray(adminData.data)) {
        console.log('\n   Regras no painel admin:');
        adminData.data.forEach(rule => {
          const dayName = getDayNameFromWeekday(rule.weekday);
          console.log(`     ${dayName} (weekday ${rule.weekday}): ${rule.start}-${rule.end}`);
        });
      } else {
        console.log(`   Dados não são array: ${typeof adminData.data}`);
        console.log(`   Conteúdo: ${JSON.stringify(adminData.data, null, 2)}`);
      }
    } else {
      console.log(`   Erro: ${adminData.error || 'Resposta inválida'}`);
    }

    // 3. Comparar resultados
    console.log('\n3️⃣ Comparando resultados:');
    if (data.success && adminData.success) {
      const slotsRules = data.data.rules || [];
      const adminRules = adminData.data.rules || [];
      
      console.log(`   Regras na API de slots: ${slotsRules.length}`);
      console.log(`   Regras no painel admin: ${adminRules.length}`);
      
      if (slotsRules.length !== adminRules.length) {
        console.log('   ❌ PROBLEMA: Número de regras diferente!');
      } else {
        console.log('   ✅ Número de regras igual');
      }
      
      // Verificar se as regras são as mesmas
      const slotsWeekdays = slotsRules.map(r => r.weekday).sort();
      const adminWeekdays = adminRules.map(r => r.weekday).sort();
      
      const weekdaysMatch = JSON.stringify(slotsWeekdays) === JSON.stringify(adminWeekdays);
      if (weekdaysMatch) {
        console.log('   ✅ Dias da semana coincidem');
      } else {
        console.log('   ❌ PROBLEMA: Dias da semana diferentes!');
        console.log(`     API slots: ${slotsWeekdays.join(', ')}`);
        console.log(`     Painel admin: ${adminWeekdays.join(', ')}`);
      }
    }

    console.log('\n✅ Teste de produção concluído!');

  } catch (error) {
    console.error('❌ Erro ao testar API de produção:', error);
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

testProductionAPI();
