"use server";

import { sendAppointmentConfirmation } from "./email";
import { Service } from "@/types/service";
import { prisma } from "@/server/db";

// Função para notificar o admin sobre novo agendamento
async function notifyAdminAboutNewAppointment(appointmentData: {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  startsAt: Date;
  endsAt: Date;
  services: Service[];
  totalDuration: number;
  totalPrice: number;
  observations?: string;
}) {
  try {


    // TODO: Aqui você pode implementar:
    // 1. Envio de email para o admin
    // 2. Notificação push
    // 3. Webhook para sistema externo
    // 4. Integração com WhatsApp Business API

    return true;
  } catch (error) {
    console.error("❌ Erro ao notificar admin:", error);
    return false;
  }
}

export interface CreateAppointmentData {
  services: Service[];
  selectedSlot: string;
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  observations?: string;
}

export async function createAppointment(data: CreateAppointmentData) {
  try {
    // Testar conexão com o banco
    try {
      await prisma.$queryRaw`SELECT 1 as test`;
    } catch (dbError) {
      console.error("❌ Database connection failed:", dbError);
      throw new Error("Falha na conexão com o banco de dados");
    }

    // Calcular duração total e horário de fim
    const totalDuration = data.services.reduce(
      (total: number, service: Service) => total + service.durationMin,
      0
    );
    const startsAt = new Date(data.selectedSlot);
    const endsAt = new Date(startsAt.getTime() + totalDuration * 60 * 1000);



    // Criar o agendamento principal com o primeiro serviço
    const appointment = await prisma.appointment.create({
      data: {
        patientName: data.patientName,
        email: data.patientEmail,
        phone: data.patientPhone || "",
        startsAt,
        endsAt,
        notes: data.observations || "",
        status: "scheduled",
        serviceId: data.services[0].id, // Usar o primeiro serviço
      },
    });



    // Se houver múltiplos serviços, criar agendamentos adicionais
    if (data.services.length > 1) {


      for (let i = 1; i < data.services.length; i++) {
        const service = data.services[i];
        const serviceStartsAt = new Date(
          endsAt.getTime() + (i - 1) * 15 * 60 * 1000
        ); // 15 min gap
        const serviceEndsAt = new Date(
          serviceStartsAt.getTime() + service.durationMin * 60 * 1000
        );



        await prisma.appointment.create({
          data: {
            patientName: data.patientName,
            email: data.patientEmail,
            phone: data.patientPhone || "",
            startsAt: serviceStartsAt,
            endsAt: serviceEndsAt,
            notes: `Serviço adicional: ${service.name}. ${
              data.observations || ""
            }`,
            status: "scheduled",
            serviceId: service.id,
          },
        });


      }
    }



    // NOTIFICAR O ADMIN sobre o novo agendamento
    await notifyAdminAboutNewAppointment({
      id: appointment.id,
      patientName: data.patientName,
      patientEmail: data.patientEmail,
      patientPhone: data.patientPhone,
      startsAt,
      endsAt,
      services: data.services,
      totalDuration,
      totalPrice: data.services.reduce(
        (total: number, s: Service) => total + s.priceCents,
        0
      ),
      observations: data.observations,
    });



    // Enviar email de confirmação
    try {
      const emailResult = await sendAppointmentConfirmation(appointment.id);
      if (emailResult.success) {

      } else {

      }
    } catch (emailError) {
      console.error("❌ Failed to send confirmation email:", emailError);
      // Não falhar o agendamento se o email falhar
    }



    return {
      success: true,
      appointmentId: appointment.id,
      message: "Agendamento criado com sucesso!",
      appointment: {
        id: appointment.id,
        startsAt: appointment.startsAt,
        endsAt: appointment.endsAt,
        services: data.services,
        totalDuration,
        totalPrice: data.services.reduce(
          (total: number, s: Service) => total + s.priceCents,
          0
        ),
      },
    };
  } catch (error) {
    console.error("❌ Error creating appointment:", error);
    console.error("❌ Error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack trace",
    });
    return {
      success: false,
      error: "Falha ao criar agendamento. Tente novamente.",
    };
  }
}
