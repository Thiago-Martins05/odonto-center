"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Trash2, Save, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const availabilityRuleSchema = z.object({
  weekday: z.string().min(1, "Selecione um dia da semana"),
  start: z.string().min(1, "Horário de início é obrigatório"),
  end: z.string().min(1, "Horário de fim é obrigatório"),
  serviceId: z.string().optional(),
});

const blackoutDateSchema = z.object({
  date: z.string().min(1, "Data é obrigatória"),
  reason: z.string().min(5, "Motivo deve ter pelo menos 5 caracteres"),
});

type AvailabilityRuleFormData = z.infer<typeof availabilityRuleSchema>;
type BlackoutDateFormData = z.infer<typeof blackoutDateSchema>;

import { AvailabilityRule } from "@/server/admin/availability";

import { BlackoutDate } from "@/server/admin/availability";

import { Service } from "@/types/service";

const weekdays = [
  { value: "0", label: "Domingo" },
  { value: "1", label: "Segunda-feira" },
  { value: "2", label: "Terça-feira" },
  { value: "3", label: "Quarta-feira" },
  { value: "4", label: "Quinta-feira" },
  { value: "5", label: "Sexta-feira" },
  { value: "6", label: "Sábado" },
];

export function AvailabilityTab() {
  const [availabilityRules, setAvailabilityRules] = useState<
    AvailabilityRule[]
  >([]);
  const [blackoutDates, setBlackoutDates] = useState<BlackoutDate[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isRuleFormOpen, setIsRuleFormOpen] = useState(false);
  const [isBlackoutFormOpen, setIsBlackoutFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const ruleForm = useForm<AvailabilityRuleFormData>({
    resolver: zodResolver(availabilityRuleSchema),
    mode: "onChange",
  });

  const blackoutForm = useForm<BlackoutDateFormData>({
    resolver: zodResolver(blackoutDateSchema),
    mode: "onChange",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // TODO: Replace with actual API calls
      const mockRules: AvailabilityRule[] = [
        {
          id: "1",
          weekday: 1,
          start: "09:00",
          end: "17:00",
        },
        {
          id: "2",
          weekday: 2,
          start: "09:00",
          end: "17:00",
        },
        {
          id: "3",
          weekday: 3,
          start: "09:00",
          end: "17:00",
        },
        {
          id: "4",
          weekday: 4,
          start: "09:00",
          end: "17:00",
        },
        {
          id: "5",
          weekday: 5,
          start: "09:00",
          end: "17:00",
        },
      ];

      const mockBlackouts: BlackoutDate[] = [
        {
          id: "1",
          date: new Date("2024-12-25"),
          reason: "Natal",
        },
        {
          id: "2",
          date: new Date("2024-12-31"),
          reason: "Ano Novo",
        },
      ];

      const mockServices: Service[] = [
        {
          id: "1",
          name: "Limpeza Dental Profunda",
          slug: "limpeza-dental-profunda",
          description:
            "A limpeza profissional, também conhecida como profilaxia, é fundamental para a saúde bucal.",
          durationMin: 40,
          priceCents: 8000,
          active: true,
        },
        {
          id: "2",
          name: "Clareamento Dental",
          slug: "clareamento-dental",
          description:
            "O clareamento dental é um procedimento seguro e eficaz que remove pigmentações.",
          durationMin: 60,
          priceCents: 30000,
          active: true,
        },
        {
          id: "3",
          name: "Tratamento de Canal (Endodontia)",
          slug: "tratamento-canal-endodontia",
          description:
            "O tratamento de canal é necessário quando a polpa dentária está inflamada ou infectada.",
          durationMin: 90,
          priceCents: 35000,
          active: true,
        },
      ];

      setAvailabilityRules(mockRules);
      setBlackoutDates(mockBlackouts);
      setServices(mockServices);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const onSubmitRule = async (data: AvailabilityRuleFormData) => {
    try {
      const newRule: AvailabilityRule = {
        id: `rule_${Date.now()}`,
        weekday: parseInt(data.weekday),
        start: data.start,
        end: data.end,
        serviceId: data.serviceId,
      };

      setAvailabilityRules((prev) => [...prev, newRule]);
      ruleForm.reset();
      setIsRuleFormOpen(false);
    } catch (error) {
      console.error("Error creating rule:", error);
    }
  };

  const onSubmitBlackout = async (data: BlackoutDateFormData) => {
    try {
      const newBlackout: BlackoutDate = {
        id: `blackout_${Date.now()}`,
        date: new Date(data.date),
        reason: data.reason,
      };

      setBlackoutDates((prev) => [...prev, newBlackout]);
      blackoutForm.reset();
      setIsBlackoutFormOpen(false);
    } catch (error) {
      console.error("Error creating blackout date:", error);
    }
  };

  const deleteRule = async (ruleId: string) => {
    if (confirm("Tem certeza que deseja excluir esta regra?")) {
      setAvailabilityRules((prev) => prev.filter((r) => r.id !== ruleId));
    }
  };

  const deleteBlackout = async (blackoutId: string) => {
    if (confirm("Tem certeza que deseja excluir esta data bloqueada?")) {
      setBlackoutDates((prev) => prev.filter((b) => b.id !== blackoutId));
    }
  };

  const getWeekdayName = (weekday: number) => {
    return (
      weekdays.find((w) => w.value === weekday.toString())?.label ||
      "Desconhecido"
    );
  };

  const formatTime = (time: string) => {
    return time;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Availability Rules Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Regras de Disponibilidade</h2>
          <Button
            onClick={() => setIsRuleFormOpen(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Regra</span>
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dia da Semana</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Fim</TableHead>
                  <TableHead>Serviço Específico</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availabilityRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">
                      {getWeekdayName(rule.weekday)}
                    </TableCell>
                    <TableCell>{formatTime(rule.start)}</TableCell>
                    <TableCell>{formatTime(rule.end)}</TableCell>
                    <TableCell>
                      {rule.serviceId ? (
                        services.find((s) => s.id === rule.serviceId)?.name ||
                        "N/A"
                      ) : (
                        <Badge variant="secondary">Todos os serviços</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRule(rule.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Blackout Dates Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Datas Bloqueadas</h2>
          <Button
            onClick={() => setIsBlackoutFormOpen(true)}
            className="flex items-center space-x-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Adicionar Data Bloqueada</span>
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blackoutDates.map((blackout) => (
                  <TableRow key={blackout.id}>
                    <TableCell className="font-medium">
                      {new Date(blackout.date).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>{blackout.reason}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteBlackout(blackout.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* New Rule Dialog */}
      <Dialog open={isRuleFormOpen} onOpenChange={setIsRuleFormOpen}>
        <DialogContent className="max-w-md">
          <CardHeader>
            <CardTitle>Nova Regra de Disponibilidade</CardTitle>
          </CardHeader>

          <form
            onSubmit={ruleForm.handleSubmit(onSubmitRule)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="weekday">Dia da Semana *</Label>
              <Select
                onValueChange={(value) => ruleForm.setValue("weekday", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o dia" />
                </SelectTrigger>
                <SelectContent>
                  {weekdays.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {ruleForm.formState.errors.weekday && (
                <p className="text-sm text-destructive">
                  {ruleForm.formState.errors.weekday.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">Início *</Label>
                <Input id="start" type="time" {...ruleForm.register("start")} />
                {ruleForm.formState.errors.start && (
                  <p className="text-sm text-destructive">
                    {ruleForm.formState.errors.start.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="end">Fim *</Label>
                <Input id="end" type="time" {...ruleForm.register("end")} />
                {ruleForm.formState.errors.end && (
                  <p className="text-sm text-destructive">
                    {ruleForm.formState.errors.end.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceId">Serviço Específico (opcional)</Label>
              <Select
                onValueChange={(value) => ruleForm.setValue("serviceId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os serviços" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os serviços</SelectItem>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRuleFormOpen(false)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button type="submit" disabled={!ruleForm.formState.isValid}>
                <Save className="w-4 h-4 mr-2" />
                Criar Regra
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Blackout Date Dialog */}
      <Dialog open={isBlackoutFormOpen} onOpenChange={setIsBlackoutFormOpen}>
        <DialogContent className="max-w-md">
          <CardHeader>
            <CardTitle>Nova Data Bloqueada</CardTitle>
          </CardHeader>

          <form
            onSubmit={blackoutForm.handleSubmit(onSubmitBlackout)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input id="date" type="date" {...blackoutForm.register("date")} />
              {blackoutForm.formState.errors.date && (
                <p className="text-sm text-destructive">
                  {blackoutForm.formState.errors.date.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Motivo *</Label>
              <Input
                id="reason"
                placeholder="Ex: Feriado, Manutenção, etc."
                {...blackoutForm.register("reason")}
              />
              {blackoutForm.formState.errors.reason && (
                <p className="text-sm text-destructive">
                  {blackoutForm.formState.errors.reason.message}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsBlackoutFormOpen(false)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button type="submit" disabled={!blackoutForm.formState.isValid}>
                <Save className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
