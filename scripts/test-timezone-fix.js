require('dotenv').config({ path: '.env.local' });

// Simular a função getDailySlots com a correção
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

    // Generate candidate slots in stepMin increments
    let currentSlot = new Date(ruleStart);

    while (currentSlot < ruleEnd) {
      const slotEnd = addMinutes(currentSlot, serviceDurationMin);

      // Check if slot is in the future (considering buffer time)
      const isSlotInFuture = currentSlot >= bufferTime;
      
      if (slotEnd <= ruleEnd && isSlotInFuture) {
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
        }
      }

      currentSlot = addMinutes(currentSlot, stepMin);
    }
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

console.log('🧪 Testando correção de timezone...');
console.log('Data de teste:', testDate.toISOString().split('T')[0]);
console.log('Regras:', rules);

const slots = getDailySlots(testDate, rules);

console.log('\n📅 Slots gerados:');
slots.forEach((slot, index) => {
  const date = new Date(slot);
  const timeStr = date.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  console.log(`  ${index + 1}. ${timeStr} (${slot})`);
});

console.log(`\n✅ Total: ${slots.length} slots`);
console.log('Primeiro slot:', slots[0]);
console.log('Último slot:', slots[slots.length - 1]);
