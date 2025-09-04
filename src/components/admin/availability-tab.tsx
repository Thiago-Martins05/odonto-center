"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Calendar, Save, Plus, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

interface DaySchedule {
  day: string;
  enabled: boolean;
  timeSlots: TimeSlot[];
}

const daysOfWeek = [
  { value: "monday", label: "Segunda-feira" },
  { value: "tuesday", label: "Terça-feira" },
  { value: "wednesday", label: "Quarta-feira" },
  { value: "thursday", label: "Quinta-feira" },
  { value: "friday", label: "Sexta-feira" },
  { value: "saturday", label: "Sábado" },
  { value: "sunday", label: "Domingo" },
];

const timeOptions = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
];

function getDayNameFromWeekday(weekday: number): string {
  const dayMap: { [key: number]: string } = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  };
  
  return dayMap[weekday] || 'monday';
}

export function AvailabilityTab() {
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const response = await fetch("/api/admin/availability");
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data.rules) {
          // Converter regras do banco para formato do componente
          const scheduleMap = new Map<string, DaySchedule>();
          
          // Inicializar todos os dias como desabilitados
          daysOfWeek.forEach(day => {
            scheduleMap.set(day.value, {
              day: day.value,
              enabled: false,
              timeSlots: []
            });
          });
          
          // Processar regras do banco
          data.data.rules.forEach((rule: any) => {
            const dayName = getDayNameFromWeekday(rule.weekday);
            const existingDay = scheduleMap.get(dayName);
            
            if (existingDay) {
              existingDay.enabled = true;
              existingDay.timeSlots.push({
                id: rule.id,
                startTime: rule.start,
                endTime: rule.end
              });
            }
          });
          
          setSchedule(Array.from(scheduleMap.values()));
        } else {
          // Se não houver regras, inicializar com todos os dias desabilitados
          const emptySchedule: DaySchedule[] = daysOfWeek.map((day) => ({
            day: day.value,
            enabled: false,
            timeSlots: [],
          }));
          setSchedule(emptySchedule);
        }
      } else {
        throw new Error("Falha ao carregar horários");
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
      toast.error("Erro ao carregar horários");
      
      // Em caso de erro, inicializar com todos os dias desabilitados
      const emptySchedule: DaySchedule[] = daysOfWeek.map((day) => ({
        day: day.value,
        enabled: false,
        timeSlots: [],
      }));
      setSchedule(emptySchedule);
    } finally {
      setLoading(false);
    }
  };

  const saveSchedule = async () => {
    setSaving(true);
    try {
      // Log dos dados que estão sendo enviados
      console.log("📤 Enviando dados para API:", schedule);
      
      const response = await fetch("/api/admin/availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ schedule }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Resposta da API:", result);
        toast.success("Horários salvos com sucesso!");
      } else {
        const errorData = await response.json();
        console.error("❌ Erro na resposta:", errorData);
        toast.error("Erro ao salvar horários");
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error("Erro ao salvar horários");
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (dayValue: string) => {
    setSchedule((prev) =>
      prev.map((day) =>
        day.day === dayValue ? { ...day, enabled: !day.enabled } : day
      )
    );
  };

  const addTimeSlot = (dayValue: string) => {
    setSchedule((prev) =>
      prev.map((day) =>
        day.day === dayValue
          ? {
              ...day,
              timeSlots: [
                ...day.timeSlots,
                {
                  id: `slot_${Date.now()}`,
                  startTime: "09:00",
                  endTime: "10:00",
                },
              ],
            }
          : day
      )
    );
  };

  const removeTimeSlot = (dayValue: string, slotId: string) => {
    setSchedule((prev) =>
      prev.map((day) =>
        day.day === dayValue
          ? {
              ...day,
              timeSlots: day.timeSlots.filter((slot) => slot.id !== slotId),
            }
          : day
      )
    );
  };

  const updateTimeSlot = (
    dayValue: string,
    slotId: string,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setSchedule((prev) =>
      prev.map((day) =>
        day.day === dayValue
          ? {
              ...day,
              timeSlots: day.timeSlots.map((slot) =>
                slot.id === slotId ? { ...slot, [field]: value } : slot
              ),
            }
          : day
      )
    );
  };

  const validateTimeSlots = (slots: TimeSlot[]) => {
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const start = new Date(`2000-01-01T${slot.startTime}`);
      const end = new Date(`2000-01-01T${slot.endTime}`);

      if (start >= end) {
        return false;
      }

      // Check for overlaps with other slots
      for (let j = i + 1; j < slots.length; j++) {
        const otherSlot = slots[j];
        const otherStart = new Date(`2000-01-01T${otherSlot.startTime}`);
        const otherEnd = new Date(`2000-01-01T${otherSlot.endTime}`);

        if (start < otherEnd && end > otherStart) {
          return false;
        }
      }
    }
    return true;
  };

  const getDayLabel = (dayValue: string) => {
    return daysOfWeek.find((day) => day.value === dayValue)?.label || dayValue;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando horários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Gerenciar Disponibilidade
          </h2>
          <p className="text-gray-600">Configure os horários de atendimento</p>
        </div>
        <Button
          onClick={saveSchedule}
          disabled={saving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? "Salvando..." : "Salvar Horários"}
        </Button>
      </div>

      {/* Schedule Configuration */}
      <div className="space-y-4">
        {schedule.map((day) => (
          <Card key={day.day}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={day.enabled}
                    onCheckedChange={() => toggleDay(day.day)}
                  />
                  <CardTitle className="text-lg">
                    {getDayLabel(day.day)}
                  </CardTitle>
                  <Badge variant={day.enabled ? "default" : "secondary"}>
                    {day.enabled ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                {day.enabled && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addTimeSlot(day.day)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Horário
                  </Button>
                )}
              </div>
            </CardHeader>

            {day.enabled && (
              <CardContent>
                {day.timeSlots.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhum horário configurado</p>
                    <p className="text-sm">
                      Clique em &quot;Adicionar Horário&quot; para começar
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {day.timeSlots.map((slot, index) => {
                      const isValid = validateTimeSlots(day.timeSlots);
                      return (
                        <div
                          key={slot.id}
                          className={`flex items-center gap-4 p-4 border rounded-lg ${
                            isValid
                              ? "border-gray-200"
                              : "border-red-200 bg-red-50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium">
                              Horário {index + 1}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Label
                              htmlFor={`start-${slot.id}`}
                              className="text-sm"
                            >
                              Início:
                            </Label>
                            <Select
                              value={slot.startTime}
                              onValueChange={(value) =>
                                updateTimeSlot(
                                  day.day,
                                  slot.id,
                                  "startTime",
                                  value
                                )
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {timeOptions.map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center gap-2">
                            <Label
                              htmlFor={`end-${slot.id}`}
                              className="text-sm"
                            >
                              Fim:
                            </Label>
                            <Select
                              value={slot.endTime}
                              onValueChange={(value) =>
                                updateTimeSlot(
                                  day.day,
                                  slot.id,
                                  "endTime",
                                  value
                                )
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {timeOptions.map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center gap-2 ml-auto">
                            {!isValid && (
                              <div className="flex items-center gap-1 text-red-600">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-xs">
                                  Conflito de horários
                                </span>
                              </div>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeTimeSlot(day.day, slot.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Resumo da Disponibilidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Dias Ativos</h4>
              <div className="space-y-2">
                {schedule
                  .filter((day) => day.enabled)
                  .map((day) => (
                    <div
                      key={day.day}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{getDayLabel(day.day)}</span>
                      <Badge variant="outline" className="text-xs">
                        {day.timeSlots.length} horário(s)
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Estatísticas</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total de dias ativos:</span>
                  <Badge variant="default">
                    {schedule.filter((day) => day.enabled).length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total de horários:</span>
                  <Badge variant="default">
                    {schedule.reduce(
                      (total, day) => total + day.timeSlots.length,
                      0
                    )}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Horas por semana:</span>
                  <Badge variant="default">
                    {schedule
                      .reduce((total, day) => {
                        const dayHours = day.timeSlots.reduce(
                          (dayTotal, slot) => {
                            const start = new Date(
                              `2000-01-01T${slot.startTime}`
                            );
                            const end = new Date(`2000-01-01T${slot.endTime}`);
                            return (
                              dayTotal +
                              (end.getTime() - start.getTime()) /
                                (1000 * 60 * 60)
                            );
                          },
                          0
                        );
                        return total + dayHours;
                      }, 0)
                      .toFixed(1)}
                    h
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Configure rapidamente horários comuns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => {
                // Set standard business hours (Mon-Fri, 8-18)
                setSchedule((prev) =>
                  prev.map((day) => ({
                    ...day,
                    enabled: [
                      "monday",
                      "tuesday",
                      "wednesday",
                      "thursday",
                      "friday",
                    ].includes(day.day),
                    timeSlots: [
                      "monday",
                      "tuesday",
                      "wednesday",
                      "thursday",
                      "friday",
                    ].includes(day.day)
                      ? [
                          {
                            id: `slot_${Date.now()}_1`,
                            startTime: "08:00",
                            endTime: "12:00",
                          },
                          {
                            id: `slot_${Date.now()}_2`,
                            startTime: "14:00",
                            endTime: "18:00",
                          },
                        ]
                      : [],
                  }))
                );
                toast.success("Horário comercial padrão aplicado!");
              }}
            >
              Horário Comercial
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                // Set extended hours (Mon-Sat, 8-20)
                setSchedule((prev) =>
                  prev.map((day) => ({
                    ...day,
                    enabled: [
                      "monday",
                      "tuesday",
                      "wednesday",
                      "thursday",
                      "friday",
                      "saturday",
                    ].includes(day.day),
                    timeSlots: [
                      "monday",
                      "tuesday",
                      "wednesday",
                      "thursday",
                      "friday",
                      "saturday",
                    ].includes(day.day)
                      ? [
                          {
                            id: `slot_${Date.now()}_1`,
                            startTime: "08:00",
                            endTime: "20:00",
                          },
                        ]
                      : [],
                  }))
                );
                toast.success("Horário estendido aplicado!");
              }}
            >
              Horário Estendido
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                // Clear all schedules
                setSchedule((prev) =>
                  prev.map((day) => ({
                    ...day,
                    enabled: false,
                    timeSlots: [],
                  }))
                );
                toast.success("Todos os horários foram limpos!");
              }}
            >
              Limpar Tudo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
