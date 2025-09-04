require('dotenv').config({ path: '.env.local' });

async function forceCacheClear() {
  try {
    console.log('🔄 Forçando limpeza de cache...\n');

    const baseUrl = 'https://odonto-center.vercel.app';
    
    // 1. Testar com parâmetros de cache busting mais agressivos
    console.log('1️⃣ Testando com cache busting agressivo:');
    
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const randomId2 = Math.random().toString(36).substring(7);
    
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const url = `${baseUrl}/api/availability/slots?weekStart=${weekStart.toISOString()}&weekEnd=${weekEnd.toISOString()}&serviceId=cmf5j4pj90000l20a36xac3tw&t=${timestamp}&r=${randomId}&cache=${randomId2}&v=${Date.now()}`;
    
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
    
    const data = await response.json();
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Success: ${data.success}`);
    
    if (data.success && data.data) {
      console.log(`   Total de regras: ${data.data.totalRules}`);
      console.log(`   Dias com slots: ${data.data.days.length}`);
      
      console.log('\n   Regras encontradas:');
      data.data.rules.forEach(rule => {
        const dayName = getDayNameFromWeekday(rule.weekday);
        console.log(`     ${dayName} (weekday ${rule.weekday}): ${rule.start}-${rule.end}`);
      });
      
      console.log('\n   Dias com slots:');
      data.data.days.forEach(day => {
        console.log(`     ${day.date} (${day.dateKey}): ${day.slots.length} slots`);
      });
    }

    // 2. Testar API admin
    console.log('\n2️⃣ Testando API admin:');
    const adminUrl = `${baseUrl}/api/admin/availability?t=${timestamp}&r=${randomId}`;
    
    const adminResponse = await fetch(adminUrl, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
    
    const adminData = await adminResponse.json();
    
    console.log(`   Status: ${adminResponse.status}`);
    console.log(`   Success: ${adminData.success}`);
    
    if (adminData.success && adminData.data && adminData.data.rules) {
      console.log(`   Total de regras: ${adminData.data.rules.length}`);
      
      console.log('\n   Regras no painel admin:');
      adminData.data.rules.forEach(rule => {
        const dayName = getDayNameFromWeekday(rule.weekday);
        console.log(`     ${dayName} (weekday ${rule.weekday}): ${rule.start}-${rule.end}`);
      });
    }

    // 3. Verificar se há problema de timezone
    console.log('\n3️⃣ Verificando timezone:');
    const now = new Date();
    console.log(`   Data atual: ${now.toISOString()}`);
    console.log(`   Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
    console.log(`   UTC offset: ${now.getTimezoneOffset()} minutos`);

    // 4. Testar com datas específicas
    console.log('\n4️⃣ Testando com datas específicas:');
    const specificWeekStart = new Date('2025-09-08T00:00:00.000Z'); // Segunda-feira
    const specificWeekEnd = new Date('2025-09-14T23:59:59.999Z'); // Domingo
    
    const specificUrl = `${baseUrl}/api/availability/slots?weekStart=${specificWeekStart.toISOString()}&weekEnd=${specificWeekEnd.toISOString()}&serviceId=cmf5j4pj90000l20a36xac3tw&t=${Date.now()}&r=${Math.random().toString(36).substring(7)}`;
    
    const specificResponse = await fetch(specificUrl);
    const specificData = await specificResponse.json();
    
    console.log(`   Status: ${specificResponse.status}`);
    console.log(`   Success: ${specificData.success}`);
    
    if (specificData.success && specificData.data) {
      console.log(`   Dias com slots: ${specificData.data.days.length}`);
      
      specificData.data.days.forEach(day => {
        console.log(`     ${day.date} (${day.dateKey}): ${day.slots.length} slots`);
      });
    }

    console.log('\n✅ Teste de cache concluído!');

  } catch (error) {
    console.error('❌ Erro ao testar cache:', error);
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

forceCacheClear();
