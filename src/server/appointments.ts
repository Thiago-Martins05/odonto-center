"use server";

import { sendAppointmentConfirmation } from "./email";
import { Service } from "@/types/service";

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
    // TODO: Replace with actual database insert
    // For now, simulate appointment creation

    // Generate a mock appointment ID
    const appointmentId = `apt_${Date.now()}`;

    // Calculate appointment end time based on total service duration
    const totalDuration = data.services.reduce(
      (total, service) => total + service.durationMin,
      0
    );
    const startsAt = new Date(data.selectedSlot);
    const endsAt = new Date(startsAt.getTime() + totalDuration * 60 * 1000);

    // Mock appointment object
    const appointment = {
      id: appointmentId,
      startsAt,
      endsAt,
      patientName: data.patientName,
      patientEmail: data.patientEmail,
      patientPhone: data.patientPhone,
      observations: data.observations,
      services: data.services,
      totalDuration,
      totalPrice: data.services.reduce(
        (total, service) => total + service.priceCents,
        0
      ),
    };

    // TODO: Insert into database
    // For multiple services, you might want to create multiple appointments
    // or a single appointment with multiple service references
    // const dbAppointment = await prisma.appointment.create({
    //   data: {
    //     id: appointment.id,
    //     startsAt: appointment.startsAt,
    //     endsAt: appointment.endsAt,
    //     patientName: appointment.patientName,
    //     patientEmail: appointment.patientEmail,
    //     patientPhone: appointment.patientPhone,
    //     observations: appointment.observations,
    //     // You might need to adjust the schema to handle multiple services
    //     // serviceId: data.services[0].id, // For now, using first service
    //     status: 'confirmed',
    //   },
    // });

    console.log("Appointment created in database:", appointment);
    console.log("Services:", data.services.map((s) => s.name).join(", "));
    console.log("Total duration:", totalDuration, "minutes");
    console.log("Total price:", appointment.totalPrice / 100, "reais");

    // Send confirmation email
    try {
      const emailResult = await sendAppointmentConfirmation(appointmentId);
      if (emailResult.success) {
        console.log("Confirmation email sent successfully");
      } else {
        console.log("Email service not available:", emailResult.message);
      }
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Don't fail the appointment creation if email fails
      // In production, you might want to queue this for retry
    }

    return {
      success: true,
      appointmentId,
      message: "Appointment created successfully",
    };
  } catch (error) {
    console.error("Error creating appointment:", error);
    return {
      success: false,
      error: "Failed to create appointment",
    };
  }
}
