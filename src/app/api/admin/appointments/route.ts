import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        service: true,
      },
      orderBy: {
        startsAt: "desc",
      },
    });

    // Transformar os dados para o formato esperado pelo frontend
    const formattedAppointments = appointments.map((appointment) => {
      // Corrigir problema de fuso horário - usar componentes de data locais
      const localStartsAt = new Date(appointment.startsAt);
      
      // Extrair componentes de data locais para evitar problemas de timezone
      const year = localStartsAt.getFullYear();
      const month = String(localStartsAt.getMonth() + 1).padStart(2, '0');
      const day = String(localStartsAt.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`; // Formato YYYY-MM-DD

      return {
        id: appointment.id,
        patientName: appointment.patientName,
        patientEmail: appointment.email,
        patientPhone: appointment.phone || "",
        serviceName: appointment.service.name,
        serviceId: appointment.serviceId,
        date: dateString,
        time: `${String(localStartsAt.getHours()).padStart(2, '0')}:${String(localStartsAt.getMinutes()).padStart(2, '0')}`,
        duration: Math.round(
          (appointment.endsAt.getTime() - appointment.startsAt.getTime()) /
            (1000 * 60)
        ),
        status: appointment.status,
        notes: appointment.notes || "",
        createdAt: appointment.createdAt.toISOString(),
      };
    });

    return NextResponse.json(formattedAppointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Erro ao buscar agendamentos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      patientName,
      patientEmail,
      patientPhone,
      serviceId,
      startsAt,
      endsAt,
      notes,
    } = body;

    // Validar campos obrigatórios
    if (!patientName || !patientEmail || !serviceId || !startsAt || !endsAt) {
      return NextResponse.json(
        { error: "Campos obrigatórios não preenchidos" },
        { status: 400 }
      );
    }

    // Verificar se o serviço existe
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se já existe agendamento no horário
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        OR: [
          {
            startsAt: {
              gte: new Date(startsAt),
              lt: new Date(endsAt),
            },
          },
          {
            endsAt: {
              gt: new Date(startsAt),
              lte: new Date(endsAt),
            },
          },
        ],
      },
    });

    if (conflictingAppointment) {
      return NextResponse.json(
        { error: "Já existe um agendamento neste horário" },
        { status: 409 }
      );
    }

    // Criar o agendamento
    const appointment = await prisma.appointment.create({
      data: {
        patientName,
        email: patientEmail,
        phone: patientPhone || "",
        serviceId,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        notes: notes || "",
        status: "scheduled",
      },
      include: {
        service: true,
      },
    });

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id,
        patientName: appointment.patientName,
        patientEmail: appointment.email,
        patientPhone: appointment.phone || "",
        serviceName: appointment.service.name,
        serviceId: appointment.serviceId,
        date: appointment.startsAt.toISOString().split("T")[0],
        time: appointment.startsAt.toTimeString().slice(0, 5),
        duration: Math.round(
          (appointment.endsAt.getTime() - appointment.startsAt.getTime()) /
            (1000 * 60)
        ),
        status: appointment.status,
        notes: appointment.notes || "",
        createdAt: appointment.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Erro ao criar agendamento" },
      { status: 500 }
    );
  }
}
