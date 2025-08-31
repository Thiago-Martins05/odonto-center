import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/server/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sobre a Clínica | Odonto Center",
  description: "Conheça nossa missão, diferenciais e estrutura.",
};

// Forçar renderização dinâmica para evitar problemas no build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AboutPage() {
  let clinic = null;
  
  try {
    clinic = await prisma.clinicInfo.findFirst();
  } catch (error) {
    console.error('Erro ao carregar informações da clínica:', error);
    // Em caso de erro, clinic permanece null
  }

  const defaultHighlights = [
    "Biossegurança",
    "Tecnologia de ponta",
    "Atendimento humanizado",
    "Profissionais especializados",
    "Ambiente acolhedor",
  ];

  const highlights = clinic?.highlights || defaultHighlights;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Sobre a Odonto Center
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          {clinic?.slogan ||
            "Cuidado profissional e acolhimento em cada atendimento."}
        </p>
      </div>

      {/* Three Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {/* Missão */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-center">Nossa Missão</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 leading-relaxed">
              Proporcionar saúde bucal de qualidade através de tratamentos
              modernos e atendimento personalizado, priorizando o bem-estar e
              satisfação de nossos pacientes.
            </p>
          </CardContent>
        </Card>

        {/* Diferenciais */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-center">Diferenciais</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-600">
              {highlights.map((highlight: string, index: number) => (
                <li key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Estrutura */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-center">Estrutura</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 leading-relaxed">
              Clínica moderna equipada com tecnologia avançada, salas de
              tratamento climatizadas e ambiente acolhedor para proporcionar
              conforto e segurança.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Location and Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {/* Left Card - Location */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Onde estamos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-gray-600">
                <strong>Endereço:</strong>
              </p>
              <p className="text-gray-800">
                {clinic?.address || "Av. Exemplo, 123 - Zona Norte"}
              </p>
              <p className="text-gray-800">
                {clinic?.cityState || "Natal - RN"}
              </p>
            </div>
            <Button asChild variant="outline" className="w-full rounded-xl">
              <Link href="/contato">Ver contatos e horário</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Right Card - Map */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Localização</CardTitle>
          </CardHeader>
          <CardContent>
            {clinic?.mapEmbedUrl ? (
              <div className="aspect-video rounded-2xl overflow-hidden">
                <iframe
                  src={clinic.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localização da Odonto Center"
                />
              </div>
            ) : (
              <div className="aspect-video rounded-2xl bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500 text-center">Mapa em breve</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="text-center">
        <Button asChild size="lg" className="rounded-2xl text-lg px-8 py-6">
          <Link href="/agenda">Agendar agora</Link>
        </Button>
      </div>
    </div>
  );
}
