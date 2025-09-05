import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { generateReportPDF, ReportData } from "@/lib/pdf-generator";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const type = searchParams.get("type") || "all";
    const format = searchParams.get("format") || "json";

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
    const contactMessages = await prisma.contactMessage.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Preparar dados para exportação
    const exportData: ReportData = {
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
        startsAt: appointment.startsAt.toISOString(),
        endsAt: appointment.endsAt.toISOString(),
        status: appointment.status,
        notes: appointment.notes || undefined,
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
        createdAt: contact.createdAt.toISOString(),
      })),
    };

    // Se o formato solicitado for PDF, gerar PDF
    if (format === "pdf") {
      const pdf = generateReportPDF(exportData);
      const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
      
      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="relatorio-${type}-${startDate}-${endDate}.pdf"`,
        },
      });
    }

    // Retornar JSON por padrão
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