import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/server/db";

export async function GET(request: NextRequest) {
  try {

    
    const session = await auth();

    
    if (!session?.user) {

      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }



    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const type = searchParams.get("type") || "all";



    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end date



    const reportData: any = {};

    // Appointments Report
    if (type === "all" || type === "appointments") {

      const appointments = await prisma.appointment.findMany({
        where: {
          startsAt: {
            gte: start,
            lte: end,
          },
        },
        include: {
          service: true,
        },
      });


      const appointmentsByService = appointments.reduce((acc, appointment) => {
        const serviceName = appointment.service.name;
        if (!acc[serviceName]) {
          acc[serviceName] = {
            serviceName,
            count: 0,
            revenue: 0,
          };
        }
        acc[serviceName].count++;
        if (appointment.status === "done") {
          acc[serviceName].revenue += appointment.service.priceCents;
        }
        return acc;
      }, {} as Record<string, { serviceName: string; count: number; revenue: number }>);

      const appointmentsByMonth = appointments.reduce((acc, appointment) => {
        const month = appointment.startsAt.toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        });
        if (!acc[month]) {
          acc[month] = {
            month,
            count: 0,
            revenue: 0,
          };
        }
        acc[month].count++;
        if (appointment.status === "done") {
          acc[month].revenue += appointment.service.priceCents;
        }
        return acc;
      }, {} as Record<string, { month: string; count: number; revenue: number }>);

      reportData.appointments = {
        total: appointments.length,
        scheduled: appointments.filter(a => a.status === "scheduled").length,
        completed: appointments.filter(a => a.status === "done").length,
        cancelled: appointments.filter(a => a.status === "cancelled").length,
        byService: Object.values(appointmentsByService),
        byMonth: Object.values(appointmentsByMonth),
      };
    }

    // Financial Report
    if (type === "all" || type === "financial") {
      const completedAppointments = await prisma.appointment.findMany({
        where: {
          startsAt: {
            gte: start,
            lte: end,
          },
          status: "done",
        },
        include: {
          service: true,
        },
      });

      const totalRevenue = completedAppointments.reduce(
        (sum, appointment) => sum + appointment.service.priceCents,
        0
      );

      const currentMonth = new Date();
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);

      const monthlyAppointments = await prisma.appointment.findMany({
        where: {
          startsAt: {
            gte: monthStart,
            lte: monthEnd,
          },
          status: "done",
        },
        include: {
          service: true,
        },
      });

      const monthlyRevenue = monthlyAppointments.reduce(
        (sum, appointment) => sum + appointment.service.priceCents,
        0
      );

      const averageTicket = completedAppointments.length > 0 
        ? totalRevenue / completedAppointments.length 
        : 0;

      const topServices = completedAppointments.reduce((acc, appointment) => {
        const serviceName = appointment.service.name;
        if (!acc[serviceName]) {
          acc[serviceName] = {
            serviceName,
            revenue: 0,
            count: 0,
          };
        }
        acc[serviceName].revenue += appointment.service.priceCents;
        acc[serviceName].count++;
        return acc;
      }, {} as Record<string, { serviceName: string; revenue: number; count: number }>);

      reportData.financial = {
        totalRevenue,
        monthlyRevenue,
        averageTicket,
        topServices: Object.values(topServices).sort((a, b) => b.revenue - a.revenue),
      };
    }

    // Services Report
    if (type === "all" || type === "services") {
      const services = await prisma.service.findMany();
      
      const serviceStats = await Promise.all(
        services.map(async (service) => {
          const appointments = await prisma.appointment.findMany({
            where: {
              serviceId: service.id,
              startsAt: {
                gte: start,
                lte: end,
              },
              status: "done",
            },
          });

          return {
            serviceName: service.name,
            bookings: appointments.length,
            revenue: appointments.length * service.priceCents,
          };
        })
      );

      reportData.services = {
        total: services.length,
        active: services.filter(s => s.active).length,
        inactive: services.filter(s => !s.active).length,
        mostPopular: serviceStats.sort((a, b) => b.bookings - a.bookings),
      };
    }

    // Availability Report
    if (type === "all" || type === "availability") {
      const availabilityRules = await prisma.availabilityRule.findMany({
        include: {
          service: true,
        },
      });

      const blackoutDates = await prisma.blackoutDate.findMany({
        where: {
          date: {
            gte: start,
            lte: end,
          },
        },
      });

      // Calculate total available slots
      let totalSlots = 0;
      const weekdayStats: Record<number, { slots: number; booked: number }> = {};

      // Simplified calculation to avoid infinite loops
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      
      for (let i = 0; i <= Math.min(daysDiff, 365); i++) { // Limit to 365 days max
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        
        if (d > end) break;
        
        const dayOfWeek = d.getDay();
        const isBlackout = blackoutDates.some(
          (blackout) => blackout.date.toDateString() === d.toDateString()
        );

        if (!isBlackout) {
          const dayRules = availabilityRules.filter(
            (rule) => rule.weekday === dayOfWeek
          );

          for (const rule of dayRules) {
            const startTime = new Date(d);
            const [startHour, startMin] = rule.start.split(":").map(Number);
            startTime.setHours(startHour, startMin, 0, 0);

            const endTime = new Date(d);
            const [endHour, endMin] = rule.end.split(":").map(Number);
            endTime.setHours(endHour, endMin, 0, 0);

            // Calculate slots (assuming 30-minute intervals)
            const slotDuration = 30 * 60 * 1000; // 30 minutes in milliseconds
            const daySlots = Math.floor(
              (endTime.getTime() - startTime.getTime()) / slotDuration
            );

            totalSlots += daySlots;

            if (!weekdayStats[dayOfWeek]) {
              weekdayStats[dayOfWeek] = { slots: 0, booked: 0 };
            }
            weekdayStats[dayOfWeek].slots += daySlots;
          }
        }
      }

      // Count booked slots
      const bookedAppointments = await prisma.appointment.findMany({
        where: {
          startsAt: {
            gte: start,
            lte: end,
          },
          status: {
            in: ["scheduled", "done"],
          },
        },
      });

      const bookedSlots = bookedAppointments.length;
      const availableSlots = totalSlots - bookedSlots;
      const utilizationRate = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;

      const weekdayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
      const byWeekday = Object.entries(weekdayStats).map(([day, stats]) => ({
        weekday: weekdayNames[parseInt(day)],
        slots: stats.slots,
        utilization: stats.slots > 0 ? Math.round((stats.booked / stats.slots) * 100) : 0,
      }));

      reportData.availability = {
        totalSlots,
        bookedSlots,
        availableSlots,
        utilizationRate,
        byWeekday,
      };
    }


    return NextResponse.json(reportData);
  } catch (error) {
    console.error("Error generating reports:", error);
    if (error instanceof Error) {
      console.error("Error stack:", error.stack);
      return NextResponse.json(
        { error: "Internal server error", details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
