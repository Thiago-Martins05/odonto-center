"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, CheckCircle } from "lucide-react";
import { Service } from "./scheduling-flow";

interface ServiceSelectionProps {
  onServiceSelect: (service: Service) => void;
}

export function ServiceSelection({ onServiceSelect }: ServiceSelectionProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      // TODO: Replace with actual API call
      // For now, using mock data
      const mockServices: Service[] = [
        {
          id: "1",
          name: "Consulta de Avaliação",
          description:
            "Avaliação completa da saúde bucal com plano de tratamento personalizado",
          durationMin: 60,
          price: 15000, // R$ 150,00
        },
        {
          id: "2",
          name: "Limpeza e Profilaxia",
          description:
            "Limpeza profissional, remoção de tártaro e polimento dos dentes",
          durationMin: 45,
          price: 12000, // R$ 120,00
        },
        {
          id: "3",
          name: "Tratamento de Canal",
          description: "Tratamento endodôntico completo com anestesia local",
          durationMin: 90,
          price: 80000, // R$ 800,00
        },
        {
          id: "4",
          name: "Extração Simples",
          description:
            "Remoção de dente com anestesia local e cuidados pós-operatórios",
          durationMin: 30,
          price: 20000, // R$ 200,00
        },
      ];

      setServices(mockServices);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching services:", error);
      setLoading(false);
    }
  };

  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(priceInCents / 100);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}min`;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Carregando serviços...</p>
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
                    <span>{formatPrice(service.price)}</span>
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
