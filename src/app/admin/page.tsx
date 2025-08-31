import { Navigation } from "@/components/navigation";
import { AdminTabs } from "@/components/admin/admin-tabs";

export default function AdminPage() {
  return (
    <div>
      <Navigation />
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
