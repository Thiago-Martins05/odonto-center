import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verificar se o agendamento existe
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Agendamento não encontrado" },
        { status: 404 }
      );
    }

    // Excluir o agendamento
    await prisma.appointment.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Agendamento excluído com sucesso",
    });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return NextResponse.json(
      { error: "Erro ao excluir agendamento" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Verificar se o agendamento existe
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { error: "Agendamento não encontrado" },
        { status: 404 }
      );
    }

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

    // Verificar se já existe agendamento no horário (excluindo o atual)
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        id: { not: id },
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

    // Atualizar o agendamento
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        patientName,
        email: patientEmail,
        phone: patientPhone || "",
        serviceId,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        notes: notes || "",
      },
      include: {
        service: true,
      },
    });

    return NextResponse.json({
      success: true,
      appointment: {
        id: updatedAppointment.id,
        patientName: updatedAppointment.patientName,
        patientEmail: updatedAppointment.email,
        patientPhone: updatedAppointment.phone || "",
        serviceName: updatedAppointment.service.name,
        serviceId: updatedAppointment.serviceId,
        date: updatedAppointment.startsAt.toISOString().split("T")[0],
        time: updatedAppointment.startsAt.toTimeString().slice(0, 5),
        duration: Math.round(
          (updatedAppointment.endsAt.getTime() -
            updatedAppointment.startsAt.getTime()) /
            (1000 * 60)
        ),
        status: updatedAppointment.status,
        notes: updatedAppointment.notes || "",
        createdAt: updatedAppointment.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar agendamento" },
      { status: 500 }
    );
  }
}
