"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Calendar,
  Clock,
  User,
  DollarSign,
  Download,
  Home,
} from "lucide-react";
import { AppointmentData } from "./scheduling-flow";
import { formatPrice, formatDuration } from "@/types/service";

interface SuccessScreenProps {
  appointmentData: AppointmentData;
  onBackToStart: () => void;
}

export function SuccessScreen({
  appointmentData,
  onBackToStart,
}: SuccessScreenProps) {
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleAddToCalendar = () => {
    // TODO: Generate and download .ics file

  };

  return (
    <div className="text-center space-y-8">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
      </div>

      {/* Success Message */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-foreground font-dm-serif">
          Agendamento confirmado!
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Sua consulta foi agendada com sucesso! Enviamos a confirmação por
          e-mail. Verifique sua caixa de entrada.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
          <p className="text-sm text-blue-800">
            ✅ <strong>Notificação enviada:</strong> O administrador da clínica
            foi notificado sobre seu agendamento e entrará em contato se
            necessário.
          </p>
        </div>
      </div>

      {/* Appointment Summary */}
      <Card className="max-w-2xl mx-auto rounded-2xl border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center justify-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Resumo do Agendamento</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-xl">
              <User className="w-5 h-5 text-muted-foreground" />
              <div className="text-left">
                <p className="text-sm font-medium">
                  {appointmentData.services.length === 1
                    ? appointmentData.services[0].name
                    : `${appointmentData.services.length} serviços selecionados`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {appointmentData.services.length === 1
                    ? "Serviço"
                    : "Serviços"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-xl">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div className="text-left">
                <p className="text-sm font-medium">
                  {formatDate(appointmentData.selectedSlot)}
                </p>
                <p className="text-xs text-muted-foreground">Data e Hora</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-xl">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div className="text-left">
                <p className="text-sm font-medium">
                  {formatDuration(
                    appointmentData.services.reduce(
                      (total, service) => total + service.durationMin,
                      0
                    )
                  )}
                </p>
                <p className="text-xs text-muted-foreground">Duração Total</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-xl">
              <DollarSign className="w-5 h-5 text-muted-foreground" />
              <div className="text-left">
                <Badge variant="outline" className="text-sm">
                  {formatPrice(
                    appointmentData.services.reduce(
                      (total, service) => total + service.priceCents,
                      0
                    )
                  )}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  Preço Total
                </p>
              </div>
            </div>
          </div>

          {/* Services List */}
          {appointmentData.services.length > 1 && (
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-2">
                Serviços agendados:
              </p>
              <div className="space-y-2">
                {appointmentData.services.map((service, index) => (
                  <div
                    key={service.id}
                    className="flex justify-between items-center p-2 bg-muted/20 rounded-lg"
                  >
                    <span className="text-sm font-medium">{service.name}</span>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>{formatDuration(service.durationMin)}</span>
                      <span>•</span>
                      <span>{formatPrice(service.priceCents)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Patient Info */}
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-2">Paciente:</p>
            <p className="font-medium">{appointmentData.patientName}</p>
            <p className="text-sm text-muted-foreground">
              {appointmentData.patientEmail}
            </p>
            {appointmentData.patientPhone && (
              <p className="text-sm text-muted-foreground">
                {appointmentData.patientPhone}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button
          onClick={handleAddToCalendar}
          size="lg"
          variant="outline"
          className="px-8 py-3 text-lg font-semibold rounded-2xl flex items-center space-x-2"
        >
          <Download className="w-5 h-5" />
          <span>Adicionar ao calendário</span>
        </Button>

        <Button
          onClick={onBackToStart}
          size="lg"
          className="px-8 py-3 text-lg font-semibold rounded-2xl flex items-center space-x-2"
        >
          <Home className="w-5 h-5" />
          <span>Voltar ao início</span>
        </Button>
      </div>

      {/* Additional Info */}
      <div className="text-center text-sm text-muted-foreground max-w-2xl mx-auto">
        <p>
          Lembre-se de chegar 10 minutos antes do horário agendado. Em caso de
          dúvidas, entre em contato conosco.
        </p>
      </div>
    </div>
  );
}
