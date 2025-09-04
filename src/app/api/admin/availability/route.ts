import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET() {
  try {
    const rules = await prisma.availabilityRule.findMany({
      orderBy: [{ weekday: 'asc' }, { start: 'asc' }]
    });

    const blackouts = await prisma.blackoutDate.findMany({
      orderBy: { date: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: {
        rules: rules.map(rule => ({
          id: rule.id,
          weekday: rule.weekday,
          start: rule.start,
          end: rule.end,
          serviceId: rule.serviceId || undefined,
        })),
        blackouts: blackouts.map(blackout => ({
          id: blackout.id,
          date: blackout.date,
          reason: blackout.reason || "",
        }))
      }
    });
  } catch (error) {
    console.error("Error fetching availability data:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados de disponibilidade" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { schedule } = await request.json();
    
    // Log dos dados recebidos
    console.log("📥 Dados recebidos na API:", schedule);

    if (!schedule || !Array.isArray(schedule)) {
      console.error("❌ Dados inválidos:", { schedule });
      return NextResponse.json(
        { error: "Dados de horários inválidos" },
        { status: 400 }
      );
    }

    // Limpar TODAS as regras existentes (globais e específicas)
    await prisma.availabilityRule.deleteMany({});
    console.log("🧹 Todas as regras existentes removidas");

    // Criar novas regras baseadas no schedule
    const rulesToCreate = [];

    for (const day of schedule) {
      console.log(`📅 Processando ${day.day}: enabled=${day.enabled}, slots=${day.timeSlots?.length || 0}`);
      
      if (day.enabled && day.timeSlots && day.timeSlots.length > 0) {
        for (const slot of day.timeSlots) {
          const rule = {
            weekday: getWeekdayNumber(day.day),
            start: slot.startTime,
            end: slot.endTime,
            serviceId: null, // Sempre regras globais
          };
          rulesToCreate.push(rule);
          console.log(`   ✅ Criando regra: ${day.day} (${rule.weekday}) ${rule.start}-${rule.end}`);
        }
      } else {
        console.log(`   ❌ ${day.day} desabilitado ou sem slots`);
      }
    }

    if (rulesToCreate.length > 0) {
      await prisma.availabilityRule.createMany({
        data: rulesToCreate
      });
      console.log(`✅ ${rulesToCreate.length} regras criadas`);
    } else {
      console.log("⚠️ Nenhuma regra criada");
    }

    return NextResponse.json({
      success: true,
      message: "Horários salvos com sucesso",
    });
  } catch (error) {
    console.error("Error saving availability schedule:", error);
    return NextResponse.json(
      { error: "Erro ao salvar horários" },
      { status: 500 }
    );
  }
}

function getWeekdayNumber(dayName: string): number {
  const dayMap: { [key: string]: number } = {
    'sunday': 0,
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6,
  };
  
  return dayMap[dayName.toLowerCase()] ?? 1;
}