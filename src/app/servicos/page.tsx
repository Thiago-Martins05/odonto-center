import { Metadata } from "next";
import { prisma } from "@/server/db";
import { ServiceCard } from "@/components/service-card";
import { Service } from "@/types/service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, Users, Shield, Star } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Serviços | Odonto Center",
  description: "Tratamentos odontológicos com agendamento online.",
};

// Forçar renderização dinâmica para evitar problemas no build
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ServicesPage() {
  let services: Service[] = [];
  let error: string | null = null;

  try {
    services = await prisma.service.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });
  } catch (err) {
    error = err instanceof Error ? err.message : "Erro desconhecido";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Nossos Serviços
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Oferecemos uma ampla gama de tratamentos odontológicos com
            tecnologia de ponta e profissionais altamente qualificados para
            cuidar da sua saúde bucal.
          </p>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Profissionais Qualificados
            </h3>
            <p className="text-gray-600 text-sm">
              Equipe especializada com anos de experiência
            </p>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Tecnologia Avançada
            </h3>
            <p className="text-gray-600 text-sm">
              Equipamentos modernos e seguros
            </p>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Agendamento Flexível
            </h3>
            <p className="text-gray-600 text-sm">
              Horários que se adaptam à sua rotina
            </p>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Star className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Atendimento Premium
            </h3>
            <p className="text-gray-600 text-sm">
              Cuidado personalizado e acolhedor
            </p>
          </Card>
        </div>

        {/* Services Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Tratamentos Disponíveis
              </h2>
              <p className="text-gray-600">
                {services.length} serviço{services.length !== 1 ? "s" : ""}{" "}
                disponível{services.length !== 1 ? "is" : ""} para agendamento
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {services.length} ativos
              </Badge>
              <Button asChild variant="outline" size="sm">
                <Link href="/agenda">Ver Agenda</Link>
              </Button>
            </div>
          </div>



          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <strong>Erro:</strong> {error}
            </div>
          )}

          {services.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum serviço disponível
              </h3>
              <p className="text-gray-500 mb-4">
                No momento, não temos serviços ativos para agendamento.
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

        {/* CTA Section */}
        <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Pronto para cuidar da sua saúde bucal?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Agende sua consulta hoje mesmo e dê o primeiro passo para um sorriso
            mais saudável e bonito.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/agenda">Agendar Consulta</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/contato">Falar com Especialista</Link>
            </Button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Preços Transparentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Todos os nossos preços são claros e sem surpresas. Consulte o
                valor de cada serviço e escolha o que melhor se adapta ao seu
                orçamento.
              </p>
              <Button variant="outline" asChild>
                <Link href="/contato">Solicitar Orçamento</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Horários Flexíveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Oferecemos horários durante a semana e aos sábados para sua
                conveniência. Agende no horário que melhor se adapta à sua
                rotina.
              </p>
              <Button variant="outline" asChild>
                <Link href="/agenda">Ver Horários</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
