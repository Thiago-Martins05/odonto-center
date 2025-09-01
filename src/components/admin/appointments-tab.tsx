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
  Plus,
  Save,
  Loader2,
  Grid3X3,
  List,
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
  status: "scheduled" | "confirmed" | "cancelled" | "done";
  notes?: string;
  createdAt: string;
}

interface Service {
  id: string;
  name: string;
  durationMin: number;
  priceCents: number;
}

const statusColors = {
  scheduled: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  done: "bg-gray-100 text-gray-800",
};

const statusLabels = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  done: "Concluído",
};

export function AppointmentsTab() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    date: "",
    search: "",
  });
  const [formData, setFormData] = useState({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    serviceId: "",
    date: "",
    time: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  useEffect(() => {
    fetchAppointments();
    fetchServices();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/appointments");
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      } else {
        toast.error("Erro ao carregar agendamentos");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Erro ao carregar agendamentos");
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/admin/services");
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
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
        const error = await response.json();
        toast.error(error.error || "Erro ao atualizar status");
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
        const error = await response.json();
        toast.error(error.error || "Erro ao excluir agendamento");
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast.error("Erro ao excluir agendamento");
    }
  };

  const handleCreateAppointment = async () => {
    if (
      !formData.patientName ||
      !formData.patientEmail ||
      !formData.serviceId ||
      !formData.date ||
      !formData.time
    ) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      setIsSubmitting(true);
      const selectedService = services.find((s) => s.id === formData.serviceId);
      if (!selectedService) {
        toast.error("Serviço não encontrado");
        return;
      }

      const startsAt = new Date(`${formData.date}T${formData.time}`);
      const endsAt = new Date(
        startsAt.getTime() + selectedService.durationMin * 60 * 1000
      );

      const response = await fetch("/api/admin/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientName: formData.patientName,
          patientEmail: formData.patientEmail,
          patientPhone: formData.patientPhone,
          serviceId: formData.serviceId,
          startsAt: startsAt.toISOString(),
          endsAt: endsAt.toISOString(),
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        toast.success("Agendamento criado com sucesso!");
        setIsCreateDialogOpen(false);
        resetForm();
        fetchAppointments();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao criar agendamento");
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Erro ao criar agendamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      setIsSubmitting(true);
      const selectedService = services.find((s) => s.id === formData.serviceId);
      if (!selectedService) {
        toast.error("Serviço não encontrado");
        return;
      }

      const startsAt = new Date(`${formData.date}T${formData.time}`);
      const endsAt = new Date(
        startsAt.getTime() + selectedService.durationMin * 60 * 1000
      );

      const response = await fetch(
        `/api/admin/appointments/${selectedAppointment.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patientName: formData.patientName,
            patientEmail: formData.patientEmail,
            patientPhone: formData.patientPhone,
            serviceId: formData.serviceId,
            startsAt: startsAt.toISOString(),
            endsAt: endsAt.toISOString(),
            notes: formData.notes,
          }),
        }
      );

      if (response.ok) {
        toast.success("Agendamento atualizado com sucesso!");
        setIsEditDialogOpen(false);
        resetForm();
        fetchAppointments();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao atualizar agendamento");
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error("Erro ao atualizar agendamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDetailDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailDialogOpen(true);
  };

  const openEditDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      patientName: appointment.patientName,
      patientEmail: appointment.patientEmail,
      patientPhone: appointment.patientPhone,
      serviceId: appointment.serviceId,
      date: appointment.date,
      time: appointment.time,
      notes: appointment.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      patientName: "",
      patientEmail: "",
      patientPhone: "",
      serviceId: "",
      date: "",
      time: "",
      notes: "",
    });
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
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando agendamentos...</p>
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
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 px-3"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
              className="h-8 px-3"
            >
              <CalendarDays className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={openCreateDialog}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Agendamento
          </Button>
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
                  <SelectItem value="scheduled">Agendado</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="done">Concluído</SelectItem>
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

      {/* Appointments View */}
      {viewMode === "list" ? (
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
                          onClick={() => openEditDialog(appointment)}
                        >
                          <Edit className="h-4 w-4" />
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
      ) : (
        <CalendarView
          appointments={filteredAppointments}
          onAppointmentClick={openDetailDialog}
        />
      )}

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

      {/* Create Appointment Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
            <DialogDescription>
              Crie um novo agendamento manualmente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientName">Nome do Paciente *</Label>
                <Input
                  id="patientName"
                  value={formData.patientName}
                  onChange={(e) =>
                    setFormData({ ...formData, patientName: e.target.value })
                  }
                  placeholder="Nome completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientEmail">Email *</Label>
                <Input
                  id="patientEmail"
                  type="email"
                  value={formData.patientEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, patientEmail: e.target.value })
                  }
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientPhone">Telefone</Label>
                <Input
                  id="patientPhone"
                  value={formData.patientPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, patientPhone: e.target.value })
                  }
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceId">Serviço *</Label>
                <Select
                  value={formData.serviceId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, serviceId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} ({service.durationMin} min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Horário *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Observações adicionais..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateAppointment}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Criar Agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Appointment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Agendamento</DialogTitle>
            <DialogDescription>
              Edite as informações do agendamento
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editPatientName">Nome do Paciente *</Label>
                <Input
                  id="editPatientName"
                  value={formData.patientName}
                  onChange={(e) =>
                    setFormData({ ...formData, patientName: e.target.value })
                  }
                  placeholder="Nome completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPatientEmail">Email *</Label>
                <Input
                  id="editPatientEmail"
                  type="email"
                  value={formData.patientEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, patientEmail: e.target.value })
                  }
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editPatientPhone">Telefone</Label>
                <Input
                  id="editPatientPhone"
                  value={formData.patientPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, patientPhone: e.target.value })
                  }
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editServiceId">Serviço *</Label>
                <Select
                  value={formData.serviceId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, serviceId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} ({service.durationMin} min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editDate">Data *</Label>
                <Input
                  id="editDate"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editTime">Horário *</Label>
                <Input
                  id="editTime"
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editNotes">Observações</Label>
              <Input
                id="editNotes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Observações adicionais..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEditAppointment}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente de visualização de calendário
function CalendarView({
  appointments,
  onAppointmentClick,
}: {
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
}) {
  // Função para agrupar agendamentos por data
  const groupAppointmentsByDate = () => {
    const grouped: { [key: string]: Appointment[] } = {};

    appointments.forEach((appointment) => {
      const date = appointment.date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(appointment);
    });

    return grouped;
  };

  const groupedAppointments = groupAppointmentsByDate();
  const sortedDates = Object.keys(groupedAppointments).sort();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendário de Agendamentos</CardTitle>
        <CardDescription>
          Visualização em calendário dos agendamentos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sortedDates.length > 0 ? (
            sortedDates.map((date) => (
              <div key={date} className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {new Date(date).toLocaleDateString("pt-BR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
                <div className="grid gap-3">
                  {groupedAppointments[date]
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((appointment) => (
                      <div
                        key={appointment.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => onAppointmentClick(appointment)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-medium text-gray-900">
                                {appointment.time}
                              </div>
                              <Badge
                                className={statusColors[appointment.status]}
                              >
                                {statusLabels[appointment.status]}
                              </Badge>
                            </div>
                            <div className="mt-1">
                              <div className="font-medium text-gray-900">
                                {appointment.patientName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {appointment.serviceName} •{" "}
                                {appointment.duration} min
                              </div>
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            {appointment.patientEmail}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum agendamento encontrado</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
