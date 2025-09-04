require('dotenv').config({ path: '.env.local' });

function debugBufferTime() {
  try {
    console.log('🔍 Debugando buffer time...\n');

    // 1. Simular a lógica de buffer time
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = new Date(2025, 8, 4); // 4 de setembro de 2025 (quinta-feira)
    
    console.log('1️⃣ Datas:');
    console.log(`   Agora: ${now.toISOString()}`);
    console.log(`   Hoje: ${today.toISOString()}`);
    console.log(`   Data alvo: ${targetDate.toISOString()}`);
    
    // 2. Verificar se é hoje
    const todayString = today.toISOString().split('T')[0];
    const targetDateString = targetDate.toISOString().split('T')[0];
    const isToday = targetDateString === todayString;
    
    console.log('\n2️⃣ Verificações:');
    console.log(`   todayString: ${todayString}`);
    console.log(`   targetDateString: ${targetDateString}`);
    console.log(`   É hoje: ${isToday}`);
    
    // 3. Calcular buffer time
    const bufferMin = 10;
    const bufferTime = isToday
      ? new Date(now.getTime() + bufferMin * 60 * 1000)
      : new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
    
    console.log('\n3️⃣ Buffer time:');
    console.log(`   bufferTime: ${bufferTime.toISOString()}`);
    console.log(`   bufferTime local: ${bufferTime.toLocaleString('pt-BR')}`);
    
    // 4. Simular geração de slots
    console.log('\n4️⃣ Simulando geração de slots:');
    const startHour = 9;
    const startMin = 0;
    const endHour = 19;
    const endMin = 0;
    
    const ruleStart = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
      startHour,
      startMin,
      0,
      0
    );
    
    const ruleEnd = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
      endHour,
      endMin,
      0,
      0
    );
    
    console.log(`   ruleStart: ${ruleStart.toISOString()} (${ruleStart.toLocaleString('pt-BR')})`);
    console.log(`   ruleEnd: ${ruleEnd.toISOString()} (${ruleEnd.toLocaleString('pt-BR')})`);
    
    // 5. Testar slots
    console.log('\n5️⃣ Testando slots:');
    const stepMin = 15;
    const serviceDurationMin = 60;
    let currentSlot = new Date(ruleStart);
    let slotCount = 0;
    
    while (currentSlot < ruleEnd) {
      const slotEnd = addMinutes(currentSlot, serviceDurationMin);
      const isSlotInFuture = currentSlot >= bufferTime;
      
      if (slotEnd <= ruleEnd && isSlotInFuture) {
        slotCount++;
        if (slotCount <= 5 || slotCount > 20) { // Mostrar primeiros 5 e últimos 5
          console.log(`   Slot ${slotCount}: ${currentSlot.toLocaleString('pt-BR')} - ${slotEnd.toLocaleString('pt-BR')} (inFuture: ${isSlotInFuture})`);
        } else if (slotCount === 6) {
          console.log(`   ... (${slotCount - 5} slots intermediários)`);
        }
      } else {
        if (slotCount < 5) {
          console.log(`   Slot rejeitado: ${currentSlot.toLocaleString('pt-BR')} - ${slotEnd.toLocaleString('pt-BR')} (inFuture: ${isSlotInFuture}, slotEnd <= ruleEnd: ${slotEnd <= ruleEnd})`);
        }
      }
      
      currentSlot = addMinutes(currentSlot, stepMin);
    }
    
    console.log(`\n   Total de slots gerados: ${slotCount}`);
    
    // 6. Verificar problema específico
    console.log('\n6️⃣ Verificando problema específico:');
    const problemTime = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
      15, 0, 0, 0
    );
    
    console.log(`   Horário 15:00: ${problemTime.toISOString()}`);
    console.log(`   É >= bufferTime: ${problemTime >= bufferTime}`);
    console.log(`   bufferTime: ${bufferTime.toISOString()}`);
    
    const problemTime2 = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
      16, 0, 0, 0
    );
    
    console.log(`   Horário 16:00: ${problemTime2.toISOString()}`);
    console.log(`   É >= bufferTime: ${problemTime2 >= bufferTime}`);

    console.log('\n✅ Debug de buffer time concluído!');

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

debugBufferTime();
