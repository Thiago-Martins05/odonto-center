"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  BarChart3,
  Users,
  Calendar,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { ReportsCharts } from "./reports-charts";

interface ReportData {
  appointments: {
    total: number;
    scheduled: number;
    completed: number;
    cancelled: number;
    byService: Array<{
      serviceName: string;
      count: number;
      revenue: number;
    }>;
    byMonth: Array<{
      month: string;
      count: number;
      revenue: number;
    }>;
  };
  financial: {
    totalRevenue: number;
    monthlyRevenue: number;
    averageTicket: number;
    topServices: Array<{
      serviceName: string;
      revenue: number;
      count: number;
    }>;
  };
  services: {
    total: number;
    active: number;
    inactive: number;
    mostPopular: Array<{
      serviceName: string;
      bookings: number;
      revenue: number;
    }>;
  };
  availability: {
    totalSlots: number;
    bookedSlots: number;
    availableSlots: number;
    utilizationRate: number;
    byWeekday: Array<{
      weekday: string;
      slots: number;
      utilization: number;
    }>;
  };
}

interface DateRange {
  start: string;
  end: string;
}

export function ReportsTab() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(new Date().getFullYear() - 1, 0, 1)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });
  const [reportType, setReportType] = useState<string>("all");

  useEffect(() => {
    fetchReportData();
  }, [dateRange, reportType]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        startDate: dateRange.start,
        endDate: dateRange.end,
        type: reportType,
      });

      const response = await fetch(`/api/admin/reports/public?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      } else {
        toast.error("Erro ao carregar relatórios");
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Erro ao carregar relatórios");
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.start,
        endDate: dateRange.end,
        type: reportType,
        format: "pdf",
      });

      const response = await fetch(`/api/admin/reports/export-public?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `relatorio-${reportType}-${dateRange.start}-${dateRange.end}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Relatório PDF exportado com sucesso!");
      } else {
        toast.error("Erro ao exportar relatório");
      }
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Erro ao exportar relatório");
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros do Relatório
          </CardTitle>
          <CardDescription>
            Configure o período e tipo de relatório desejado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Data Final</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reportType">Tipo de Relatório</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Relatórios</SelectItem>
                  <SelectItem value="appointments">Agendamentos</SelectItem>
                  <SelectItem value="financial">Financeiro</SelectItem>
                  <SelectItem value="services">Serviços</SelectItem>
                  <SelectItem value="availability">Disponibilidade</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Exportar</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportReport}
                className="flex items-center gap-2 w-full"
              >
                <Download className="h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Geral */}
      {(reportType === "all" || reportType === "appointments") && (
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
                {reportData?.appointments.total || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Período selecionado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Agendamentos Concluídos
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {reportData?.appointments.completed || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {reportData?.appointments.total
                  ? Math.round(
                      ((reportData.appointments.completed || 0) /
                        reportData.appointments.total) *
                        100
                    )
                  : 0}
                % do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Agendamentos Cancelados
              </CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {reportData?.appointments.cancelled || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {reportData?.appointments.total
                  ? Math.round(
                      ((reportData.appointments.cancelled || 0) /
                        reportData.appointments.total) *
                        100
                    )
                  : 0}
                % do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taxa de Ocupação
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {reportData?.availability.utilizationRate || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Horários utilizados
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Relatório Financeiro */}
      {(reportType === "all" || reportType === "financial") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Relatório Financeiro
            </CardTitle>
            <CardDescription>
              Receita e análise financeira do período
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(reportData?.financial.totalRevenue || 0)}
                </div>
                <p className="text-sm text-gray-600">Receita Total</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {formatCurrency(reportData?.financial.monthlyRevenue || 0)}
                </div>
                <p className="text-sm text-gray-600">Receita Mensal</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {formatCurrency(reportData?.financial.averageTicket || 0)}
                </div>
                <p className="text-sm text-gray-600">Ticket Médio</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Serviços Mais Rentáveis</h4>
              <div className="space-y-3">
                {reportData?.financial.topServices.map((service, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{service.serviceName}</p>
                      <p className="text-sm text-gray-600">
                        {service.count} agendamentos
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {formatCurrency(service.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Relatório de Serviços */}
      {(reportType === "all" || reportType === "services") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Relatório de Serviços
            </CardTitle>
            <CardDescription>
              Análise de performance dos serviços oferecidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {reportData?.services.total || 0}
                </div>
                <p className="text-sm text-gray-600">Total de Serviços</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {reportData?.services.active || 0}
                </div>
                <p className="text-sm text-gray-600">Serviços Ativos</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {reportData?.services.inactive || 0}
                </div>
                <p className="text-sm text-gray-600">Serviços Inativos</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Serviços Mais Populares</h4>
              <div className="space-y-3">
                {reportData?.services.mostPopular.map((service, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{service.serviceName}</p>
                      <p className="text-sm text-gray-600">
                        {service.bookings} agendamentos
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {formatCurrency(service.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Relatório de Agendamentos por Serviço */}
      {(reportType === "all" || reportType === "appointments") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Agendamentos por Serviço
            </CardTitle>
            <CardDescription>
              Distribuição de agendamentos por tipo de serviço
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData?.appointments.byService.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold">{service.serviceName}</h4>
                    <p className="text-sm text-gray-600">
                      {service.count} agendamentos
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {formatCurrency(service.revenue)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {reportData?.appointments.total
                        ? Math.round(
                            (service.count / reportData.appointments.total) * 100
                          )
                        : 0}
                      % do total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Relatório de Disponibilidade */}
      {(reportType === "all" || reportType === "availability") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Relatório de Disponibilidade
            </CardTitle>
            <CardDescription>
              Análise de utilização dos horários disponíveis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {reportData?.availability.totalSlots || 0}
                </div>
                <p className="text-sm text-gray-600">Total de Horários</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {reportData?.availability.bookedSlots || 0}
                </div>
                <p className="text-sm text-gray-600">Horários Ocupados</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600">
                  {reportData?.availability.availableSlots || 0}
                </div>
                <p className="text-sm text-gray-600">Horários Livres</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Utilização por Dia da Semana</h4>
              <div className="space-y-3">
                {reportData?.availability.byWeekday.map((day, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{day.weekday}</p>
                      <p className="text-sm text-gray-600">
                        {day.slots} horários disponíveis
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">
                        {day.utilization}%
                      </p>
                      <p className="text-sm text-gray-600">utilização</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráficos e Visualizações */}
      {(reportType === "all" || reportType === "appointments" || reportType === "financial") && (
        <ReportsCharts
          appointmentsByService={reportData?.appointments.byService || []}
          appointmentsByMonth={reportData?.appointments.byMonth || []}
          availabilityByWeekday={reportData?.availability.byWeekday || []}
          financialSummary={{
            totalRevenue: reportData?.financial.totalRevenue || 0,
            monthlyRevenue: reportData?.financial.monthlyRevenue || 0,
            averageTicket: reportData?.financial.averageTicket || 0,
          }}
        />
      )}

      {/* Período do Relatório */}
      <Card>
        <CardHeader>
          <CardTitle>Período do Relatório</CardTitle>
          <CardDescription>
            Dados referentes ao período selecionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>De: {formatDate(dateRange.start)}</span>
            <span>Até: {formatDate(dateRange.end)}</span>
            <span>
              Total de dias:{" "}
              {Math.ceil(
                (new Date(dateRange.end).getTime() -
                  new Date(dateRange.start).getTime()) /
                  (1000 * 60 * 60 * 24)
              ) + 1}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
