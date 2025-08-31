'use server';

import { sendAppointmentConfirmation } from './email';

export interface CreateAppointmentData {
  service: {
    id: string;
    name: string;
    description: string;
    durationMin: number;
    price: number;
  };
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
    
    // Calculate appointment end time based on service duration
    const startsAt = new Date(data.selectedSlot);
    const endsAt = new Date(startsAt.getTime() + data.service.durationMin * 60 * 1000);
    
    // Mock appointment object
    const appointment = {
      id: appointmentId,
      startsAt,
      endsAt,
      patientName: data.patientName,
      patientEmail: data.patientEmail,
      patientPhone: data.patientPhone,
      observations: data.observations,
    };
    
    // TODO: Insert into database
    // const dbAppointment = await prisma.appointment.create({
    //   data: {
    //     id: appointment.id,
    //     startsAt: appointment.startsAt,
    //     endsAt: appointment.endsAt,
    //     patientName: appointment.patientName,
    //     patientEmail: appointment.patientEmail,
    //     patientPhone: appointment.patientPhone,
    //     observations: appointment.observations,
    //     serviceId: data.service.id,
    //     status: 'confirmed',
    //   },
    // });
    
    console.log('Appointment created in database:', appointment);
    
    // Send confirmation email
    try {
      await sendAppointmentConfirmation(appointmentId);
      console.log('Confirmation email sent successfully');
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the appointment creation if email fails
      // In production, you might want to queue this for retry
    }
    
    return {
      success: true,
      appointmentId,
      message: 'Appointment created successfully',
    };
  } catch (error) {
    console.error('Error creating appointment:', error);
    return {
      success: false,
      error: 'Failed to create appointment',
    };
  }
}
