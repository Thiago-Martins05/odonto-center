"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ServicesTab } from "./services-tab";
import { AvailabilityTab } from "./availability-tab";
import { AppointmentsTab } from "./appointments-tab";

export function AdminTabs() {
  const [activeTab, setActiveTab] = useState("services");

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="services" className="text-lg font-semibold">
              Serviços
            </TabsTrigger>
            <TabsTrigger value="availability" className="text-lg font-semibold">
              Disponibilidade
            </TabsTrigger>
            <TabsTrigger value="appointments" className="text-lg font-semibold">
              Agendamentos
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Button variant="outline" onClick={handleLogout} className="ml-4">
          Sair
        </Button>
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
    </div>
  );
}
