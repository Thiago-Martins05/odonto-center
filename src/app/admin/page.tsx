import { Metadata } from "next";
import { SimpleAdminHeader } from "@/components/admin/simple-admin-header";
import { ProtectedRoute } from "@/components/auth/protected-route";

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
    <ProtectedRoute requireAdmin={true}>
      <AdminContent />
    </ProtectedRoute>
  );
}

function AdminContent() {
  return (
    <>
      <SimpleAdminHeader userName="Administrador" />
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-text-primary font-dm-serif mb-4">
            Painel Administrativo
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Bem-vindo! Gerencie serviços, disponibilidade e agendamentos
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Funcionalidades</h2>
          <ul className="space-y-2 text-gray-600">
            <li>✅ Gerenciamento de Serviços</li>
            <li>✅ Controle de Disponibilidade</li>
            <li>✅ Visualização de Agendamentos</li>
            <li>✅ Sistema de Usuários Administradores</li>
          </ul>
        </div>
      </div>
    </>
  );
}
