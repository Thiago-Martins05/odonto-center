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
    // Log detalhado para o admin no console
    console.log("\n" + "=".repeat(80));
    console.log("🔔 NOVO AGENDAMENTO CRIADO - NOTIFICAÇÃO PARA ADMIN");
    console.log("=".repeat(80));
    console.log(`📋 ID do Agendamento: ${appointmentData.id}`);
    console.log(`👤 Paciente: ${appointmentData.patientName}`);
    console.log(`📧 Email: ${appointmentData.patientEmail}`);
    console.log(
      `📱 Telefone: ${appointmentData.patientPhone || "Não informado"}`
    );
    console.log(
      `📅 Data: ${appointmentData.startsAt.toLocaleDateString("pt-BR")}`
    );
    console.log(
      `⏰ Horário: ${appointmentData.startsAt.toLocaleTimeString(
        "pt-BR"
      )} - ${appointmentData.endsAt.toLocaleTimeString("pt-BR")}`
    );
    console.log(
      `🦷 Serviços: ${appointmentData.services.map((s) => s.name).join(", ")}`
    );
    console.log(`⏱️ Duração Total: ${appointmentData.totalDuration} minutos`);
    console.log(
      `💰 Valor Total: R$ ${(appointmentData.totalPrice / 100).toFixed(2)}`
    );
    if (appointmentData.observations) {
      console.log(`📝 Observações: ${appointmentData.observations}`);
    }
    console.log("=".repeat(80));
    console.log(
      "💡 AÇÃO REQUERIDA: Verificar disponibilidade e confirmar agendamento"
    );
    console.log("=".repeat(80) + "\n");

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

    console.log("✅ Appointment created in database:", appointment.id);
    console.log("📅 Starts at:", startsAt.toLocaleString("pt-BR"));
    console.log("⏰ Ends at:", endsAt.toLocaleString("pt-BR"));
    console.log("👤 Patient:", data.patientName);
    console.log("📧 Email:", data.patientEmail);
    console.log("🦷 Services:", data.services.map((s: Service) => s.name).join(", "));
    console.log("⏱️ Total duration:", totalDuration, "minutes");
    console.log(
      "💰 Total price:",
      data.services.reduce((total: number, s: Service) => total + s.priceCents, 0) / 100,
      "reais"
    );

    // Se houver múltiplos serviços, criar agendamentos adicionais
    if (data.services.length > 1) {
      console.log("🔄 Creating additional appointments for multiple services...");
      
      for (let i = 1; i < data.services.length; i++) {
        const service = data.services[i];
        const serviceStartsAt = new Date(endsAt.getTime() + (i - 1) * 15 * 60 * 1000); // 15 min gap
        const serviceEndsAt = new Date(serviceStartsAt.getTime() + service.durationMin * 60 * 1000);
        
        await prisma.appointment.create({
          data: {
            patientName: data.patientName,
            email: data.patientEmail,
            phone: data.patientPhone || "",
            startsAt: serviceStartsAt,
            endsAt: serviceEndsAt,
            notes: `Serviço adicional: ${service.name}. ${data.observations || ""}`,
            status: "scheduled",
            serviceId: service.id,
          },
        });
        
        console.log(`✅ Additional appointment created for: ${service.name}`);
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
      totalPrice: data.services.reduce((total: number, s: Service) => total + s.priceCents, 0),
      observations: data.observations,
    });

    // Enviar email de confirmação
    try {
      const emailResult = await sendAppointmentConfirmation(appointment.id);
      if (emailResult.success) {
        console.log("📧 Confirmation email sent successfully");
      } else {
        console.log("📧 Email service not available:", emailResult.message);
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
        totalPrice: data.services.reduce((total: number, s: Service) => total + s.priceCents, 0),
      },
    };
  } catch (error) {
    console.error("❌ Error creating appointment:", error);
    return {
      success: false,
      error: "Falha ao criar agendamento. Tente novamente.",
    };
  }
}
