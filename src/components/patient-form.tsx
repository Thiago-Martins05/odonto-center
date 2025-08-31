"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/ui/phone-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  Clock,
  Calendar,
  User,
  Mail,
  Phone,
  FileText,
} from "lucide-react";
import { Service, formatPrice, formatDuration } from "@/types/service";

const patientFormSchema = z.object({
  patientName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  patientEmail: z.string().email("E-mail inválido"),
  patientPhone: z.string().optional(),
  observations: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientFormSchema>;

interface PatientFormProps {
  services: Service[];
  selectedSlot: string;
  onSubmit: (data: PatientFormData) => void;
  onBack: () => void;
}

export function PatientForm({
  services,
  selectedSlot,
  onSubmit,
  onBack,
}: PatientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    mode: "onChange",
  });

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const onFormSubmit = async (data: PatientFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            Seus Dados
          </h2>
          <p className="text-muted-foreground">
            Preencha suas informações para finalizar o agendamento
          </p>
        </div>
        <div className="w-20"></div> {/* Spacer for centering */}
      </div>

      {/* Appointment Summary */}
      <Card className="bg-muted/30 border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Resumo do Agendamento</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {services.length} serviço{services.length !== 1 ? "s" : ""}{" "}
                  selecionado{services.length !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-muted-foreground">Serviços</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {formatDate(selectedSlot)}
                </p>
                <p className="text-xs text-muted-foreground">Data e Hora</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {formatDuration(
                    services.reduce(
                      (total: number, s: Service) => total + s.durationMin,
                      0
                    )
                  )}
                </p>
                <p className="text-xs text-muted-foreground">Duração Total</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="text-sm">
                {formatPrice(
                  services.reduce(
                    (total: number, s: Service) => total + s.priceCents,
                    0
                  )
                )}
              </Badge>
              <p className="text-xs text-muted-foreground">Preço Total</p>
            </div>

            {/* Lista detalhada dos serviços */}
            <div className="border-t pt-3">
              <p className="text-xs text-muted-foreground mb-2">
                Serviços selecionados:
              </p>
              <div className="space-y-2">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between text-sm bg-background p-2 rounded-lg"
                  >
                    <span className="font-medium">{service.name}</span>
                    <div className="flex items-center space-x-3 text-muted-foreground">
                      <span>{formatDuration(service.durationMin)}</span>
                      <span>{formatPrice(service.priceCents)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient Form */}
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="space-y-2">
            <Label
              htmlFor="patientName"
              className="flex items-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span>Nome completo *</span>
            </Label>
            <Input
              id="patientName"
              placeholder="Digite seu nome completo"
              {...register("patientName")}
              className="h-12 rounded-xl"
            />
            {errors.patientName && (
              <p className="text-sm text-destructive">
                {errors.patientName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label
              htmlFor="patientEmail"
              className="flex items-center space-x-2"
            >
              <Mail className="w-4 h-4" />
              <span>E-mail *</span>
            </Label>
            <Input
              id="patientEmail"
              type="email"
              placeholder="seu@email.com"
              {...register("patientEmail")}
              className="h-12 rounded-xl"
            />
            {errors.patientEmail && (
              <p className="text-sm text-destructive">
                {errors.patientEmail.message}
              </p>
            )}
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="patientPhone" className="flex items-center space-x-2">
            <Phone className="w-4 h-4" />
            <span>Telefone (opcional)</span>
          </Label>
          <PhoneInput
            id="patientPhone"
            onChange={(value) => setValue("patientPhone", value)}
            className="h-12 rounded-xl"
          />
        </div>

        {/* Observations */}
        <div className="space-y-2">
          <Label htmlFor="observations" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Observações (opcional)</span>
          </Label>
          <Textarea
            id="observations"
            placeholder="Alguma informação adicional ou observação importante..."
            {...register("observations")}
            className="min-h-[100px] rounded-xl resize-none"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-6">
          <Button
            type="submit"
            size="lg"
            disabled={!isValid || isSubmitting}
            className="px-8 py-3 text-lg font-semibold rounded-2xl"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Agendando...
              </>
            ) : (
              "Confirmar Agendamento"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
