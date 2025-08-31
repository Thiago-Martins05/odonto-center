'use server';

import { z } from 'zod';

const appointmentStatusSchema = z.enum(['confirmed', 'done', 'cancelled']);

export type AppointmentStatus = z.infer<typeof appointmentStatusSchema>;

export interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  serviceName: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  observations?: string;
}

export interface AppointmentFilters {
  dateRangeStart?: string;
  dateRangeEnd?: string;
  serviceId?: string;
  status?: AppointmentStatus;
}

// Mock database for now - replace with actual Prisma calls
let mockAppointments: Appointment[] = [
  {
    id: "1",
    patientName: "João Silva",
    patientEmail: "joao@email.com",
    patientPhone: "(11) 99999-9999",
    serviceName: "Consulta de Avaliação",
    startsAt: "2024-12-20T10:00:00Z",
    endsAt: "2024-12-20T11:00:00Z",
    status: "confirmed",
    observations: "Primeira consulta",
  },
  {
    id: "2",
    patientName: "Maria Santos",
    patientEmail: "maria@email.com",
    patientPhone: "(11) 88888-8888",
    serviceName: "Limpeza e Profilaxia",
    startsAt: "2024-12-20T14:00:00Z",
    endsAt: "2024-12-20T14:45:00Z",
    status: "done",
  },
  {
    id: "3",
    patientName: "Pedro Costa",
    patientEmail: "pedro@email.com",
    patientPhone: "(11) 77777-7777",
    serviceName: "Tratamento de Canal",
    startsAt: "2024-12-21T09:00:00Z",
    endsAt: "2024-12-21T10:30:00Z",
    status: "cancelled",
    observations: "Paciente solicitou cancelamento",
  },
];

export async function getAppointments(filters?: AppointmentFilters): Promise<Appointment[]> {
  try {
    // TODO: Replace with actual Prisma call
    // let whereClause: any = {};
    // 
    // if (filters?.dateRangeStart) {
    //   whereClause.startsAt = { gte: new Date(filters.dateRangeStart) };
    // }
    // if (filters?.dateRangeEnd) {
    //   whereClause.startsAt = { 
    //     ...whereClause.startsAt,
    //     lte: new Date(filters.dateRangeEnd + 'T23:59:59')
    //   };
    // }
    // if (filters?.serviceId) {
    //   whereClause.serviceId = filters.serviceId;
    // }
    // if (filters?.status) {
    //   whereClause.status = filters.status;
    // }
    // 
    // const appointments = await prisma.appointment.findMany({
    //   where: whereClause,
    //   include: {
    //     service: { select: { name: true } }
    //   },
    //   orderBy: { startsAt: 'asc' }
    // });
    
    let filtered = [...mockAppointments];

    // Apply filters
    if (filters?.dateRangeStart) {
      filtered = filtered.filter(apt => 
        new Date(apt.startsAt) >= new Date(filters.dateRangeStart!)
      );
    }
    if (filters?.dateRangeEnd) {
      filtered = filtered.filter(apt => 
        new Date(apt.startsAt) <= new Date(filters.dateRangeEnd! + "T23:59:59")
      );
    }
    if (filters?.serviceId) {
      // In real implementation, you'd filter by serviceId
      // For now, we'll filter by service name
      filtered = filtered.filter(apt => apt.serviceName.includes(""));
    }
    if (filters?.status) {
      filtered = filtered.filter(apt => apt.status === filters.status);
    }

    return filtered;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw new Error('Failed to fetch appointments');
  }
}

export async function getAppointmentById(id: string): Promise<Appointment | null> {
  try {
    // TODO: Replace with actual Prisma call
    // const appointment = await prisma.appointment.findUnique({
    //   where: { id },
    //   include: {
    //     service: { select: { name: true } }
    //   }
    // });
    
    const appointment = mockAppointments.find(apt => apt.id === id);
    return appointment || null;
  } catch (error) {
    console.error('Error fetching appointment:', error);
    throw new Error('Failed to fetch appointment');
  }
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
  try {
    const validatedStatus = appointmentStatusSchema.parse(status);
    
    // TODO: Replace with actual Prisma call
    // const appointment = await prisma.appointment.update({
    //   where: { id },
    //   data: { status: validatedStatus }
    // });
    
    const appointmentIndex = mockAppointments.findIndex(apt => apt.id === id);
    if (appointmentIndex === -1) {
      throw new Error('Appointment not found');
    }
    
    const updatedAppointment: Appointment = {
      ...mockAppointments[appointmentIndex],
      status: validatedStatus,
    };
    
    mockAppointments[appointmentIndex] = updatedAppointment;
    return updatedAppointment;
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw new Error('Failed to update appointment status');
  }
}

export async function deleteAppointment(id: string): Promise<void> {
  try {
    // TODO: Replace with actual Prisma call
    // await prisma.appointment.delete({
    //   where: { id }
    // });
    
    mockAppointments = mockAppointments.filter(apt => apt.id !== id);
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw new Error('Failed to delete appointment');
  }
}

export async function getAppointmentStats(): Promise<{
  total: number;
  confirmed: number;
  done: number;
  cancelled: number;
}> {
  try {
    // TODO: Replace with actual Prisma call
    // const stats = await prisma.appointment.groupBy({
    //   by: ['status'],
    //   _count: { status: true }
    // });
    
    const total = mockAppointments.length;
    const confirmed = mockAppointments.filter(apt => apt.status === 'confirmed').length;
    const done = mockAppointments.filter(apt => apt.status === 'done').length;
    const cancelled = mockAppointments.filter(apt => apt.status === 'cancelled').length;

    return { total, confirmed, done, cancelled };
  } catch (error) {
    console.error('Error fetching appointment stats:', error);
    throw new Error('Failed to fetch appointment stats');
  }
}
