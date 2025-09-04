"use server";

import { z } from "zod";
import { Service } from "@/types/service";
import { prisma } from "@/server/db";

const serviceSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z
    .string()
    .min(3, "Descrição deve ter pelo menos 3 caracteres")
    .optional()
    .nullable()
    .transform((val) => (val === "" || val === null ? null : val)), // Transforma string vazia em null
  durationMin: z
    .number()
    .min(15, "Duração mínima é 15 minutos")
    .max(480, "Duração máxima é 8 horas"),
  priceCents: z.number().min(0, "Preço deve ser maior que zero"),
  active: z.boolean(),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;

export async function getServices(): Promise<Service[]> {
  try {
    // Buscar todos os serviços do banco de dados (ativos e inativos)
    const services = await prisma.service.findMany({
      orderBy: { name: "asc" },
    });

    // Converter para o formato esperado pelo frontend
    return services.map((service) => ({
      id: service.id,
      name: service.name,
      slug: service.slug,
      description: service.description,
      durationMin: service.durationMin,
      priceCents: service.priceCents,
      active: service.active,
    }));
  } catch (error) {
    console.error("Error fetching services from database:", error);
    throw new Error("Failed to fetch services");
  }
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  try {
    // Buscar serviço real do banco de dados
    const service = await prisma.service.findUnique({
      where: { slug: slug },
    });

    if (!service) {
      return null;
    }

    // Converter para o formato esperado pelo frontend
    return {
      id: service.id,
      name: service.name,
      slug: service.slug,
      description: service.description,
      durationMin: service.durationMin,
      priceCents: service.priceCents,
      active: service.active,
    };
  } catch (error) {
    console.error("Error fetching service by slug from database:", error);
    throw new Error("Failed to fetch service");
  }
}

export async function createService(data: ServiceFormData): Promise<Service> {
  try {
    const validatedData = serviceSchema.parse(data);

    // Criar slug baseado no nome
    let baseSlug = data.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    // Verificar se o slug já existe e criar um único
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      const existingService = await prisma.service.findUnique({
        where: { slug }
      });
      
      if (!existingService) {
        break;
      }
      
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const service = await prisma.service.create({
      data: {
        ...validatedData,
        slug,
      },
    });

    return {
      id: service.id,
      name: service.name,
      slug: service.slug,
      description: service.description,
      durationMin: service.durationMin,
      priceCents: service.priceCents,
      active: service.active,
    };
  } catch (error) {
    console.error("Error creating service:", error);
    
    // Retornar erro mais específico
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        throw new Error("Já existe um serviço com este nome");
      }
      if (error.message.includes("Validation error")) {
        throw new Error("Dados inválidos fornecidos");
      }
    }
    
    throw new Error(`Failed to create service: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

export async function updateService(
  id: string,
  data: ServiceFormData
): Promise<Service> {
  try {
    const validatedData = serviceSchema.parse(data);

    // Criar slug baseado no nome se o nome foi alterado
    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      throw new Error("Service not found");
    }

    const updateData: Record<string, unknown> = { ...validatedData };

    // Só atualiza o slug se o nome mudou
    if (existingService.name !== data.name) {
      updateData.slug = data.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    }

    const service = await prisma.service.update({
      where: { id },
      data: updateData,
    });

    return {
      id: service.id,
      name: service.name,
      slug: service.slug,
      description: service.description,
      durationMin: service.durationMin,
      priceCents: service.priceCents,
      active: service.active,
    };
  } catch (error) {
    console.error("Error updating service:", error);
    throw new Error("Failed to update service");
  }
}

export async function deleteService(id: string): Promise<void> {
  try {
    await prisma.service.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Error deleting service:", error);
    throw new Error("Failed to delete service");
  }
}

export async function toggleServiceStatus(id: string): Promise<Service> {
  try {
    // Primeiro buscar o serviço atual
    const currentService = await prisma.service.findUnique({
      where: { id },
    });

    if (!currentService) {
      throw new Error("Service not found");
    }

    // Atualizar com o status oposto
    const service = await prisma.service.update({
      where: { id },
      data: { active: !currentService.active },
    });

    return {
      id: service.id,
      name: service.name,
      slug: service.slug,
      description: service.description,
      durationMin: service.durationMin,
      priceCents: service.priceCents,
      active: service.active,
    };
  } catch (error) {
    console.error("Error toggling service status:", error);
    throw new Error("Failed to toggle service status");
  }
}
