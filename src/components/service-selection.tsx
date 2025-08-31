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
import { getServices } from "@/server/admin/services";

interface ServiceSelectionProps {
  onServiceSelect: (services: Service[]) => void;
}

export function ServiceSelection({ onServiceSelect }: ServiceSelectionProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setError(null);
      const fetchedServices = await getServices();
      setServices(fetchedServices);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching services:", error);
      setError("Não foi possível carregar os serviços. Tente novamente.");
      setLoading(false);
    }
  };

  const toggleServiceSelection = (service: Service) => {
    setSelectedServices((prev) => {
      const isSelected = prev.some((s) => s.id === service.id);
      if (isSelected) {
        return prev.filter((s) => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const isServiceSelected = (service: Service) => {
    return selectedServices.some((s) => s.id === service.id);
  };

  const getTotalDuration = () => {
    return selectedServices.reduce((total, service) => total + service.durationMin, 0);
  };

  const getTotalPrice = () => {
    return selectedServices.reduce((total, service) => total + service.priceCents, 0);
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
          Escolha os Serviços
        </h2>
        <p className="text-muted-foreground">
          Selecione um ou mais serviços que deseja agendar
        </p>
      </div>

      {/* Resumo da seleção */}
      {selectedServices.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <h3 className="font-semibold text-primary mb-3">
            Serviços Selecionados ({selectedServices.length})
          </h3>
          <div className="space-y-2">
            {selectedServices.map((service) => (
              <div key={service.id} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{service.name}</span>
                <span className="text-muted-foreground">
                  {formatPrice(service.priceCents)}
                </span>
              </div>
            ))}
            <div className="border-t border-primary/20 pt-2 mt-3">
              <div className="flex items-center justify-between font-semibold">
                <span>Total:</span>
                <span className="text-primary">{formatPrice(getTotalPrice())}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Duração total: {formatDuration(getTotalDuration())}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service) => (
          <Card
            key={service.id}
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
              isServiceSelected(service)
                ? "ring-2 ring-primary bg-primary/5"
                : "hover:bg-muted/50"
            }`}
            onClick={() => toggleServiceSelection(service)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg font-semibold text-foreground">
                  {service.name}
                </CardTitle>
                {isServiceSelected(service) && (
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
          onClick={() => selectedServices.length > 0 && onServiceSelect(selectedServices)}
          disabled={selectedServices.length === 0}
          className="px-8 py-3 text-lg font-semibold rounded-2xl"
        >
          Continuar com {selectedServices.length} serviço{selectedServices.length !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  );
}
