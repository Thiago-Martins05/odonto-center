"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Service, formatPrice, formatDuration } from "@/types/service";
import { ServiceSkeleton } from "./skeletons/service-skeleton";

interface ServiceSelectionProps {
  onServiceSelect: (service: Service) => void;
}

export function ServiceSelection({ onServiceSelect }: ServiceSelectionProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setError(null);
      // TODO: Replace with actual API call
      // For now, using mock data
      const mockServices: Service[] = [
        {
          id: "1",
          name: "Limpeza Dental Profunda",
          description:
            "A limpeza profissional, também conhecida como profilaxia, é fundamental para a saúde bucal.",
          durationMin: 40,
          priceCents: 8000, // R$ 80,00
          slug: "limpeza-dental-profunda",
          active: true,
        },
        {
          id: "2",
          name: "Clareamento Dental",
          description:
            "O clareamento dental é um procedimento seguro e eficaz que remove pigmentações.",
          durationMin: 60,
          priceCents: 30000, // R$ 300,00
          slug: "clareamento-dental",
          active: true,
        },
        {
          id: "3",
          name: "Tratamento de Canal (Endodontia)",
          description:
            "O tratamento de canal é necessário quando a polpa dentária está inflamada ou infectada.",
          durationMin: 90,
          priceCents: 35000, // R$ 350,00
          slug: "tratamento-canal-endodontia",
          active: true,
        },
        {
          id: "4",
          name: "Restaurações (Obturações)",
          description:
            "A restauração dentária recupera a forma e a função de dentes danificados por cáries.",
          durationMin: 45,
          priceCents: 10000, // R$ 100,00
          slug: "restauracoes-obturacao",
          active: true,
        },
      ];

      setServices(mockServices);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching services:", error);
      setError("Não foi possível carregar os serviços. Tente novamente.");
      setLoading(false);
    }
  };

  if (loading) {
    return <ServiceSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          Ops! Algo deu errado
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">{error}</p>
        <Button onClick={fetchServices} variant="outline" className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          Nenhum serviço disponível
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          No momento não temos serviços disponíveis para agendamento. Tente
          novamente mais tarde.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Escolha o Serviço
        </h2>
        <p className="text-muted-foreground">
          Selecione o serviço que deseja agendar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service) => (
          <Card
            key={service.id}
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
              selectedService?.id === service.id
                ? "ring-2 ring-primary bg-primary/5"
                : "hover:bg-muted/50"
            }`}
            onClick={() => setSelectedService(service)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg font-semibold text-foreground">
                  {service.name}
                </CardTitle>
                {selectedService?.id === service.id && (
                  <CheckCircle className="w-6 h-6 text-primary" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm leading-relaxed">
                {service.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge
                    variant="secondary"
                    className="flex items-center space-x-1"
                  >
                    <Clock className="w-3 h-3" />
                    <span>{formatDuration(service.durationMin)}</span>
                  </Badge>
                  <Badge
                    variant="outline"
                    className="flex items-center space-x-1"
                  >
                    <DollarSign className="w-3 h-3" />
                    <span>{formatPrice(service.priceCents)}</span>
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center pt-6">
        <Button
          size="lg"
          onClick={() => selectedService && onServiceSelect(selectedService)}
          disabled={!selectedService}
          className="px-8 py-3 text-lg font-semibold rounded-2xl"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
