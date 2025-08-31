"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Service } from "@/types/service";
import { getServices } from "@/server/admin/services";
import Link from "next/link";

export function ServicesShowcase() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleServices, setVisibleServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const fetchedServices = await getServices();
        setServices(fetchedServices);
        setVisibleServices(fetchedServices.slice(0, 3)); // Mostrar apenas 3 por vez
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar serviços:", error);
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const nextServices = () => {
    const nextIndex = Math.min(currentIndex + 3, services.length - 3);
    setCurrentIndex(nextIndex);
    setVisibleServices(services.slice(nextIndex, nextIndex + 3));
  };

  const prevServices = () => {
    const prevIndex = Math.max(currentIndex - 3, 0);
    setCurrentIndex(prevIndex);
    setVisibleServices(services.slice(prevIndex, prevIndex + 3));
  };

  const canGoNext = currentIndex + 3 < services.length;
  const canGoPrev = currentIndex > 0;

  if (loading) {
    return (
      <section className="py-24 bg-white relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-dm-serif font-bold text-text-primary mb-6">
              Nossos Serviços
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Tratamentos completos para sua saúde bucal com a melhor tecnologia
              disponível
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-white relative">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-dm-serif font-bold text-text-primary mb-6">
            Nossos Serviços
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Tratamentos completos para sua saúde bucal com a melhor tecnologia
            disponível
          </p>
        </div>

        {/* Services Grid with Navigation */}
        <div className="relative">
          {/* Navigation Buttons */}
          {canGoPrev && (
            <Button
              onClick={prevServices}
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-10 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}

          {canGoNext && (
            <Button
              onClick={nextServices}
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-10 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          )}

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {visibleServices.map((service) => (
              <Card
                key={service.id}
                className="group bg-gradient-to-br from-light-bg to-white border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full"
              >
                <CardHeader className="text-center pb-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Clock className="w-10 h-10 text-blue-500" />
                  </div>
                  <CardTitle className="text-2xl font-semibold text-text-primary mb-3">
                    {service.name}
                  </CardTitle>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Badge variant="secondary" className="text-xs">
                      {service.active ? "Disponível" : "Indisponível"}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-text-secondary">
                      <Clock className="w-4 h-4" />
                      <span>{service.durationMin} min</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-text-secondary mb-6 leading-relaxed line-clamp-3">
                    {service.description || "Descrição não disponível."}
                  </p>
                  <Link
                    href={`/servicos/${service.slug}`}
                    className="inline-flex items-center text-primary font-medium hover:text-primary/80 transition-colors group-hover:underline"
                  >
                    Ver detalhes{" "}
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Navigation Dots */}
          {services.length > 3 && (
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: Math.ceil(services.length / 3) }).map(
                (_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const newIndex = index * 3;
                      setCurrentIndex(newIndex);
                      setVisibleServices(
                        services.slice(newIndex, newIndex + 3)
                      );
                    }}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === Math.floor(currentIndex / 3)
                        ? "bg-primary scale-125"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                )
              )}
            </div>
          )}
        </div>

        {/* View All Services Button */}
        <div className="text-center mt-12">
          <Button
            asChild
            size="lg"
            className="px-8 py-4 text-lg font-semibold rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Link href="/servicos" className="flex items-center gap-2">
              Ver todos os serviços
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
