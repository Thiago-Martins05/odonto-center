import { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { AdminNotificationBanner } from "@/components/admin/admin-notification-banner";

export const metadata: Metadata = {
  title: "Painel Administrativo - Odonto Center",
  description: "Gerencie serviços, disponibilidade e agendamentos",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return (
    <div>
      <Navigation />
      <AdminNotificationBanner />
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-text-primary font-dm-serif mb-4">
            Painel Administrativo
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Gerencie serviços, disponibilidade e agendamentos
          </p>
        </div>
        <AdminTabs />
      </div>
    </div>
  );
}
