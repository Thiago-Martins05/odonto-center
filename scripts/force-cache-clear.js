require('dotenv').config({ path: '.env.local' });

async function testAPIWithCacheBusting() {
  const baseUrl = 'https://odonto-center.vercel.app';
  
  // Gerar parâmetros únicos para forçar cache busting
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);
  const randomId2 = Math.random().toString(36).substring(7);
  
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Segunda-feira
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6); // Domingo
  
  const url = `${baseUrl}/api/availability/slots?weekStart=${weekStart.toISOString()}&weekEnd=${weekEnd.toISOString()}&serviceId=cmf5j4pj90000l20a36xac3tw&t=${timestamp}&r=${randomId}&cache=${randomId2}&v=${Date.now()}`;
  
  console.log('🧹 Forçando limpeza de cache...');
  console.log(`URL: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
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
        }
      });
    }
    
    console.log('\n🎯 Instruções para o usuário:');
    console.log('1. Abra o navegador em modo incógnito/privado');
    console.log('2. Acesse a página de agendamento');
    console.log('3. Verifique se os horários estão corretos');
    console.log('4. Se ainda houver diferença, pressione Ctrl+F5 para forçar reload');
    
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  }
}

testAPIWithCacheBusting().catch(console.error);