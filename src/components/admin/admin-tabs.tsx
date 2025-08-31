"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff } from "lucide-react";
import { ServicesTab } from "./services-tab";
import { AvailabilityTab } from "./availability-tab";
import { AppointmentsTab } from "./appointments-tab";

export function AdminTabs() {
  const [activeTab, setActiveTab] = useState("services");
  const [hasNewAppointments, setHasNewAppointments] = useState(false);

  // Simular verificação de novos agendamentos
  useEffect(() => {
    // TODO: Implementar verificação real de novos agendamentos
    // Por enquanto, simular com um timer
    const checkNewAppointments = () => {
      // Aqui você pode implementar uma verificação real no banco
      // ou usar WebSockets para notificações em tempo real
      console.log("🔍 Checking for new appointments...");
    };

    const interval = setInterval(checkNewAppointments, 30000); // Verificar a cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="services" className="text-lg font-semibold">
              Serviços
            </TabsTrigger>
            <TabsTrigger value="availability" className="text-lg font-semibold">
              Disponibilidade
            </TabsTrigger>
            <TabsTrigger value="appointments" className="text-lg font-semibold relative">
              Agendamentos
              {hasNewAppointments && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  !
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4">
            {/* Indicador de notificações */}
            <div className="flex items-center gap-2">
              {hasNewAppointments ? (
                <div className="flex items-center gap-2 text-orange-600">
                  <Bell className="h-5 w-5 animate-pulse" />
                  <span className="text-sm font-medium">Novos agendamentos</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-500">
                  <BellOff className="h-5 w-5" />
                  <span className="text-sm">Sem notificações</span>
                </div>
              )}
            </div>

            <Button variant="outline" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </div>

        <TabsContent value="services" className="space-y-6">
          <ServicesTab />
        </TabsContent>

        <TabsContent value="availability" className="space-y-6">
          <AvailabilityTab />
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <AppointmentsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
