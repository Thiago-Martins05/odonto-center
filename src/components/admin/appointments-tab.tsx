"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { Appointment } from "@/server/admin/appointments";

import { Service } from "@/types/service";

const appointmentStatuses = [
  { value: "confirmed", label: "Confirmado", variant: "default" as const },
  { value: "done", label: "Concluído", variant: "secondary" as const },
  { value: "cancelled", label: "Cancelado", variant: "destructive" as const },
];

export function AppointmentsTab() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateRangeStart, setDateRangeStart] = useState("");
  const [dateRangeEnd, setDateRangeEnd] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...appointments];

    // Date range filter
    if (dateRangeStart) {
      filtered = filtered.filter(
        (apt) => new Date(apt.startsAt) >= new Date(dateRangeStart)
      );
    }
    if (dateRangeEnd) {
      filtered = filtered.filter(
        (apt) => new Date(apt.startsAt) <= new Date(dateRangeEnd + "T23:59:59")
      );
    }

    // Service filter
    if (serviceFilter) {
      filtered = filtered.filter((apt) => apt.serviceName === serviceFilter);
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((apt) => apt.status === statusFilter);
    }

    setFilteredAppointments(filtered);
  }, [appointments, dateRangeStart, dateRangeEnd, serviceFilter, statusFilter]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const fetchData = async () => {
    try {
      // TODO: Replace with actual API calls
      const mockAppointments: Appointment[] = [
        {
          id: "1",
          patientName: "João Silva",
          patientEmail: "joao@email.com",
          patientPhone: "(11) 99999-9999",
          serviceName: "Consulta de Avaliação",
          startsAt: new Date("2024-12-20T10:00:00Z"),
          endsAt: new Date("2024-12-20T11:00:00Z"),
          status: "confirmed",
          observations: "Primeira consulta",
        },
        {
          id: "2",
          patientName: "Maria Santos",
          patientEmail: "maria@email.com",
          patientPhone: "(11) 88888-8888",
          serviceName: "Limpeza e Profilaxia",
          startsAt: new Date("2024-12-20T14:00:00Z"),
          endsAt: new Date("2024-12-20T14:45:00Z"),
          status: "done",
        },
        {
          id: "3",
          patientName: "Pedro Costa",
          patientEmail: "pedro@email.com",
          patientPhone: "(11) 77777-7777",
          serviceName: "Tratamento de Canal",
          startsAt: new Date("2024-12-21T09:00:00Z"),
          endsAt: new Date("2024-12-21T10:30:00Z"),
          status: "cancelled",
          observations: "Paciente solicitou cancelamento",
        },
      ];

      const mockServices: Service[] = [
        {
          id: "1",
          name: "Limpeza Dental Profunda",
          slug: "limpeza-dental-profunda",
          description: "A limpeza profissional, também conhecida como profilaxia, é fundamental para a saúde bucal.",
          durationMin: 40,
          priceCents: 8000,
          active: true,
        },
        {
          id: "2",
          name: "Clareamento Dental",
          slug: "clareamento-dental",
          description: "O clareamento dental é um procedimento seguro e eficaz que remove pigmentações.",
          durationMin: 60,
          priceCents: 30000,
          active: true,
        },
        {
          id: "3",
          name: "Tratamento de Canal (Endodontia)",
          slug: "tratamento-canal-endodontia",
          description: "O tratamento de canal é necessário quando a polpa dentária está inflamada ou infectada.",
          durationMin: 90,
          priceCents: 35000,
          active: true,
        },
      ];

      setAppointments(mockAppointments);
      setServices(mockServices);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (
    appointmentId: string,
    newStatus: Appointment["status"]
  ) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === appointmentId ? { ...apt, status: newStatus } : apt
      )
    );
  };

  const viewAppointmentDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsDialogOpen(true);
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: Appointment["status"]) => {
    const statusConfig = appointmentStatuses.find((s) => s.value === status);
    return (
      <Badge variant={statusConfig?.variant || "default"}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const clearFilters = () => {
    setDateRangeStart("");
    setDateRangeEnd("");
    setServiceFilter("");
    setStatusFilter("");
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Carregando agendamentos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Agendamentos</h2>
        <Button variant="outline" onClick={clearFilters}>
          Limpar Filtros
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateStart">Data Início</Label>
              <Input
                id="dateStart"
                type="date"
                value={dateRangeStart}
                onChange={(e) => setDateRangeStart(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateEnd">Data Fim</Label>
              <Input
                id="dateEnd"
                type="date"
                value={dateRangeEnd}
                onChange={(e) => setDateRangeEnd(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceFilter">Serviço</Label>
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os serviços" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os serviços</SelectItem>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.name}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="statusFilter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os status</SelectItem>
                  {appointmentStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
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
                      <div className="text-sm text-muted-foreground">
                        {appointment.patientEmail}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{appointment.serviceName}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {formatDate(appointment.startsAt.toISOString())}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewAppointmentDetails(appointment)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      {appointment.status === "confirmed" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              updateAppointmentStatus(appointment.id, "done")
                            }
                            className="text-green-600"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              updateAppointmentStatus(
                                appointment.id,
                                "cancelled"
                              )
                            }
                            className="text-red-600"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Appointment Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Agendamento</DialogTitle>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-6">
              {/* Patient Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Informações do Paciente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {selectedAppointment.patientName}
                      </p>
                      <p className="text-sm text-muted-foreground">Nome</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {selectedAppointment.patientEmail}
                      </p>
                      <p className="text-sm text-muted-foreground">E-mail</p>
                    </div>
                  </div>

                  {selectedAppointment.patientPhone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {selectedAppointment.patientPhone}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Telefone
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Appointment Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Detalhes do Agendamento
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {selectedAppointment.serviceName}
                      </p>
                      <p className="text-sm text-muted-foreground">Serviço</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {formatDate(selectedAppointment.startsAt.toISOString())}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Data e Hora
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">
                      {getStatusBadge(selectedAppointment.status)}
                    </Badge>
                    <p className="text-sm text-muted-foreground">Status</p>
                  </div>
                </div>
              </div>

              {/* Observations */}
              {selectedAppointment.observations && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Observações</h3>
                  <p className="text-muted-foreground">
                    {selectedAppointment.observations}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-2">
                {selectedAppointment.status === "confirmed" && (
                  <>
                    <Button
                      onClick={() => {
                        updateAppointmentStatus(selectedAppointment.id, "done");
                        setIsDetailsDialogOpen(false);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Marcar como Concluído
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        updateAppointmentStatus(
                          selectedAppointment.id,
                          "cancelled"
                        );
                        setIsDetailsDialogOpen(false);
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
