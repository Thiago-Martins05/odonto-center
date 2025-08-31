"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServicesTab } from "./services-tab";
import { AvailabilityTab } from "./availability-tab";
import { AppointmentsTab } from "./appointments-tab";

export function AdminTabs() {
  const [activeTab, setActiveTab] = useState("services");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-8">
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
  );
}
