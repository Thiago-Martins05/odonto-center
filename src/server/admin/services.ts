"use server";

import { z } from "zod";
import { Service } from "@/types/service";

const serviceSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z
    .string()
    .min(10, "Descrição deve ter pelo menos 10 caracteres"),
  durationMin: z
    .number()
    .min(15, "Duração mínima é 15 minutos")
    .max(480, "Duração máxima é 8 horas"),
  priceCents: z.number().min(0, "Preço deve ser maior que zero"),
  active: z.boolean(),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;

// Mock database for now - replace with actual Prisma calls
const mockServices: Service[] = [
  {
    id: "1",
    name: "Limpeza Dental Profunda",
    slug: "limpeza-dental-profunda",
    description:
      "A limpeza profissional, também conhecida como profilaxia, é fundamental para a saúde bucal. Remove tártaro, placa bacteriana e manchas superficiais dos dentes, ajudando a prevenir doenças como gengivite e cáries. Além disso, proporciona hálito fresco e sensação de limpeza imediata.",
    durationMin: 40,
    priceCents: 8000,
    active: true,
  },
  {
    id: "2",
    name: "Clareamento Dental",
    slug: "clareamento-dental",
    description:
      "O clareamento dental é um procedimento seguro e eficaz que remove pigmentações causadas por café, vinho, cigarro e outros alimentos. Pode ser feito em consultório com laser ou em casa com moldeiras. O resultado é um sorriso mais claro e rejuvenescido, sem danificar o esmalte dental.",
    durationMin: 60,
    priceCents: 30000,
    active: true,
  },
  {
    id: "3",
    name: "Restaurações (Obturações)",
    slug: "restauracoes-obturacao",
    description:
      "A restauração dentária recupera a forma e a função de dentes danificados por cáries ou pequenas fraturas. Utiliza materiais como resina composta, que se adapta à cor natural dos dentes, garantindo estética e resistência. O procedimento é rápido, indolor e evita problemas maiores no futuro.",
    durationMin: 45,
    priceCents: 10000,
    active: true,
  },
  {
    id: "4",
    name: "Extração (Simples e Siso)",
    slug: "extracao-simples-siso",
    description:
      "A extração dentária é indicada quando o dente está comprometido por cárie extensa, mobilidade, ou em casos de dentes do siso impactados. É realizada com anestesia local e acompanhamento profissional, garantindo segurança, conforto e recuperação rápida com os devidos cuidados.",
    durationMin: 45,
    priceCents: 12000,
    active: true,
  },
  {
    id: "5",
    name: "Tratamento de Canal (Endodontia)",
    slug: "tratamento-canal-endodontia",
    description:
      "O tratamento de canal é necessário quando a polpa dentária (nervo) está inflamada ou infectada. O procedimento remove o tecido comprometido, desinfeta o canal e o sela com material próprio. Evita a perda do dente e alivia dores intensas, restaurando a saúde bucal.",
    durationMin: 90,
    priceCents: 35000,
    active: true,
  },
  {
    id: "6",
    name: "Aparelhos Ortodônticos",
    slug: "aparelhos-ortodonticos",
    description:
      "A ortodontia trata problemas de posicionamento dental e mordida, com aparelhos fixos ou estéticos. Além do benefício estético, melhora a mastigação, dicção e higiene bucal. O tratamento é individualizado e pode incluir aparelhos tradicionais, autoligados ou alinhadores invisíveis.",
    durationMin: 60,
    priceCents: 180000,
    active: true,
  },
  {
    id: "7",
    name: "Próteses Dentárias",
    slug: "proteses-dentarias",
    description:
      "As próteses devolvem a função mastigatória e a aparência natural dos dentes perdidos. Podem ser parciais ou totais, removíveis ou fixas, conforme a necessidade do paciente. São produzidas sob medida, garantindo adaptação, conforto e um sorriso mais harmônico.",
    durationMin: 30,
    priceCents: 50000,
    active: true,
  },
  {
    id: "8",
    name: "Implantes Dentários",
    slug: "implantes-dentarios",
    description:
      "O implante dentário é uma estrutura de titânio inserida no osso para suportar uma prótese. É a solução mais moderna e durável para reposição dentária. Proporciona estabilidade, estética e função semelhante ao dente natural, com grande taxa de sucesso e conforto.",
    durationMin: 90,
    priceCents: 150000,
    active: true,
  },
  {
    id: "9",
    name: "Cirurgias Bucais",
    slug: "cirurgias-bucais",
    description:
      "Englobam cirurgias como frenectomia (remoção do freio labial ou lingual), biópsias, remoção de cistos, entre outras. São procedimentos rápidos e realizados com anestesia local. Visam corrigir alterações que afetam a saúde ou a estética bucal, com recuperação tranquila.",
    durationMin: 45,
    priceCents: 25000,
    active: true,
  },
  {
    id: "10",
    name: "Tratamento de Gengiva (Periodontia)",
    slug: "tratamento-gengiva-periodontia",
    description:
      "O tratamento periodontal é essencial para combater gengivite e periodontite. Inclui raspagens e orientações de higiene bucal. Ajuda a evitar a perda dentária e melhora o hálito, o conforto e a estética. Pode exigir acompanhamento regular para manter os resultados.",
    durationMin: 45,
    priceCents: 15000,
    active: true,
  },
];

export async function getServices(): Promise<Service[]> {
  try {
    // TODO: Replace with actual Prisma call
    // const services = await prisma.service.findMany({
    //   where: { active: true },
    //   orderBy: { name: 'asc' }
    // });
    
    return mockServices.filter(service => service.active);
  } catch (error) {
    console.error("Error fetching services:", error);
    return mockServices.filter(service => service.active);
  }
}

export async function createService(data: ServiceFormData): Promise<Service> {
  try {
    const validatedData = serviceSchema.parse(data);

    // TODO: Replace with actual Prisma call
    // const service = await prisma.service.create({
    //   data: {
    //     ...validatedData,
    //     slug: validatedData.name
    //       .toLowerCase()
    //       .replace(/\s+/g, "-")
    //       .replace(/[^a-z0-9-]/g, ""),
    //   }
    // });

    const newService: Service = {
      id: `service_${Date.now()}`,
      slug: validatedData.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
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
    //   data: {
    //     ...validatedData,
    //     slug: validatedData.name
    //       .toLowerCase()
    //       .replace(/\s+/g, "-")
    //       .replace(/[^a-z0-9-]/g, ""),
    //   }
    // });

    const serviceIndex = mockServices.findIndex((s) => s.id === id);
    if (serviceIndex === -1) {
      throw new Error("Service not found");
    }

    const updatedService: Service = {
      ...mockServices[serviceIndex],
      ...validatedData,
      slug: validatedData.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
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

    const serviceIndex = mockServices.findIndex((s) => s.id === id);
    if (serviceIndex !== -1) {
      mockServices.splice(serviceIndex, 1);
    }
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

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  try {
    // TODO: Replace with actual Prisma call
    // const service = await prisma.service.findUnique({
    //   where: { slug }
    // });
    
    const service = mockServices.find((s) => s.slug === slug);
    return service || null;
  } catch (error) {
    console.error("Error fetching service by slug:", error);
    throw new Error("Failed to fetch service");
  }
}
