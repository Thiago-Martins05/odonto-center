require('dotenv').config({ path: '.env.local' });

async function testNextWeek() {
  const baseUrl = 'https://odonto-center.vercel.app';
  
  // Testar próxima semana (08/09 - 14/09)
  const weekStart = new Date('2025-09-08T03:00:00.000Z');
  const weekEnd = new Date('2025-09-15T02:59:59.999Z');
  
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);
  
  const url = `${baseUrl}/api/availability/slots?weekStart=${weekStart.toISOString()}&weekEnd=${weekEnd.toISOString()}&serviceId=cmf5j4pj90000l20a36xac3tw&t=${timestamp}&r=${randomId}`;
  
  console.log('🔍 Testando próxima semana (08/09 - 14/09)...');
  console.log(`URL: ${url}`);
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`\n✅ Status: ${response.status}`);
    console.log(`✅ Success: ${data.success}`);
    
    if (data.data?.days) {
      console.log(`\n📅 Dias com slots: ${data.data.days.length}`);
      
      data.data.days.forEach(day => {
        console.log(`\n${day.date} (${day.dateKey}): ${day.slots.length} slots`);
        
        if (day.slots.length > 0) {
          const firstSlot = day.slots[0];
          const lastSlot = day.slots[day.slots.length - 1];
          
          // Converter para horário local
          const firstTime = new Date(firstSlot).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          const lastTime = new Date(lastSlot).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          
          console.log(`  Primeiro: ${firstTime}`);
          console.log(`  Último: ${lastTime}`);
          
          // Mostrar alguns slots do meio
          if (day.slots.length > 4) {
            const midSlot = day.slots[Math.floor(day.slots.length / 2)];
            const midTime = new Date(midSlot).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            });
            console.log(`  Meio: ${midTime}`);
          }
          
          // Separar manhã e tarde
          const morningSlots = day.slots.filter(slot => 
            slot.includes('T08:') || slot.includes('T09:') || 
            slot.includes('T10:') || slot.includes('T11:')
          );
          const afternoonSlots = day.slots.filter(slot => 
            slot.includes('T14:') || slot.includes('T15:') || 
            slot.includes('T16:') || slot.includes('T17:')
          );
          
          if (morningSlots.length > 0) {
            const firstMorning = new Date(morningSlots[0]).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            });
            const lastMorning = new Date(morningSlots[morningSlots.length - 1]).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            });
            console.log(`  Manhã: ${firstMorning} - ${lastMorning} (${morningSlots.length} slots)`);
          }
          
          if (afternoonSlots.length > 0) {
            const firstAfternoon = new Date(afternoonSlots[0]).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            });
            const lastAfternoon = new Date(afternoonSlots[afternoonSlots.length - 1]).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            });
            console.log(`  Tarde: ${firstAfternoon} - ${lastAfternoon} (${afternoonSlots.length} slots)`);
          }
        }
      });
    }
    
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  }
}

testNextWeek().catch(console.error);

