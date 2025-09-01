import { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
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
      <AdminDashboard />
    </ProtectedRoute>
  );
}
