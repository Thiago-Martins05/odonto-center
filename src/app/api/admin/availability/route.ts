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

    if (!schedule || !Array.isArray(schedule)) {
      return NextResponse.json(
        { error: "Dados de horários inválidos" },
        { status: 400 }
      );
    }

    // Limpar regras existentes
    await prisma.availabilityRule.deleteMany({});

    // Criar novas regras baseadas no schedule
    const rulesToCreate = [];

    for (const day of schedule) {
      if (day.enabled && day.timeSlots && day.timeSlots.length > 0) {
        for (const slot of day.timeSlots) {
          rulesToCreate.push({
            weekday: getWeekdayNumber(day.day),
            start: slot.startTime,
            end: slot.endTime,
            serviceId: null, // Regra global
          });
        }
      }
    }

    if (rulesToCreate.length > 0) {
      await prisma.availabilityRule.createMany({
        data: rulesToCreate
      });
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