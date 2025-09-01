import { NextResponse } from "next/server";

// Mock data for now - replace with actual database calls
const mockAppointments = [
  {
    id: "1",
    patientName: "Maria Silva",
    patientEmail: "maria@email.com",
    patientPhone: "(11) 99999-9999",
    serviceName: "Consulta de Rotina",
    serviceId: "1",
    date: "2024-01-15",
    time: "14:00",
    duration: 60,
    status: "confirmed",
    notes: "Paciente solicita informações sobre clareamento",
    createdAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "2",
    patientName: "João Santos",
    patientEmail: "joao@email.com",
    patientPhone: "(11) 88888-8888",
    serviceName: "Limpeza Profissional",
    serviceId: "2",
    date: "2024-01-15",
    time: "16:00",
    duration: 45,
    status: "pending",
    createdAt: "2024-01-11T14:30:00Z",
  },
  {
    id: "3",
    patientName: "Ana Costa",
    patientEmail: "ana@email.com",
    patientPhone: "(11) 77777-7777",
    serviceName: "Clareamento",
    serviceId: "3",
    date: "2024-01-16",
    time: "10:00",
    duration: 90,
    status: "cancelled",
    notes: "Cancelado pelo paciente - reagendamento solicitado",
    createdAt: "2024-01-12T09:15:00Z",
  },
  {
    id: "4",
    patientName: "Pedro Oliveira",
    patientEmail: "pedro@email.com",
    patientPhone: "(11) 66666-6666",
    serviceName: "Consulta de Rotina",
    serviceId: "1",
    date: "2024-01-14",
    time: "15:30",
    duration: 60,
    status: "completed",
    createdAt: "2024-01-09T16:45:00Z",
  },
];

export async function GET() {
  try {
    // TODO: Replace with actual database query
    return NextResponse.json(mockAppointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Erro ao buscar agendamentos" },
      { status: 500 }
    );
  }
}
