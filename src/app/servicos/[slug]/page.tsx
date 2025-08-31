import { notFound } from "next/navigation";
import { getServiceBySlug } from "@/server/admin/services";
import { formatPrice, formatDuration } from "@/types/service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Calendar, Clock, DollarSign, User } from "lucide-react";
import Link from "next/link";

interface ServiceDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ServiceDetailPage({
  params,
}: ServiceDetailPageProps) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Serviços", href: "/servicos" },
            { label: service.name },
          ]}
          className="mb-8"
        />

        {/* Service Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {service.name}
              </h1>
              <div className="flex items-center space-x-4">
                <Badge
                  variant={service.active ? "default" : "secondary"}
                  className="text-sm"
                >
                  {service.active ? "Disponível" : "Indisponível"}
                </Badge>
                <span className="text-gray-500 text-sm">ID: {service.id}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {formatPrice(service.priceCents)}
              </div>
              <div className="text-gray-600 text-sm">
                {formatDuration(service.durationMin)}
              </div>
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Descrição do Serviço
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {service.description || "Descrição não disponível."}
                </p>
              </CardContent>
            </Card>

            {/* What's Included */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">O que está incluído:</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700">
                      Avaliação profissional especializada
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700">
                      Equipamentos modernos e seguros
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700">
                      Ambiente higiênico e confortável
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700">
                      Acompanhamento pós-procedimento
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Preparation Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Como se preparar:</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Agendamento
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Entre em contato para agendar seu horário preferido
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Documentação
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Traga seus documentos pessoais e histórico médico
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Chegada
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Chegue 15 minutos antes do horário agendado
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-sm text-gray-600">Preço</div>
                    <div className="font-semibold text-gray-900">
                      {formatPrice(service.priceCents)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-600">Duração</div>
                    <div className="font-semibold text-gray-900">
                      {formatDuration(service.durationMin)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="text-sm text-gray-600">Disponibilidade</div>
                    <div className="font-semibold text-gray-900">
                      {service.active
                        ? "Agendamento aberto"
                        : "Temporariamente indisponível"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA Buttons */}
            <div className="space-y-3">
              {service.active ? (
                <Button asChild className="w-full" size="lg">
                  <Link href="/agenda">Agendar Agora</Link>
                </Button>
              ) : (
                <Button disabled className="w-full" size="lg">
                  Serviço Indisponível
                </Button>
              )}

              <Button variant="outline" asChild className="w-full" size="lg">
                <Link href="/contato">Fazer Pergunta</Link>
              </Button>
            </div>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Precisa de ajuda?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  Nossa equipe está pronta para esclarecer suas dúvidas sobre
                  este serviço.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">📞</span>
                    <span className="text-gray-700">(11) 99999-9999</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">📧</span>
                    <span className="text-gray-700">
                      contato@odontocenter.com
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">💬</span>
                    <span className="text-gray-700">WhatsApp disponível</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Services */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Outros Serviços
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Limpeza Dental Profunda
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  Remoção de tártaro e placa bacteriana
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 font-semibold">R$ 80,00</span>
                  <Link
                    href="/servicos/limpeza-dental-profunda"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Ver detalhes →
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Clareamento Dental
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  Tratamento estético para dentes mais brancos
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 font-semibold">R$ 300,00</span>
                  <Link
                    href="/servicos/clareamento-dental"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Ver detalhes →
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Restaurações (Obturações)
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  Correção de dentes cariados ou fraturados
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 font-semibold">R$ 100,00</span>
                  <Link
                    href="/servicos/restauracoes-obturacao"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Ver detalhes →
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Back to Services */}
        <div className="text-center">
          <Button variant="outline" asChild>
            <Link href="/servicos">← Voltar para todos os serviços</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
