"use server";

import { sendAppointmentConfirmation } from "./email";
import { Service } from "@/types/service";
import { prisma } from "@/server/db";

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
      (total, service) => total + service.durationMin,
      0
    );
    const startsAt = new Date(data.selectedSlot);
    const endsAt = new Date(startsAt.getTime() + totalDuration * 60 * 1000);

    // Criar o agendamento principal
    const appointment = await prisma.appointment.create({
      data: {
        patientName: data.patientName,
        email: data.patientEmail,
        phone: data.patientPhone || "",
        startsAt,
        endsAt,
        notes: data.observations || "",
        status: "scheduled",
        // Usar o primeiro serviço como principal (schema atual)
        serviceId: data.services[0].id,
      },
    });

    console.log("✅ Appointment created in database:", appointment.id);
    console.log("📅 Starts at:", startsAt.toLocaleString("pt-BR"));
    console.log("⏰ Ends at:", endsAt.toLocaleString("pt-BR"));
    console.log("👤 Patient:", data.patientName);
    console.log("📧 Email:", data.patientEmail);
    console.log("🦷 Services:", data.services.map(s => s.name).join(", "));
    console.log("⏱️ Total duration:", totalDuration, "minutes");
    console.log("💰 Total price:", data.services.reduce((total, s) => total + s.priceCents, 0) / 100, "reais");

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
        totalPrice: data.services.reduce((total, s) => total + s.priceCents, 0),
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
