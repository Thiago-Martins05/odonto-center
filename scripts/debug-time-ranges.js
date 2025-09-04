require('dotenv').config({ path: '.env.local' });

// Simular a função getDailySlots para debug
function parseHHMM(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function getDailySlots(date, applicableRules, existingAppointments = [], serviceDurationMin = 60, stepMin = 15) {
  const allSlots = [];
  const now = new Date();
  const todayString = now.toISOString().split('T')[0];
  const targetDateString = date.toISOString().split('T')[0];
  
  // Only apply buffer if the date is today
  const isToday = targetDateString === todayString;
  
  // For today, use a more reasonable buffer time
  let bufferTime;
  if (isToday) {
    // Use current time + 15 minutes buffer (more reasonable)
    bufferTime = new Date(now.getTime() + 15 * 60 * 1000);
  } else {
    bufferTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  }

  for (const rule of applicableRules) {
    const { start, end } = rule;
    const { hours: startHour, minutes: startMin } = parseHHMM(start);
    const { hours: endHour, minutes: endMin } = parseHHMM(end);

    console.log(`\n🔍 Processando regra: ${start} - ${end}`);
    console.log(`   startHour: ${startHour}, startMin: ${startMin}`);
    console.log(`   endHour: ${endHour}, endMin: ${endMin}`);

    // Create rule start and end times for this date
    const ruleStart = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      startHour,
      startMin,
      0,
      0
    );
    const ruleEnd = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      endHour,
      endMin,
      0,
      0
    );

    console.log(`   ruleStart: ${ruleStart.toLocaleTimeString('pt-BR')}`);
    console.log(`   ruleEnd: ${ruleEnd.toLocaleTimeString('pt-BR')}`);

    // Generate candidate slots in stepMin increments
    let currentSlot = new Date(ruleStart);
    let slotCount = 0;

    while (currentSlot < ruleEnd) {
      const slotEnd = addMinutes(currentSlot, serviceDurationMin);

      // Check if slot is in the future (considering buffer time)
      const isSlotInFuture = currentSlot >= bufferTime;
      
      if (currentSlot < ruleEnd && isSlotInFuture) {
        // Check for overlaps with existing appointments
        const hasOverlap = existingAppointments.some((appointment) => {
          const appointmentStart = new Date(appointment.startsAt);
          const appointmentEnd = new Date(appointment.endsAt);

          return currentSlot < appointmentEnd && slotEnd > appointmentStart;
        });

        if (!hasOverlap) {
          // Create slot as ISO string in local timezone
          const year = currentSlot.getFullYear();
          const month = String(currentSlot.getMonth() + 1).padStart(2, '0');
          const day = String(currentSlot.getDate()).padStart(2, '0');
          const hours = String(currentSlot.getHours()).padStart(2, '0');
          const minutes = String(currentSlot.getMinutes()).padStart(2, '0');
          
          // Create ISO string in local timezone (no Z suffix)
          const localISOString = `${year}-${month}-${day}T${hours}:${minutes}:00.000`;
          allSlots.push(localISOString);
          slotCount++;
          
          if (slotCount <= 3 || slotCount >= 10) {
            console.log(`   Slot ${slotCount}: ${currentSlot.toLocaleTimeString('pt-BR')} (${localISOString})`);
          }
        }
      }

      currentSlot = addMinutes(currentSlot, stepMin);
    }
    
    console.log(`   Total slots para esta regra: ${slotCount}`);
  }

  // Return sorted unique slots
  return allSlots
    .filter(
      (slot, index, self) =>
        self.findIndex((s) => s === slot) === index
    )
    .sort((a, b) => a.localeCompare(b));
}

// Testar com regras de segunda-feira
const testDate = new Date(2025, 8, 9); // 09/09/2025 (terça-feira)
const rules = [
  { start: "08:00", end: "12:00" },
  { start: "14:00", end: "18:00" }
];

console.log('🧪 Testando geração de slots com debug detalhado...');
console.log('Data de teste:', testDate.toISOString().split('T')[0]);
console.log('Regras:', rules);
console.log('Duração do serviço: 60 minutos');
console.log('Intervalo entre slots: 15 minutos');

const slots = getDailySlots(testDate, rules);

console.log('\n📅 Resumo dos slots gerados:');
console.log(`Total: ${slots.length} slots`);
console.log('Primeiro slot:', slots[0]);
console.log('Último slot:', slots[slots.length - 1]);

// Verificar se há slots até 12:00 e 18:00
const morningSlots = slots.filter(slot => slot.includes('T08:') || slot.includes('T09:') || slot.includes('T10:') || slot.includes('T11:'));
const afternoonSlots = slots.filter(slot => slot.includes('T14:') || slot.includes('T15:') || slot.includes('T16:') || slot.includes('T17:'));

console.log(`\nManhã (08:00-12:00): ${morningSlots.length} slots`);
console.log(`Tarde (14:00-18:00): ${afternoonSlots.length} slots`);

if (morningSlots.length > 0) {
  console.log(`Último slot da manhã: ${morningSlots[morningSlots.length - 1]}`);
}
if (afternoonSlots.length > 0) {
  console.log(`Último slot da tarde: ${afternoonSlots[afternoonSlots.length - 1]}`);
}
