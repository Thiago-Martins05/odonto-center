"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Service } from "@/types/service";
import { TimeSlotSkeleton } from "./skeletons/time-slot-skeleton";

interface TimeSelectionProps {
  services: Service[];
  onTimeSelect: (selectedSlot: string) => void;
  onBack: () => void;
}

interface DaySlots {
  date: string;
  slots: string[];
  dateKey: string;
}

export function TimeSelection({
  services,
  onTimeSelect,
  onBack,
}: TimeSelectionProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<DaySlots[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailableSlots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const weekStart = getWeekStart(currentWeek);
      const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);

      // Usar a API real de disponibilidade com timestamp para evitar cache
      const timestamp = Date.now();
      const apiUrl = `/api/availability/slots?weekStart=${weekStart.toISOString()}&weekEnd=${weekEnd.toISOString()}&serviceId=${
        services[0]?.id || ""
      }&t=${timestamp}`;



      console.log("🔍 Chamando API de slots:", apiUrl);
      // Force new deployment
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(
          `Falha ao buscar horários disponíveis: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("📥 Dados recebidos da API:", data);
      
      if (data.success) {
        console.log("📅 Dias com horários:", data.data.days.length);
        data.data.days.forEach((day: any) => {
          console.log(`   ${day.date}: ${day.slots.length} horários`);
        });
        setAvailableSlots(data.data.days);
      } else {
        throw new Error(data.error || "Erro desconhecido na API");
      }
    } catch (error) {
      console.error("❌ Error fetching slots:", error);
      setError(
        `Não foi possível carregar os horários disponíveis: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );

      // NÃO usar dados mockados - manter array vazio para forçar usuário a tentar novamente
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  }, [currentWeek, services]);

  useEffect(() => {
    fetchAvailableSlots();
  }, [fetchAvailableSlots]);

  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday = 1
    return new Date(d.setDate(diff));
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    }).format(date);
  };

  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getWeekdayName = (date: Date): string => {
    return new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(date);
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeek = new Date(currentWeek);
    if (direction === "prev") {
      newWeek.setDate(newWeek.getDate() - 7);
    } else {
      newWeek.setDate(newWeek.getDate() + 7);
    }
    
    // Always allow navigation - the API will filter out past dates
    setCurrentWeek(newWeek);
  };

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
  };

  const handleContinue = () => {
    if (selectedSlot) {
      onTimeSelect(selectedSlot);
    }
  };

  if (loading) {
    return <TimeSlotSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Button>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Escolha o Horário
            </h2>
            <p className="text-muted-foreground">
              {services.length} serviço{services.length !== 1 ? "s" : ""}{" "}
              selecionado{services.length !== 1 ? "s" : ""} •{" "}
              {services.reduce(
                (total: number, s: Service) => total + s.durationMin,
                0
              )}{" "}
              min total
            </p>
          </div>
          <div className="w-20"></div>
        </div>

        <div className="text-center py-12 space-y-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            Ops! Algo deu errado
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">{error}</p>
          <Button
            onClick={fetchAvailableSlots}
            variant="outline"
            className="mt-4"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center space-x-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Voltar</span>
        </Button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Escolha o Horário
          </h2>
          <p className="text-muted-foreground">
            {services.length} serviço{services.length !== 1 ? "s" : ""}{" "}
            selecionado{services.length !== 1 ? "s" : ""} •{" "}
            {services.reduce(
              (total: number, s: Service) => total + s.durationMin,
              0
            )}{" "}
            min total
          </p>
        </div>
        <div className="w-20"></div> {/* Spacer for centering */}
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateWeek("prev")}
          disabled={(() => {
            const today = new Date();
            const weekStart = getWeekStart(currentWeek);
            const todayWeekStart = getWeekStart(today);
            // Disable only if we're at today's week
            return weekStart.getTime() === todayWeekStart.getTime();
          })()}
          className="flex items-center space-x-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Semana anterior</span>
        </Button>

        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground">
            {formatDate(getWeekStart(currentWeek))} -{" "}
            {formatDate(
              new Date(
                getWeekStart(currentWeek).getTime() + 6 * 24 * 60 * 60 * 1000
              )
            )}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateWeek("next")}
          className="flex items-center space-x-2"
        >
          <span>Próxima semana</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAvailableSlots}
          disabled={loading}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>{loading ? "Carregando..." : "Atualizar horários"}</span>
        </Button>
      </div>

      {/* Status Info */}
      {availableSlots.length > 0 && (
        <div className="text-center mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-sm font-medium text-green-700">
              ✅ Horários sincronizados com o painel administrativo
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            📅 {availableSlots.length} dia
            {availableSlots.length !== 1 ? "s" : ""} com horários disponíveis
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Última atualização: {new Date().toLocaleTimeString("pt-BR")}
          </p>
        </div>
      )}

      {/* No Slots Message */}
      {availableSlots.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Nenhum horário disponível nesta semana
          </h3>
          <p className="text-muted-foreground mb-4">
            Verifique as configurações de disponibilidade no painel
            administrativo
          </p>
          <Button
            onClick={fetchAvailableSlots}
            variant="outline"
            className="flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Verificar novamente</span>
          </Button>
        </div>
      )}

      {/* Weekly Slots */}
      {availableSlots.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableSlots.map((day) => (
            <Card key={day.dateKey} className="rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-center text-lg">
                  {getWeekdayName(new Date(day.dateKey))}
                </CardTitle>
                <p className="text-center text-sm text-muted-foreground">
                  {day.date}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {day.slots.map((slot) => (
                    <Button
                      key={slot}
                      variant={selectedSlot === slot ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSlotSelect(slot)}
                      className="text-xs h-8"
                    >
                      {formatTime(slot)}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-center pt-6">
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={!selectedSlot}
          className="px-8 py-3 text-lg font-semibold rounded-2xl"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}

