require('dotenv').config({ path: '.env.local' });

function debugFrontendDates() {
  try {
    console.log('🔍 Debugando datas do frontend...\n');

    // 1. Testar como a API retorna as datas
    console.log('1️⃣ Datas que a API retorna:');
    const apiDates = [
      { date: '08/09', dateKey: '2025-09-08' },
      { date: '09/09', dateKey: '2025-09-09' }
    ];

    apiDates.forEach(day => {
      console.log(`   ${day.date} (${day.dateKey})`);
    });

    // 2. Testar como o frontend processa essas datas
    console.log('\n2️⃣ Como o frontend processa essas datas:');
    
    apiDates.forEach(day => {
      // Simular exatamente o que o frontend faz
      const date = new Date(day.dateKey);
      const weekday = date.getDay();
      
      // Simular getWeekdayName
      const weekdayName = new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(date);
      
      console.log(`   ${day.dateKey}:`);
      console.log(`     new Date(): ${date.toISOString()}`);
      console.log(`     getDay(): ${weekday}`);
      console.log(`     getWeekdayName(): ${weekdayName}`);
      console.log(`     Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
    });

    // 3. Testar com timezone específico
    console.log('\n3️⃣ Testando com timezone específico:');
    
    apiDates.forEach(day => {
      // Testar com timezone UTC
      const dateUTC = new Date(day.dateKey + 'T00:00:00.000Z');
      const weekdayUTC = dateUTC.getDay();
      const weekdayNameUTC = new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(dateUTC);
      
      // Testar com timezone local
      const dateLocal = new Date(day.dateKey + 'T00:00:00.000');
      const weekdayLocal = dateLocal.getDay();
      const weekdayNameLocal = new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(dateLocal);
      
      console.log(`   ${day.dateKey}:`);
      console.log(`     UTC: weekday ${weekdayUTC} -> ${weekdayNameUTC}`);
      console.log(`     Local: weekday ${weekdayLocal} -> ${weekdayNameLocal}`);
    });

    // 4. Verificar se há problema de timezone
    console.log('\n4️⃣ Verificando problema de timezone:');
    
    const testDate = '2025-09-08'; // Segunda-feira
    const date1 = new Date(testDate);
    const date2 = new Date(testDate + 'T00:00:00.000Z');
    const date3 = new Date(testDate + 'T00:00:00.000');
    
    console.log(`   Data: ${testDate}`);
    console.log(`   new Date('${testDate}'): ${date1.toISOString()} -> weekday: ${date1.getDay()}`);
    console.log(`   new Date('${testDate}T00:00:00.000Z'): ${date2.toISOString()} -> weekday: ${date2.getDay()}`);
    console.log(`   new Date('${testDate}T00:00:00.000'): ${date3.toISOString()} -> weekday: ${date3.getDay()}`);
    
    // 5. Testar com diferentes formatos
    console.log('\n5️⃣ Testando com diferentes formatos:');
    
    const formats = [
      '2025-09-08',
      '2025-09-08T00:00:00.000Z',
      '2025-09-08T00:00:00.000',
      '2025-09-08T03:00:00.000Z', // UTC+3 (Brasil)
    ];
    
    formats.forEach(format => {
      const date = new Date(format);
      const weekday = date.getDay();
      const weekdayName = new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(date);
      console.log(`   ${format}: weekday ${weekday} -> ${weekdayName}`);
    });

    console.log('\n✅ Debug de datas do frontend concluído!');

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

debugFrontendDates();
