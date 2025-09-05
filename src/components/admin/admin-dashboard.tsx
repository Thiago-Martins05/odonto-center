"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar,
  Settings,
  Users,
  FileText,
  BarChart3,
  Clock,
  Plus,
  Edit,
  Trash2,
  Eye,
  LogOut,
  Loader2,
  MessageSquare,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServicesTab } from "./services-tab";
import { AppointmentsTab } from "./appointments-tab";
import { AvailabilityTab } from "./availability-tab";
import { ReportsTab } from "./reports-tab";
import { ContactMessagesTab } from "./contact-messages-tab";
import { useAuth } from "@/lib/auth-hook";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DashboardStats {
  totalAppointments: number;
  activeServices: number;
  todayAppointments: number;
  monthlyRevenue: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/dashboard/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error("Failed to fetch dashboard stats");
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logout realizado com sucesso!");
    router.push("/login");
  };

  const handleQuickAction = (tab: string) => {
    setActiveTab(tab);
    const tabNames = {
      services: "Serviços",
      appointments: "Agendamentos",
      availability: "Disponibilidade",
    };
    toast.success(`Navegando para ${tabNames[tab as keyof typeof tabNames]}`);
  };

  const tabs = [
    { id: "overview", label: "Visão Geral", icon: BarChart3, mobileLabel: "Visão" },
    { id: "services", label: "Serviços", icon: Settings, mobileLabel: "Serviços" },
    { id: "appointments", label: "Agendamentos", icon: Calendar, mobileLabel: "Agenda" },
    { id: "availability", label: "Disponibilidade", icon: Clock, mobileLabel: "Horários" },
    { id: "reports", label: "Relatórios", icon: FileText, mobileLabel: "Relatórios" },
    { id: "messages", label: "Mensagens", icon: MessageSquare, mobileLabel: "Mensagens" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Painel Administrativo
              </h1>
              <p className="text-gray-600 mt-1">
                Bem-vindo, {user?.name || "Administrador"}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Último acesso: {new Date().toLocaleDateString("pt-BR")}
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id} 
                    className="flex items-center gap-2 text-sm"
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {tabs.find(tab => tab.id === activeTab)?.label}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex items-center gap-2"
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                Menu
              </Button>
            </div>
            
            {mobileMenuOpen && (
              <div className="space-y-2 border rounded-lg p-2 bg-white shadow-sm">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                        activeTab === tab.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <OverviewContent
              onQuickAction={handleQuickAction}
              stats={stats}
              loading={loading}
            />
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <ServicesTab />
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <AppointmentsTab />
          </TabsContent>

          {/* Availability Tab */}
          <TabsContent value="availability" className="space-y-6">
            <AvailabilityTab />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <ReportsTab />
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <ContactMessagesTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function OverviewContent({
  onQuickAction,
  stats,
  loading,
}: {
  onQuickAction: (tab: string) => void;
  stats: DashboardStats | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Agendamentos
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalAppointments || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Todos os agendamentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Serviços Ativos
            </CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.activeServices || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Disponíveis para agendamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Agendamentos Hoje
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.todayAppointments || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {(stats?.todayAppointments || 0) > 0
                ? "Agendamentos para hoje"
                : "Nenhum agendamento hoje"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Mensal
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(stats?.monthlyRevenue || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesse rapidamente as funcionalidades mais usadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              className="flex items-center gap-2"
              onClick={() => onQuickAction("services")}
            >
              <Plus className="h-4 w-4" />
              Adicionar Serviço
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => onQuickAction("appointments")}
            >
              <Eye className="h-4 w-4" />
              Ver Agendamentos
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => onQuickAction("availability")}
            >
              <Clock className="h-4 w-4" />
              Configurar Horários
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>Últimas ações realizadas no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.type === "appointment"
                        ? "bg-green-500"
                        : activity.type === "service"
                        ? "bg-blue-500"
                        : "bg-yellow-500"
                    }`}
                  ></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhuma atividade recente</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


