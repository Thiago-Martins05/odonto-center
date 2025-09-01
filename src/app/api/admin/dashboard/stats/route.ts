import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET() {
  try {
    // Buscar estatísticas dos agendamentos
    const [
      totalAppointments,
      todayAppointments,
      activeServices,
      recentAppointments,
      recentServices,
    ] = await Promise.all([
      // Total de agendamentos
      prisma.appointment.count(),

      // Agendamentos de hoje
      prisma.appointment.count({
        where: {
          startsAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),

      // Serviços ativos
      prisma.service.count({
        where: {
          active: true,
        },
      }),

      // Agendamentos recentes (últimos 5)
      prisma.appointment.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          service: true,
        },
      }),

      // Serviços recentes (últimos 5)
      prisma.service.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    // Calcular receita mensal (aproximada)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyAppointments = await prisma.appointment.findMany({
      where: {
        startsAt: {
          gte: startOfMonth,
        },
        status: {
          in: ["confirmed", "done"],
        },
      },
      include: {
        service: true,
      },
    });

    const monthlyRevenue = monthlyAppointments.reduce((total, appointment) => {
      return total + appointment.service.priceCents;
    }, 0);

    // Criar atividade recente
    const recentActivity = [];

    // Adicionar agendamentos recentes
    recentAppointments.forEach((appointment) => {
      recentActivity.push({
        id: `appointment-${appointment.id}`,
        type: "appointment",
        description: `Novo agendamento: ${appointment.patientName} - ${appointment.service.name}`,
        timestamp: appointment.createdAt.toISOString(),
      });
    });

    // Adicionar serviços recentes
    recentServices.forEach((service) => {
      recentActivity.push({
        id: `service-${service.id}`,
        type: "service",
        description: `Serviço ${service.active ? "criado" : "atualizado"}: ${
          service.name
        }`,
        timestamp: service.createdAt.toISOString(),
      });
    });

    // Ordenar por timestamp e pegar os últimos 10
    recentActivity.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    recentActivity.splice(10);

    return NextResponse.json({
      totalAppointments,
      todayAppointments,
      activeServices,
      monthlyRevenue,
      recentActivity,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Erro ao buscar estatísticas" },
      { status: 500 }
    );
  }
}
