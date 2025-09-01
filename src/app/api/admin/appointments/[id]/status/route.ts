import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    // Validar status
    const validStatuses = ["scheduled", "confirmed", "cancelled", "done"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }

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

    // Atualizar o status
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        service: true,
      },
    });

    return NextResponse.json({
      success: true,
      appointmentId: id,
      status: status,
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar status do agendamento" },
      { status: 500 }
    );
  }
}
