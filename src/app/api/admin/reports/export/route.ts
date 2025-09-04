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

    // Buscar dados dos agendamentos
    const appointments = await prisma.appointment.findMany({
      where: {
        startsAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        ...(type !== "all" && { status: type }),
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

    // Buscar dados dos contatos
    const contactMessages = await prisma.contactMessage?.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
    }) || [];

    // Preparar dados para exportação
    const exportData = {
      period: {
        startDate,
        endDate,
        type,
      },
      summary: {
        totalAppointments: appointments.length,
        totalServices: services.length,
        totalContacts: contactMessages.length,
        completedAppointments: appointments.filter(a => a.status === "done").length,
        cancelledAppointments: appointments.filter(a => a.status === "cancelled").length,
      },
      appointments: appointments.map(appointment => ({
        id: appointment.id,
        patientName: appointment.patientName,
        email: appointment.email,
        phone: appointment.phone,
        service: appointment.service.name,
        startsAt: appointment.startsAt,
        endsAt: appointment.endsAt,
        status: appointment.status,
        notes: appointment.notes,
      })),
      services: services.map(service => ({
        id: service.id,
        name: service.name,
        duration: service.durationMin,
        price: service.priceCents,
        active: service.active,
        appointmentCount: service.appointments.length,
      })),
      contacts: contactMessages.map(contact => ({
        id: contact.id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        message: contact.message,
        createdAt: contact.createdAt,
      })),
    };

    return NextResponse.json(exportData, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="relatorio-${startDate}-${endDate}.json"`,
      },
    });

  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}