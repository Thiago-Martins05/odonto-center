import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      );
    }

    // Buscar dados dos agendamentos
    const appointments = await prisma.appointment.findMany({
      where: {
        startsAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        service: true,
      },
      orderBy: {
        startsAt: "asc",
      },
    });

    // Buscar dados dos serviços
    const services = await prisma.service.findMany({
      where: { active: true },
      include: {
        appointments: {
          where: {
            startsAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          },
        },
      },
    });

    // Preparar dados para exportação
    const exportData = {
      period: {
        startDate,
        endDate,
      },
      summary: {
        totalAppointments: appointments.length,
        totalServices: services.length,
        completedAppointments: appointments.filter(a => a.status === "done").length,
        cancelledAppointments: appointments.filter(a => a.status === "cancelled").length,
      },
      appointments: appointments.map(appointment => ({
        id: appointment.id,
        patientName: appointment.patientName,
        service: appointment.service.name,
        startsAt: appointment.startsAt,
        endsAt: appointment.endsAt,
        status: appointment.status,
      })),
      services: services.map(service => ({
        id: service.id,
        name: service.name,
        duration: service.durationMin,
        active: service.active,
        appointmentCount: service.appointments.length,
      })),
    };

    return NextResponse.json(exportData, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="relatorio-publico-${startDate}-${endDate}.json"`,
      },
    });

  } catch (error) {
    console.error("Erro ao gerar relatório público:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}