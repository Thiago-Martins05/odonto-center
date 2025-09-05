// Simular como o frontend processa os slots
const slots = [
  "2025-09-08T08:00:00.000",
  "2025-09-08T08:15:00.000", 
  "2025-09-08T08:30:00.000",
  "2025-09-08T08:45:00.000",
  "2025-09-08T09:00:00.000",
  "2025-09-08T09:15:00.000",
  "2025-09-08T09:30:00.000",
  "2025-09-08T09:45:00.000",
  "2025-09-08T10:00:00.000",
  "2025-09-08T10:15:00.000",
  "2025-09-08T10:30:00.000",
  "2025-09-08T10:45:00.000",
  "2025-09-08T11:00:00.000",
  "2025-09-08T14:00:00.000",
  "2025-09-08T14:15:00.000",
  "2025-09-08T14:30:00.000",
  "2025-09-08T14:45:00.000",
  "2025-09-08T15:00:00.000",
  "2025-09-08T15:15:00.000",
  "2025-09-08T15:30:00.000",
  "2025-09-08T15:45:00.000",
  "2025-09-08T16:00:00.000",
  "2025-09-08T16:15:00.000",
  "2025-09-08T16:30:00.000",
  "2025-09-08T16:45:00.000",
  "2025-09-08T17:00:00.000"
];

// Função formatTime do frontend
function formatTime(isoString) {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

console.log('🧪 Testando como o frontend exibe os horários...');
console.log(`Total de slots: ${slots.length}`);
console.log('\n📅 Todos os horários exibidos no frontend:');

slots.forEach((slot, index) => {
  const timeDisplay = formatTime(slot);
  console.log(`  ${index + 1}. ${timeDisplay}`);
});

console.log('\n🔍 Análise:');
console.log(`Primeiro horário: ${formatTime(slots[0])}`);
console.log(`Último horário: ${formatTime(slots[slots.length - 1])}`);

// Separar manhã e tarde
const morningSlots = slots.filter(slot => slot.includes('T08:') || slot.includes('T09:') || slot.includes('T10:') || slot.includes('T11:'));
const afternoonSlots = slots.filter(slot => slot.includes('T14:') || slot.includes('T15:') || slot.includes('T16:') || slot.includes('T17:'));

console.log(`\nManhã: ${morningSlots.length} slots`);
console.log(`  Primeiro: ${formatTime(morningSlots[0])}`);
console.log(`  Último: ${formatTime(morningSlots[morningSlots.length - 1])}`);

console.log(`\nTarde: ${afternoonSlots.length} slots`);
console.log(`  Primeiro: ${formatTime(afternoonSlots[0])}`);
console.log(`  Último: ${formatTime(afternoonSlots[afternoonSlots.length - 1])}`);

console.log('\n❓ O que você está vendo no frontend?');
console.log('Se você está vendo horários diferentes, pode ser:');
console.log('1. Cache do navegador');
console.log('2. Problema de timezone no frontend');
console.log('3. Dados antigos sendo exibidos');

