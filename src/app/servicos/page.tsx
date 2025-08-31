import { Metadata } from "next";
import { prisma } from "@/server/db";
import { ServiceCard } from "@/components/service-card";
import { Service } from "@/types/service";

export const metadata: Metadata = {
  title: "Serviços | Odonto Center",
  description: "Tratamentos odontológicos com agendamento online.",
};

// Forçar renderização dinâmica para evitar problemas no build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ServicesPage() {
  let services: Service[] = [];
  
  try {
    services = await prisma.service.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error('Erro ao carregar serviços:', error);
    // Em caso de erro, retorna array vazio
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Serviços</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Escolha o serviço ideal e agende seu horário.
        </p>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">
            Nenhum serviço disponível no momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service: Service) => (
            <ServiceCard
              key={service.id}
              slug={service.slug}
              name={service.name}
              description={service.description}
              priceCents={service.priceCents}
              durationMin={service.durationMin}
            />
          ))}
        </div>
      )}
    </div>
  );
}
