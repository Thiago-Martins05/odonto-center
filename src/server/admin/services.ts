"use server";

import { z } from "zod";

const serviceSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z
    .string()
    .min(10, "Descrição deve ter pelo menos 10 caracteres"),
  durationMin: z
    .number()
    .min(15, "Duração mínima é 15 minutos")
    .max(480, "Duração máxima é 8 horas"),
  price: z.number().min(0, "Preço deve ser maior que zero"),
  active: z.boolean(),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;

export interface Service {
  id: string;
  name: string;
  description: string;
  durationMin: number;
  price: number;
  active: boolean;
}

// Mock database for now - replace with actual Prisma calls
let mockServices: Service[] = [
  {
    id: "1",
    name: "Consulta de Avaliação",
    description:
      "Avaliação completa da saúde bucal com plano de tratamento personalizado",
    durationMin: 60,
    price: 15000,
    active: true,
  },
  {
    id: "2",
    name: "Limpeza e Profilaxia",
    description:
      "Limpeza profissional, remoção de tártaro e polimento dos dentes",
    durationMin: 45,
    price: 12000,
    active: true,
  },
  {
    id: "3",
    name: "Tratamento de Canal",
    description: "Tratamento endodôntico completo com anestesia local",
    durationMin: 90,
    price: 80000,
    active: false,
  },
];

export async function getServices(): Promise<Service[]> {
  try {
    // TODO: Replace with actual Prisma call
    // const services = await prisma.service.findMany({
    //   orderBy: { name: 'asc' }
    // });

    return mockServices;
  } catch (error) {
    console.error("Error fetching services:", error);
    throw new Error("Failed to fetch services");
  }
}

export async function createService(data: ServiceFormData): Promise<Service> {
  try {
    const validatedData = serviceSchema.parse(data);

    // TODO: Replace with actual Prisma call
    // const service = await prisma.service.create({
    //   data: validatedData
    // });

    const newService: Service = {
      id: `service_${Date.now()}`,
      ...validatedData,
    };

    mockServices.push(newService);
    return newService;
  } catch (error) {
    console.error("Error creating service:", error);
    throw new Error("Failed to create service");
  }
}

export async function updateService(
  id: string,
  data: ServiceFormData
): Promise<Service> {
  try {
    const validatedData = serviceSchema.parse(data);

    // TODO: Replace with actual Prisma call
    // const service = await prisma.service.update({
    //   where: { id },
    //   data: validatedData
    // });

    const serviceIndex = mockServices.findIndex((s) => s.id === id);
    if (serviceIndex === -1) {
      throw new Error("Service not found");
    }

    const updatedService: Service = {
      ...mockServices[serviceIndex],
      ...validatedData,
    };

    mockServices[serviceIndex] = updatedService;
    return updatedService;
  } catch (error) {
    console.error("Error updating service:", error);
    throw new Error("Failed to update service");
  }
}

export async function deleteService(id: string): Promise<void> {
  try {
    // TODO: Replace with actual Prisma call
    // await prisma.service.delete({
    //   where: { id }
    // });

    mockServices = mockServices.filter((s) => s.id !== id);
  } catch (error) {
    console.error("Error deleting service:", error);
    throw new Error("Failed to delete service");
  }
}

export async function toggleServiceStatus(id: string): Promise<Service> {
  try {
    // TODO: Replace with actual Prisma call
    // const service = await prisma.service.update({
    //   where: { id },
    //   data: { active: { not: true } }
    // });

    const serviceIndex = mockServices.findIndex((s) => s.id === id);
    if (serviceIndex === -1) {
      throw new Error("Service not found");
    }

    const updatedService: Service = {
      ...mockServices[serviceIndex],
      active: !mockServices[serviceIndex].active,
    };

    mockServices[serviceIndex] = updatedService;
    return updatedService;
  } catch (error) {
    console.error("Error toggling service status:", error);
    throw new Error("Failed to toggle service status");
  }
}
