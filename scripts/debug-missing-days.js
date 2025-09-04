require('dotenv').config({ path: '.env.local' });

async function testAPI() {
  const baseUrl = 'https://odonto-center.vercel.app';
  
  // Testar com diferentes semanas
  const testWeeks = [
    {
      name: 'Semana atual (01/09 - 07/09)',
      weekStart: '2025-09-01T03:00:00.000Z',
      weekEnd: '2025-09-08T02:59:59.999Z'
    },
    {
      name: 'Próxima semana (08/09 - 14/09)',
      weekStart: '2025-09-08T03:00:00.000Z',
      weekEnd: '2025-09-15T02:59:59.999Z'
    }
  ];

  for (const week of testWeeks) {
    console.log(`\n🔍 Testando: ${week.name}`);
    
    const url = `${baseUrl}/api/availability/slots?weekStart=${week.weekStart}&weekEnd=${week.weekEnd}&serviceId=cmf5j4pj90000l20a36xac3tw&t=${Date.now()}&r=test`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      console.log(`   Status: ${response.status}`);
      console.log(`   Dias com slots: ${data.data?.days?.length || 0}`);
      
      if (data.data?.days) {
        data.data.days.forEach(day => {
          console.log(`   ${day.date} (${day.dateKey}): ${day.slots.length} slots`);
        });
      }
      
      if (data.debug?.slotsDebug) {
        console.log('   Debug slots:');
        Object.entries(data.debug.slotsDebug).forEach(([date, info]) => {
          console.log(`     ${date}: ${info.allSlots.length} slots`);
        });
      }
      
    } catch (error) {
      console.log(`   Erro: ${error.message}`);
    }
  }
}

testAPI().catch(console.error);
