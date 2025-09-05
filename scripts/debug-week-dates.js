const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const weekStart = new Date(today);
weekStart.setDate(today.getDate() - today.getDay() + 1); // Segunda-feira
const weekEnd = new Date(weekStart);
weekEnd.setDate(weekStart.getDate() + 6); // Domingo

console.log('📅 Semana atual:');
console.log('Hoje:', today.toISOString().split('T')[0]);
console.log('Início da semana:', weekStart.toISOString().split('T')[0]);
console.log('Fim da semana:', weekEnd.toISOString().split('T')[0]);

// Calcular dias da semana
for (let i = 0; i < 7; i++) {
  const day = new Date(weekStart);
  day.setDate(weekStart.getDate() + i);
  const dayName = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'][day.getDay()];
  const weekday = day.getDay();
  console.log(`${day.toISOString().split('T')[0]} - ${dayName} (weekday ${weekday})`);
}

console.log('\n🔍 Regras configuradas:');
console.log('Segunda-feira (weekday 1): 08:00-12:00 + 14:00-18:00');
console.log('Terça-feira (weekday 2): 08:00-12:00 + 14:00-18:00');
console.log('Quinta-feira (weekday 4): 09:00-19:00');

console.log('\n❓ Por que terça e quinta não aparecem?');
console.log('Vamos verificar se as datas estão corretas...');

