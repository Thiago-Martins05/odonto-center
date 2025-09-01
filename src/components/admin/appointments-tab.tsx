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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";

interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  serviceName: string;
  serviceId: string;
  date: string;
  time: string;
  duration: number;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  notes?: string;
  createdAt: string;
}

const statusColors = {
  confirmed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
};

const statusLabels = {
  confirmed: "Confirmado",
  pending: "Pendente",
  cancelled: "Cancelado",
  completed: "Concluído",
};

export function AppointmentsTab() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    date: "",
    search: "",
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockAppointments: Appointment[] = [
        {
          id: "1",
          patientName: "Maria Silva",
          patientEmail: "maria@email.com",
          patientPhone: "(11) 99999-9999",
          serviceName: "Consulta de Rotina",
          serviceId: "1",
          date: "2024-01-15",
          time: "14:00",
          duration: 60,
          status: "confirmed",
          notes: "Paciente solicita informações sobre clareamento",
          createdAt: "2024-01-10T10:00:00Z",
        },
        {
          id: "2",
          patientName: "João Santos",
          patientEmail: "joao@email.com",
          patientPhone: "(11) 88888-8888",
          serviceName: "Limpeza Profissional",
          serviceId: "2",
          date: "2024-01-15",
          time: "16:00",
          duration: 45,
          status: "pending",
          createdAt: "2024-01-11T14:30:00Z",
        },
        {
          id: "3",
          patientName: "Ana Costa",
          patientEmail: "ana@email.com",
          patientPhone: "(11) 77777-7777",
          serviceName: "Clareamento",
          serviceId: "3",
          date: "2024-01-16",
          time: "10:00",
          duration: 90,
          status: "cancelled",
          notes: "Cancelado pelo paciente - reagendamento solicitado",
          createdAt: "2024-01-12T09:15:00Z",
        },
        {
          id: "4",
          patientName: "Pedro Oliveira",
          patientEmail: "pedro@email.com",
          patientPhone: "(11) 66666-6666",
          serviceName: "Consulta de Rotina",
          serviceId: "1",
          date: "2024-01-14",
          time: "15:30",
          duration: 60,
          status: "completed",
          createdAt: "2024-01-09T16:45:00Z",
        },
      ];

      setAppointments(mockAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Erro ao carregar agendamentos");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    appointmentId: string,
    newStatus: Appointment["status"]
  ) => {
    try {
      const response = await fetch(
        `/api/admin/appointments/${appointmentId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        toast.success("Status do agendamento atualizado!");
        fetchAppointments();
      } else {
        toast.error("Erro ao atualizar status");
      }
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  const handleDelete = async (appointmentId: string) => {
    if (!confirm("Tem certeza que deseja excluir este agendamento?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/appointments/${appointmentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Agendamento excluído com sucesso!");
        fetchAppointments();
      } else {
        toast.error("Erro ao excluir agendamento");
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast.error("Erro ao excluir agendamento");
    }
  };

  const openDetailDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailDialogOpen(true);
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesStatus =
      filters.status === "all" || appointment.status === filters.status;
    const matchesDate = !filters.date || appointment.date === filters.date;
    const matchesSearch =
      !filters.search ||
      appointment.patientName
        .toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      appointment.patientEmail
        .toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      appointment.serviceName
        .toLowerCase()
        .includes(filters.search.toLowerCase());

    return matchesStatus && matchesDate && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando agendamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Gerenciar Agendamentos
          </h2>
          <p className="text-gray-600">
            Visualize e gerencie todos os agendamentos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {filteredAppointments.length} agendamento(s)
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Nome, email ou serviço..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={filters.date}
                onChange={(e) =>
                  setFilters({ ...filters, date: e.target.value })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Agendamentos</CardTitle>
          <CardDescription>
            Lista de todos os agendamentos com filtros aplicados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {appointment.patientName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.patientEmail}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {appointment.serviceName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.duration} min
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(appointment.date)}</TableCell>
                  <TableCell>{formatTime(appointment.time)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[appointment.status]}>
                      {statusLabels[appointment.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDetailDialog(appointment)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleStatusChange(appointment.id, "confirmed")
                        }
                        disabled={appointment.status === "confirmed"}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleStatusChange(appointment.id, "cancelled")
                        }
                        disabled={appointment.status === "cancelled"}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(appointment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredAppointments.length === 0 && (
            <div className="text-center py-8">
              <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum agendamento encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appointment Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Agendamento</DialogTitle>
            <DialogDescription>
              Informações completas sobre o agendamento selecionado
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-6">
              {/* Patient Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações do Paciente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Nome
                    </Label>
                    <p className="text-sm">{selectedAppointment.patientName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Email
                    </Label>
                    <p className="text-sm">
                      {selectedAppointment.patientEmail}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Telefone
                    </Label>
                    <p className="text-sm">
                      {selectedAppointment.patientPhone}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Status
                    </Label>
                    <Badge className={statusColors[selectedAppointment.status]}>
                      {statusLabels[selectedAppointment.status]}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Appointment Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Informações do Agendamento
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Serviço
                    </Label>
                    <p className="text-sm">{selectedAppointment.serviceName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Duração
                    </Label>
                    <p className="text-sm">
                      {selectedAppointment.duration} minutos
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Data
                    </Label>
                    <p className="text-sm">
                      {formatDate(selectedAppointment.date)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Horário
                    </Label>
                    <p className="text-sm">
                      {formatTime(selectedAppointment.time)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedAppointment.notes && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">
                    Observações
                  </Label>
                  <p className="text-sm bg-gray-50 p-3 rounded-md">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-500">
                  Criado em:{" "}
                  {new Date(selectedAppointment.createdAt).toLocaleDateString(
                    "pt-BR"
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleStatusChange(selectedAppointment.id, "confirmed")
                    }
                    disabled={selectedAppointment.status === "confirmed"}
                  >
                    Confirmar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleStatusChange(selectedAppointment.id, "cancelled")
                    }
                    disabled={selectedAppointment.status === "cancelled"}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailDialogOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
