import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getDailySlots } from "@/lib/availability";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const weekStart = searchParams.get("weekStart");
    const weekEnd = searchParams.get("weekEnd");
    const serviceId = searchParams.get("serviceId");

    if (!weekStart || !weekEnd) {
      return NextResponse.json(
        { success: false, error: "weekStart e weekEnd são obrigatórios" },
        { status: 400 }
      );
    }

    // Parse dates - handle timezone issues
    const startDate = new Date(weekStart);
    const endDate = new Date(weekEnd);
    
    // Extract date components from ISO string to avoid timezone issues
    const startDateStr = weekStart.split('T')[0]; // Get YYYY-MM-DD part
    const endDateStr = weekEnd.split('T')[0]; // Get YYYY-MM-DD part
    
    const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number);
    
    // Create dates in local timezone using extracted components
    const normalizedStartDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
    const normalizedEndDate = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "Datas inválidas" },
        { status: 400 }
      );
    }

    // Fetch availability rules - ONLY GLOBAL RULES (serviceId: null)
    const rules = await prisma.availabilityRule.findMany({
      where: {
        serviceId: null, // Only global rules
      },
      orderBy: { weekday: "asc" },
    });

    // Log apenas para debug se necessário
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 API Slots - Regras globais encontradas: ${rules.length}`);
    }



    // Fetch blackout dates
    const blackoutDates = await prisma.blackoutDate.findMany({
      where: {
        date: {
          gte: normalizedStartDate,
          lte: normalizedEndDate,
        },
      },
    });



    // Fetch existing appointments
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        startsAt: {
          gte: normalizedStartDate,
          lte: normalizedEndDate,
        },
        status: {
          not: "cancelled",
        },
      },
      select: {
        id: true,
        startsAt: true,
        endsAt: true,
      },
    });



    // Fetch service if serviceId is provided
    let service = null;
    if (serviceId) {
      service = await prisma.service.findUnique({
        where: { id: serviceId },
        select: {
          id: true,
          name: true,
          durationMin: true,
        },
      });

    }

    // Generate slots for each day
    const daysMap = new Map<string, string[]>();
    const currentDate = new Date(normalizedStartDate);

    while (currentDate <= normalizedEndDate) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      
      const weekday = currentDate.getDay();

      // Check if this date is in the past
      const today = new Date();
      const todayYear = today.getFullYear();
      const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
      const todayDay = String(today.getDate()).padStart(2, '0');
      const todayString = `${todayYear}-${todayMonth}-${todayDay}`;
      
      const isDateInPast = dateKey < todayString;

      // Skip past dates
      if (isDateInPast) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // Find rules for this weekday
      const dayRules = rules.filter((rule) => rule.weekday === weekday);

      // Only process if there are rules for this day
      if (dayRules.length > 0) {
        // Check if this date is blacked out
        const isBlackedOut = blackoutDates.some(
          (blackout) => blackout.date.toISOString().split("T")[0] === dateKey
        );

        if (!isBlackedOut) {
          // Convert Prisma rules to the format expected by getDailySlots
          const availabilityRules = dayRules.map((rule) => ({
            id: rule.id,
            weekday: rule.weekday,
            start: rule.start,
            end: rule.end,
            serviceId: rule.serviceId || undefined,
          }));

          const slots = getDailySlots({
            date: currentDate,
            serviceDurationMin: service?.durationMin || 30,
            rules: availabilityRules,
            blackouts: blackoutDates.map((blackout) => ({
              id: blackout.id,
              date: blackout.date,
              reason: blackout.reason || undefined,
            })),
            existingAppointments: existingAppointments,
            stepMin: 15,
            bufferMin: 10,
          });

          // Debug log for today's slots
          if (dateKey === '2025-09-04') {
            console.log(`🔍 Debug getDailySlots for ${dateKey}:`);
            console.log(`   currentDate: ${currentDate.toISOString()}`);
            console.log(`   serviceDurationMin: ${service?.durationMin || 30}`);
            console.log(`   rules: ${availabilityRules.length}`);
            console.log(`   existingAppointments: ${existingAppointments.length}`);
            console.log(`   slots returned: ${slots.length}`);
            if (slots.length > 0) {
              console.log(`   first slot: ${slots[0]}`);
              console.log(`   last slot: ${slots[slots.length - 1]}`);
            }
          }

          if (slots.length > 0) {
            // Convert Date[] to string[] for storage
            const slotStrings = slots.map((slot) => {
              const localSlot = new Date(
                slot.getFullYear(),
                slot.getMonth(),
                slot.getDate(),
                slot.getHours(),
                slot.getMinutes(),
                0,
                0
              );
              return localSlot.toISOString();
            });
            
            // Debug log for today's slots
            if (dateKey === '2025-09-04') {
              console.log(`🔍 Debug slots for ${dateKey}:`);
              console.log(`   Total slots generated: ${slots.length}`);
              console.log(`   First slot: ${slots[0]}`);
              console.log(`   Last slot: ${slots[slots.length - 1]}`);
              console.log(`   First slot string: ${slotStrings[0]}`);
              console.log(`   Last slot string: ${slotStrings[slotStrings.length - 1]}`);
            }
            
            daysMap.set(dateKey, slotStrings);
          }
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Convert map to array format
    const days: Array<{
      date: string;
      slots: string[];
      dateKey: string;
    }> = [];

    daysMap.forEach((slots, dateKey) => {
      // Parse date key properly to avoid timezone issues
      const [year, month, day] = dateKey.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      const formattedDate = new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }).format(date);

      days.push({
        date: formattedDate,
        slots,
        dateKey,
      });
    });

    // Sort days by date
    days.sort(
      (a, b) => new Date(a.dateKey).getTime() - new Date(b.dateKey).getTime()
    );

    const response = {
      success: true,
      data: {
        days,
        service,
        totalRules: rules.length,
        totalBlackouts: blackoutDates.length,
        totalAppointments: existingAppointments.length,
        rules: rules.map((r) => ({
          weekday: r.weekday,
          start: r.start,
          end: r.end,
          serviceId: r.serviceId,
        })),
        debug: {
          currentTime: new Date().toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          todayString: new Date().toISOString().split('T')[0],
          slotsDebug: days.map(day => ({
            date: day.date,
            dateKey: day.dateKey,
            slotsCount: day.slots.length,
            firstSlot: day.slots[0] || null,
            lastSlot: day.slots[day.slots.length - 1] || null,
            allSlots: day.slots,
          })),
        },
      },
    };



    // Return response with aggressive cache headers to prevent caching issues
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
        "Last-Modified": new Date().toUTCString(),
        "ETag": `"${Date.now()}"`,
        "X-Debug": "true",
        "X-Timestamp": Date.now().toString(),
        "X-Version": "2.0.0",
      },
    });
  } catch (error) {
    console.error("❌ Error in availability slots API:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

function getDayNameFromWeekday(weekday: number): string {
  const dayMap: { [key: number]: string } = {
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
