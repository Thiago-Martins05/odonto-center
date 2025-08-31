"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Calendar, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { Service } from "./scheduling-flow";
import { TimeSlotSkeleton } from "./skeletons/time-slot-skeleton";

interface TimeSelectionProps {
  service: Service;
  onTimeSelect: (selectedSlot: string) => void;
  onBack: () => void;
}

interface DaySlots {
  date: string;
  slots: string[];
  dateKey: string;
}

export function TimeSelection({
  service,
  onTimeSelect,
  onBack,
}: TimeSelectionProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<DaySlots[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableSlots();
  }, [currentWeek, service]);

  const fetchAvailableSlots = async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call to getAvailableSlots
      // For now, using mock data
      const weekStart = getWeekStart(currentWeek);
      const mockSlots: DaySlots[] = [];

      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);

        // Skip past dates
        if (date < new Date()) continue;

        const dateKey = date.toISOString().split("T")[0];
        const formattedDate = formatDate(date);

        // Generate mock slots for weekdays (Mon-Fri)
        const weekday = date.getDay();
        if (weekday >= 1 && weekday <= 5) {
          const slots = generateMockSlots(date);
          if (slots.length > 0) {
            mockSlots.push({
              date: formattedDate,
              slots,
              dateKey,
            });
          }
        }
      }

      setAvailableSlots(mockSlots);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching slots:", error);
      setError("Não foi possível carregar os horários disponíveis. Tente novamente.");
      setLoading(false);
    }
  };

  const generateMockSlots = (date: Date): string[] => {
    const slots: string[] = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotTime = new Date(date);
        slotTime.setHours(hour, minute, 0, 0);

        // Skip past times for today
        if (
          date.toDateString() === new Date().toDateString() &&
          slotTime < new Date()
        ) {
          continue;
        }

        slots.push(slotTime.toISOString());
      }
    }

    return slots;
  };

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
              {service.name} • {service.durationMin} min
            </p>
          </div>
          <div className="w-20"></div>
        </div>
        
        <div className="text-center py-12 space-y-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Ops! Algo deu errado</h3>
          <p className="text-muted-foreground max-w-md mx-auto">{error}</p>
          <Button onClick={fetchAvailableSlots} variant="outline" className="mt-4">
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
            {service.name} • {service.durationMin} min
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

      {/* Weekly Slots */}
      {availableSlots.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Nenhum horário disponível nesta semana
          </h3>
          <p className="text-muted-foreground">
            Tente navegar para outra semana ou entre em contato conosco
          </p>
        </div>
      ) : (
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
