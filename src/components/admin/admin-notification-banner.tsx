"use client";

import { useState, useEffect } from "react";
import { Bell, X, Calendar, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NewAppointment {
  id: string;
  patientName: string;
  startsAt: Date;
  services: string[];
}

export function AdminNotificationBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [newAppointments, setNewAppointments] = useState<NewAppointment[]>([]);

  useEffect(() => {
    // Simular verificação de novos agendamentos
    // TODO: Implementar verificação real no banco de dados
    const checkNewAppointments = async () => {
      try {
        // Aqui você pode fazer uma chamada para verificar novos agendamentos
        // Por exemplo: const response = await fetch('/api/admin/new-appointments');

        // Simulação para demonstração
        const mockNewAppointments: NewAppointment[] = [
          {
            id: "apt_123",
            patientName: "João Silva",
            startsAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas a partir de agora
            services: ["Limpeza Dental Profunda", "Clareamento"],
          },
        ];

        if (mockNewAppointments.length > 0) {
          setNewAppointments(mockNewAppointments);
          setIsVisible(true);
        }
      } catch (error) {
        console.error("Erro ao verificar novos agendamentos:", error);
      }
    };

    // Verificar imediatamente e depois a cada 30 segundos
    checkNewAppointments();
    const interval = setInterval(checkNewAppointments, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const handleViewAppointments = () => {
    // TODO: Navegar para a aba de agendamentos

    setIsVisible(false);
  };

  if (!isVisible || newAppointments.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 animate-pulse" />
            <div className="flex items-center gap-4">
              <span className="font-semibold">
                🔔 Novos agendamentos recebidos!
              </span>
              <Badge
                variant="secondary"
                className="bg-white/20 text-white border-white/30"
              >
                {newAppointments.length} novo
                {newAppointments.length !== 1 ? "s" : ""}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm opacity-90">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{newAppointments[0].patientName}</span>
                <Clock className="h-4 w-4 ml-2" />
                <span>
                  {newAppointments[0].startsAt.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleViewAppointments}
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Ver agendamentos
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Lista de novos agendamentos */}
        <div className="mt-3 pt-3 border-t border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {newAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white/10 rounded-lg p-3 border border-white/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">
                      {appointment.patientName}
                    </span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-green-500/20 text-green-200 border-green-500/30"
                  >
                    Novo
                  </Badge>
                </div>
                <div className="mt-2 text-sm opacity-90">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {appointment.startsAt.toLocaleDateString("pt-BR")} às{" "}
                      {appointment.startsAt.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">Serviços:</span>
                    <span className="text-xs font-medium">
                      {appointment.services.join(", ")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
